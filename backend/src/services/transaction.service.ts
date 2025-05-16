import mongoose from 'mongoose';
import TransactionModel, { ITransaction, TransactionType, ITransactionItemDetail, ITransactionPaymentDetail, IProfitDetail } from '../models/TransactionModel';
import GameItemModel, { IGameItem, IAverageCost } from '../models/GameItemModel';
import FundingSourceModel, { IFundingSource } from '../models/FundingSourceModel';
import AppSettingsModel, { IAppSettings } from '../models/AppSettingsModel';
import { getConversionRate } from './ExchangeRateService';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

// Interfaz para los datos necesarios para procesar una compra de GameItem
interface IProcessGameItemPurchaseData {
  operatorUserId: mongoose.Types.ObjectId | string;
  transactionDate: Date;
  itemDetails: ITransactionItemDetail; // Debe incluir itemId, quantity, unitPrice, currency
  paymentDetails: ITransactionPaymentDetail; // Debe incluir fundingSourceId, amount, currency
  contactId?: mongoose.Types.ObjectId | string;
  notes?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'failed' | 'requires_attention';
}

// Interfaz para los datos necesarios para procesar una venta de GameItem
interface IProcessGameItemSaleData extends IProcessGameItemPurchaseData {
  // No campos adicionales por ahora, pero podría tener para comisiones, etc.
}

export class TransactionService {
  private static async getAppSettings(): Promise<IAppSettings | null> {
    const appSettings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });
    if (!appSettings) {
      logger.error('AppSettings (global_settings) no encontradas en la base de datos.');
    }
    return appSettings;
  }

  /**
   * Procesa una transacción de COMPRA_ITEM_JUEGO.
   * - Valida los datos de entrada.
   * - Actualiza el stock del GameItem (incrementa).
   * - Actualiza el costo promedio del GameItem.
   * - Actualiza el saldo de la FundingSource (decrementa).
   * - Crea y guarda el documento de la transacción.
   * @param data Datos para la compra del ítem.
   * @returns La transacción creada.
   */
  static async processGameItemPurchase(data: IProcessGameItemPurchaseData): Promise<ITransaction> {
    const { operatorUserId, transactionDate, itemDetails, paymentDetails, contactId, notes, status } = data;

    if (!itemDetails || !itemDetails.itemId || typeof itemDetails.quantity !== 'number' || itemDetails.quantity <= 0) {
      throw new AppError('Detalles del ítem inválidos o incompletos para la compra.', 400);
    }
    if (!itemDetails.unitPrice || typeof itemDetails.unitPrice.amount !== 'number' || !itemDetails.unitPrice.currency) {
      throw new AppError('Precio unitario del ítem inválido o incompleto.', 400);
    }
    if (!paymentDetails || !paymentDetails.fundingSourceId || typeof paymentDetails.amount !== 'number' || paymentDetails.amount <= 0) {
      throw new AppError('Detalles del pago inválidos o incompletos para la compra.', 400);
    }
     // Validación básica de que el monto pagado coincida con el costo total del item
    // En un escenario real, esto podría ser más complejo con impuestos, descuentos, etc.
    const expectedPaymentAmount = itemDetails.quantity * itemDetails.unitPrice.amount;
    if (Math.abs(paymentDetails.amount - expectedPaymentAmount) > 0.001) { // Usar una pequeña tolerancia para flotantes
        logger.warn(`Monto de pago ${paymentDetails.amount} ${paymentDetails.currency} no coincide con el esperado ${expectedPaymentAmount} para ${itemDetails.quantity} x ${itemDetails.unitPrice.amount}`);
      // Considerar si esto debe ser un error que detenga la transacción o solo una advertencia.
      // Por ahora, lo dejamos como advertencia y continuamos, asumiendo que paymentDetails.amount es el correcto.
    }

    const appSettings = await this.getAppSettings();
    if (!appSettings) {
      throw new AppError('Configuración de la aplicación no encontrada, no se puede procesar la transacción.', 500);
    }
    const refCurrency = appSettings.defaultReferenceCurrency.toUpperCase();

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const gameItem = await GameItemModel.findById(itemDetails.itemId).session(session);
      if (!gameItem) {
        throw new AppError(`GameItem con ID ${itemDetails.itemId} no encontrado.`, 404);
      }
      if (!gameItem.managesStock) {
        throw new AppError(`El GameItem ${gameItem.name} no gestiona stock. No se puede procesar la compra.`, 400);
      }

      const fundingSource = await FundingSourceModel.findById(paymentDetails.fundingSourceId).session(session);
      if (!fundingSource) {
        throw new AppError(`FundingSource con ID ${paymentDetails.fundingSourceId} no encontrada.`, 404);
      }
      if (fundingSource.currency !== paymentDetails.currency) {
         throw new AppError(
          `La moneda de la fuente de fondos (${fundingSource.currency}) no coincide con la moneda del pago (${paymentDetails.currency}). Se requiere conversión previa o ajuste.`, 
          400
        );
      }
      if (fundingSource.currentBalance < paymentDetails.amount) {
        throw new AppError(
          `Saldo insuficiente en la fuente de fondos ${fundingSource.name} (${fundingSource.currentBalance} ${fundingSource.currency}) para cubrir el pago de ${paymentDetails.amount} ${paymentDetails.currency}.`,
          400
        );
      }

      const previousFundingSourceBalance = fundingSource.currentBalance;
      fundingSource.currentBalance -= paymentDetails.amount;
      // Aquí también se podría actualizar fundingSource.lastTransactionDate si es relevante

      // Actualizar stock y costo promedio del GameItem
      const oldStock = gameItem.currentStock;
      const purchaseQuantity = itemDetails.quantity;
      const purchaseUnitPriceInTxCurrency = itemDetails.unitPrice.amount;
      const purchaseCurrency = itemDetails.unitPrice.currency.toUpperCase();

      gameItem.currentStock += purchaseQuantity;

      // Actualizar averageCostRef en la moneda de referencia
      let costOfPurchaseInRefCurrency: number;
      const conversionRateToRef = getConversionRate(purchaseCurrency, refCurrency, appSettings);
      if (conversionRateToRef === null) {
        throw new AppError(`No se pudo obtener la tasa de conversión de ${purchaseCurrency} a ${refCurrency}.`, 500);
      }
      costOfPurchaseInRefCurrency = purchaseUnitPriceInTxCurrency * conversionRateToRef;

      let newAverageCostAmount: number;
      if (gameItem.averageCostRef && typeof gameItem.averageCostRef.amount === 'number' && gameItem.averageCostRef.currency === refCurrency) {
        const oldTotalCostInRef = oldStock * gameItem.averageCostRef.amount;
        const purchaseTotalCostInRef = purchaseQuantity * costOfPurchaseInRefCurrency;
        const newTotalStock = oldStock + purchaseQuantity;
        if (newTotalStock > 0) {
          newAverageCostAmount = (oldTotalCostInRef + purchaseTotalCostInRef) / newTotalStock;
        } else {
          newAverageCostAmount = costOfPurchaseInRefCurrency; 
        }
      } else {
        newAverageCostAmount = costOfPurchaseInRefCurrency;
        if (gameItem.averageCostRef && gameItem.averageCostRef.currency !== refCurrency) {
            logger.warn(`La moneda de averageCostRef existente (${gameItem.averageCostRef.currency}) para ${gameItem.name} no era la de referencia (${refCurrency}). Se está sobrescribiendo.`);
        }
      }
      gameItem.averageCostRef = { amount: newAverageCostAmount, currency: refCurrency };
      
      await gameItem.save({ session });
      await fundingSource.save({ session });

      const transactionData: Partial<ITransaction> = {
        transactionDate,
        type: 'COMPRA_ITEM_JUEGO',
        operatorUserId: typeof operatorUserId === 'string' ? new mongoose.Types.ObjectId(operatorUserId) : operatorUserId,
        contactId: contactId ? (typeof contactId === 'string' ? new mongoose.Types.ObjectId(contactId) : contactId) : undefined,
        itemDetails: {
            ...itemDetails,
            itemNameSnapshot: gameItem.name, 
            gameIdSnapshot: gameItem.gameId, 
        },
        paymentDetails: {
            ...paymentDetails,
            fundingSourceBalanceBefore: previousFundingSourceBalance,
            fundingSourceBalanceAfter: fundingSource.currentBalance,
            exchangeRatesUsed: purchaseCurrency !== refCurrency ? [{
                fromCurrency: purchaseCurrency,
                toCurrency: refCurrency,
                rate: conversionRateToRef,
                source: 'AppSettings' // O la fuente real de la tasa
            }] : undefined,
            valueInReferenceCurrency: { // Guardar el valor del pago en moneda de referencia
                amount: paymentDetails.amount * (getConversionRate(paymentDetails.currency, refCurrency, appSettings) || 0), // Si es null, será 0. Considerar manejo de error.
                currency: refCurrency
            }
        },
        notes,
        status: status || 'completed',
      };

      const newTransaction = (await TransactionModel.create([transactionData], { session }))[0];
      
      await session.commitTransaction();
      logger.info(`Compra de GameItem [${gameItem.name}] procesada. TX ID: ${newTransaction._id}. Stock: ${gameItem.currentStock}. Saldo FS [${fundingSource.name}]: ${fundingSource.currentBalance}`);
      return newTransaction;

    } catch (error) {
      await session.abortTransaction();
      logger.error('Error en processGameItemPurchase:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al procesar la compra del ítem.', 500);
    } finally {
      session.endSession();
    }
  }

  /**
   * Procesa una transacción de VENTA_ITEM_JUEGO.
   * - Valida los datos de entrada.
   * - Actualiza el stock del GameItem (decrementa).
   * - Calcula y guarda los detalles de ganancia/pérdida.
   * - Actualiza el saldo de la FundingSource (incrementa).
   * - Crea y guarda el documento de la transacción.
   * @param data Datos para la venta del ítem.
   * @returns La transacción creada.
   */
  static async processGameItemSale(data: IProcessGameItemSaleData): Promise<ITransaction> {
    const { operatorUserId, transactionDate, itemDetails, paymentDetails, contactId, notes, status } = data;

    if (!itemDetails || !itemDetails.itemId || typeof itemDetails.quantity !== 'number' || itemDetails.quantity <= 0) {
      throw new AppError('Detalles del ítem inválidos o incompletos para la venta.', 400);
    }
     if (!itemDetails.unitPrice || typeof itemDetails.unitPrice.amount !== 'number' || !itemDetails.unitPrice.currency) {
      throw new AppError('Precio unitario de venta del ítem inválido o incompleto.', 400);
    }
    if (!paymentDetails || !paymentDetails.fundingSourceId || typeof paymentDetails.amount !== 'number' || paymentDetails.amount <= 0) {
      throw new AppError('Detalles del cobro inválidos o incompletos para la venta.', 400);
    }
    
    const expectedPaymentAmount = itemDetails.quantity * itemDetails.unitPrice.amount;
    if (Math.abs(paymentDetails.amount - expectedPaymentAmount) > 0.001) {
        logger.warn(`Monto de cobro ${paymentDetails.amount} ${paymentDetails.currency} no coincide con el esperado ${expectedPaymentAmount} para ${itemDetails.quantity} x ${itemDetails.unitPrice.amount}`);
      // Similar a la compra, por ahora es una advertencia.
    }

    const appSettings = await this.getAppSettings();
    if (!appSettings) {
      throw new AppError('Configuración de la aplicación no encontrada, no se puede procesar la transacción.', 500);
    }
    const refCurrency = appSettings.defaultReferenceCurrency.toUpperCase();

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const gameItem = await GameItemModel.findById(itemDetails.itemId).session(session);
      if (!gameItem) {
        throw new AppError(`GameItem con ID ${itemDetails.itemId} no encontrado.`, 404);
      }
      if (!gameItem.managesStock) {
        throw new AppError(`El GameItem ${gameItem.name} no gestiona stock. No se puede procesar la venta.`, 400);
      }
      if (gameItem.currentStock < itemDetails.quantity) {
        throw new AppError(`Stock insuficiente para ${gameItem.name}. Stock actual: ${gameItem.currentStock}, Venta solicitada: ${itemDetails.quantity}.`, 400);
      }
      if (!gameItem.averageCostRef || typeof gameItem.averageCostRef.amount !== 'number' || !gameItem.averageCostRef.currency) {
        // En un sistema robusto, podría haber una política para ventas sin costo promedio (ej. error, o asumir costo cero)
        throw new AppError(`Costo promedio no definido o inválido para ${gameItem.name}. No se puede calcular la ganancia.`, 500);
      }
      if (gameItem.averageCostRef.currency !== refCurrency) {
          throw new AppError(`La moneda del costo promedio (${gameItem.averageCostRef.currency}) para ${gameItem.name} no es la moneda de referencia (${refCurrency}). Se requiere ajuste.`, 500);
      }

      const fundingSource = await FundingSourceModel.findById(paymentDetails.fundingSourceId).session(session);
      if (!fundingSource) {
        throw new AppError(`FundingSource con ID ${paymentDetails.fundingSourceId} no encontrada.`, 404);
      }
       if (fundingSource.currency !== paymentDetails.currency) {
         // TODO: Implementar lógica de conversión de moneda si las monedas de pago y FS son diferentes.
         // Por ahora, requerimos que coincidan.
         throw new AppError(
          `La moneda de la fuente de fondos (${fundingSource.currency}) no coincide con la moneda del cobro (${paymentDetails.currency}). Se requiere conversión previa o ajuste.`, 
          400
        );
      }

      const previousFundingSourceBalance = fundingSource.currentBalance;
      fundingSource.currentBalance += paymentDetails.amount;

      gameItem.currentStock -= itemDetails.quantity;

      // Calcular ProfitDetails en la moneda de referencia
      const salePriceInTxCurrency = itemDetails.unitPrice.amount;
      const saleCurrency = itemDetails.unitPrice.currency.toUpperCase();
      const totalSaleAmountInTxCurrency = paymentDetails.amount; // Asumimos que es el total de la venta en su moneda

      const conversionRateSaleToRef = getConversionRate(saleCurrency, refCurrency, appSettings);
      if (conversionRateSaleToRef === null) {
        throw new AppError(`No se pudo obtener la tasa de conversión de ${saleCurrency} a ${refCurrency} para la venta.`, 500);
      }
      const totalSaleAmountInRefCurrency = totalSaleAmountInTxCurrency * conversionRateSaleToRef;
      const costOfGoodsSoldPerUnitInRefCurrency = gameItem.averageCostRef.amount; // Ya está en refCurrency
      const totalCostOfGoodsSoldInRefCurrency = itemDetails.quantity * costOfGoodsSoldPerUnitInRefCurrency;
      const grossProfitInRefCurrency = totalSaleAmountInRefCurrency - totalCostOfGoodsSoldInRefCurrency;
      
      const profitDetails: IProfitDetail = {
        costOfGoods: { amount: totalCostOfGoodsSoldInRefCurrency, currency: refCurrency },
        grossProfit: { amount: grossProfitInRefCurrency, currency: refCurrency },
        // netProfit y commission se pueden añadir después
      };
      
      await gameItem.save({ session });
      await fundingSource.save({ session });

      const transactionData: Partial<ITransaction> = {
        transactionDate,
        type: 'VENTA_ITEM_JUEGO',
        operatorUserId: typeof operatorUserId === 'string' ? new mongoose.Types.ObjectId(operatorUserId) : operatorUserId,
        contactId: contactId ? (typeof contactId === 'string' ? new mongoose.Types.ObjectId(contactId) : contactId) : undefined,
        itemDetails: {
            ...itemDetails,
            itemNameSnapshot: gameItem.name,
            gameIdSnapshot: gameItem.gameId,
        },
        paymentDetails: {
            ...paymentDetails,
            fundingSourceBalanceBefore: previousFundingSourceBalance,
            fundingSourceBalanceAfter: fundingSource.currentBalance,
            exchangeRatesUsed: saleCurrency !== refCurrency ? [{
                fromCurrency: saleCurrency,
                toCurrency: refCurrency,
                rate: conversionRateSaleToRef,
                source: 'AppSettings'
            }] : undefined,
            valueInReferenceCurrency: {
                amount: totalSaleAmountInRefCurrency,
                currency: refCurrency
            }
        },
        profitDetails,
        notes,
        status: status || 'completed',
      };

      const newTransaction = (await TransactionModel.create([transactionData], { session }))[0];

      await session.commitTransaction();
      logger.info(`Venta de GameItem [${gameItem.name}] procesada. TX ID: ${newTransaction._id}. Stock: ${gameItem.currentStock}. Saldo FS [${fundingSource.name}]: ${fundingSource.currentBalance}`);
      return newTransaction;

    } catch (error) {
      await session.abortTransaction();
      logger.error('Error en processGameItemSale:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al procesar la venta del ítem.', 500);
    } finally {
      session.endSession();
    }
  }
} 