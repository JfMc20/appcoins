import GameItemModel, { IGameItem, IPricingStrategy } from '../models/GameItemModel';
import ExternalProductModel, { IExternalProduct, IMoneyAmount } from '../models/ExternalProductModel';
import { AppError, NotFoundError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

// Tipos para los datos de entrada (DTOs) que el servicio espera
interface UpdateGameItemPricingData {
  strategy?: 'fixed' | 'margin' | 'other';
  referenceCurrency?: string;
  sellPricePerUnit?: number;
  buyPricePerUnit?: number;
  // lastUpdated se manejará automáticamente o se podría pasar opcionalmente
}

interface UpdateExternalProductPricingData {
  price?: IMoneyAmount;
  cost?: IMoneyAmount;
}

class PricingService {
  /**
   * Actualiza la información de precios para un GameItem.
   * @param itemId ID del GameItem a actualizar.
   * @param pricingData Nuevos datos de precios.
   * @returns El GameItem actualizado.
   */
  static async updateGameItemPricing(
    itemId: string,
    pricingData: UpdateGameItemPricingData
  ): Promise<IGameItem | null> {
    try {
      const gameItem = await GameItemModel.findById(itemId);
      if (!gameItem) {
        return null; // O lanzar NotFoundError si se prefiere que el controlador lo maneje
      }

      // Actualizar el objeto pricing
      // Si gameItem.pricing no existe, lo inicializa
      gameItem.pricing = gameItem.pricing || { strategy: 'fixed', referenceCurrency: 'USDT' };

      if (pricingData.strategy) gameItem.pricing.strategy = pricingData.strategy;
      if (pricingData.referenceCurrency) gameItem.pricing.referenceCurrency = pricingData.referenceCurrency;
      if (typeof pricingData.sellPricePerUnit === 'number') gameItem.pricing.sellPricePerUnit = pricingData.sellPricePerUnit;
      if (typeof pricingData.buyPricePerUnit === 'number') gameItem.pricing.buyPricePerUnit = pricingData.buyPricePerUnit;
      gameItem.pricing.lastUpdated = new Date();
      
      // Marcar el path 'pricing' como modificado si es un Mixed type o para asegurar la actualización de subdocumentos
      gameItem.markModified('pricing');

      await gameItem.save();
      logger.info(`Servicio: Precios actualizados para GameItem ID: ${itemId}`);
      return gameItem;
    } catch (error) {
      logger.error(`Error en PricingService.updateGameItemPricing para ${itemId}:`, error);
      throw new AppError('Error al actualizar los precios del GameItem.', 500);
    }
  }

  /**
   * Actualiza la información de precio y/o costo para un ExternalProduct.
   * @param productId ID del ExternalProduct a actualizar.
   * @param pricingData Nuevos datos de precio y/o costo.
   * @returns El ExternalProduct actualizado.
   */
  static async updateExternalProductPricing(
    productId: string,
    pricingData: UpdateExternalProductPricingData
  ): Promise<IExternalProduct | null> {
    try {
      const externalProduct = await ExternalProductModel.findById(productId);
      if (!externalProduct) {
        return null; // O lanzar NotFoundError
      }

      let updated = false;
      if (pricingData.price) {
        externalProduct.price = pricingData.price;
        updated = true;
      }
      if (pricingData.cost) {
        externalProduct.cost = pricingData.cost;
        updated = true;
      }

      if (updated) {
        // Marcar paths si es necesario, aunque la asignación directa a `price` y `cost` debería ser suficiente.
        // externalProduct.markModified('price');
        // externalProduct.markModified('cost');
        await externalProduct.save();
        logger.info(`Servicio: Precios/costo actualizados para ExternalProduct ID: ${productId}`);
      } else {
        logger.info(`Servicio: No se proporcionaron datos de precio o costo para ExternalProduct ID: ${productId}, no se realizaron cambios.`);
      }
      
      return externalProduct;
    } catch (error) {
      logger.error(`Error en PricingService.updateExternalProductPricing para ${productId}:`, error);
      throw new AppError('Error al actualizar los precios/costo del ExternalProduct.', 500);
    }
  }
}

export default PricingService; 