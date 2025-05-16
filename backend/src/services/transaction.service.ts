import mongoose from 'mongoose';
import TransactionModel, { ITransaction, TransactionType, ITransactionItemDetail, ITransactionPaymentDetail, IProfitDetail } from '../models/TransactionModel';
import GameItemModel, { IGameItem } from '../models/GameItemModel';
import FundingSourceModel, { IFundingSource } from '../models/FundingSourceModel';
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
      const purchasePricePerUnitInItemCurrency = itemDetails.unitPrice.amount;
      // const purchaseCurrency = itemDetails.unitPrice.currency;

      gameItem.currentStock += purchaseQuantity;

      // TODO: Lógica para actualizar averageCostRef.
      // Esto es complejo si las monedas difieren o si averageCostRef no existe.
      // Por ahora, un placeholder simple. Se necesitará una moneda de referencia y conversión.
      // Asumimos que averageCostRef y la compra están en la misma moneda por ahora para simplificar:
      if (gameItem.averageCostRef && gameItem.averageCostRef.currency === itemDetails.unitPrice.currency) {
        const oldTotalCost = oldStock * gameItem.averageCostRef.amount;
        const purchaseTotalCost = purchaseQuantity * purchasePricePerUnitInItemCurrency;
        const newTotalStock = oldStock + purchaseQuantity;
        if (newTotalStock > 0) {
            gameItem.averageCostRef.amount = (oldTotalCost + purchaseTotalCost) / newTotalStock;
        } else {
            gameItem.averageCostRef.amount = purchasePricePerUnitInItemCurrency; // Si no había stock, el nuevo costo es el de compra
        }
      } else {
        // Inicializar o recalcular averageCostRef si la moneda es diferente o no existe.
        // Esto requiere una estrategia de conversión a una moneda de referencia (ej. USDT).
        // Por ahora, si no existe o la moneda no coincide, establecemos el costo de esta compra.
        // ¡¡ESTO ES UNA SIMPLIFICACIÓN Y DEBE MEJORARSE!!
        gameItem.averageCostRef = {
            amount: purchasePricePerUnitInItemCurrency,
            currency: itemDetails.unitPrice.currency,
        };
        logger.warn(`AverageCostRef para ${gameItem.name} fue establecido/reemplazado. Se necesita mejorar la lógica de conversión de moneda.`);
      }
      
      await gameItem.save({ session });
      await fundingSource.save({ session });

      const transactionData: Partial<ITransaction> = {
        transactionDate,
        type: 'COMPRA_ITEM_JUEGO',
        operatorUserId: typeof operatorUserId === 'string' ? new mongoose.Types.ObjectId(operatorUserId) : operatorUserId,
        contactId: contactId ? (typeof contactId === 'string' ? new mongoose.Types.ObjectId(contactId) : contactId) : undefined,
        itemDetails: {
            ...itemDetails,
            itemNameSnapshot: gameItem.name, // Guardar el nombre actual del ítem
            gameIdSnapshot: gameItem.gameId, // Guardar el ID del juego actual
        },
        paymentDetails: {
            ...paymentDetails,
            fundingSourceBalanceBefore: previousFundingSourceBalance,
            fundingSourceBalanceAfter: fundingSource.currentBalance,
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

      // Calcular ProfitDetails
      // TODO: Mejorar esto con conversión de moneda a una moneda de referencia común.
      // Asumimos que el precio de venta (paymentDetails.amount) y el costo (averageCostRef.amount)
      // están o pueden convertirse a la misma moneda de referencia para el cálculo de ganancia.
      // Por ahora, una simplificación grande si las monedas no coinciden.
      let costOfGoodsAmount = 0;
      let grossProfitAmount = 0;
      const profitCurrency = gameItem.averageCostRef.currency; // Usar la moneda del costo como referencia para la ganancia

      if (itemDetails.unitPrice.currency === gameItem.averageCostRef.currency) {
          costOfGoodsAmount = itemDetails.quantity * gameItem.averageCostRef.amount;
          grossProfitAmount = paymentDetails.amount - costOfGoodsAmount; // Asume paymentDetails.amount es el total de la venta
      } else {
          // ¡¡NECESITA MEJORA URGENTE!! Caso donde moneda de venta y moneda de costo difieren.
          // Esto es una placeholder y probablemente incorrecto sin conversión.
          logger.error(`Monedas de venta (${itemDetails.unitPrice.currency}) y costo (${gameItem.averageCostRef.currency}) difieren para ${gameItem.name}. Cálculo de ganancia puede ser incorrecto.`);
          // Podríamos intentar una conversión si tuviéramos tasas, o registrar la ganancia en la moneda de venta
          // y el costo en su moneda, dejando la reconciliación para después.
          // Por ahora, no calcularemos profit si las monedas son diferentes para evitar datos erróneos.
          // O, si paymentDetails.currency es la moneda de referencia, convertir el costo a esa.
           throw new AppError(`Discrepancia de monedas en cálculo de ganancia para ${gameItem.name}. Venta en ${itemDetails.unitPrice.currency}, costo en ${gameItem.averageCostRef.currency}. Funcionalidad no implementada.`, 501);
      }
      
      const profitDetails: IProfitDetail = {
        costOfGoods: { amount: costOfGoodsAmount, currency: profitCurrency },
        grossProfit: { amount: grossProfitAmount, currency: profitCurrency },
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