import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler'; // Middleware para manejo de errores async
import { AppError, NotFoundError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import GameItemModel from '../models/GameItemModel'; // Para tipos, si es necesario
import ExternalProductModel from '../models/ExternalProductModel'; // Para tipos
import PricingService from '../services/PricingService'; // Asumiendo este servicio

// Placeholder para los tipos de entrada del DTO (Data Transfer Object)
// Estos deberían definirse con más detalle, posiblemente usando una librería de validación como Zod o Joi
interface UpdateGameItemPricingDTO {
  strategy?: 'fixed' | 'margin' | 'other';
  referenceCurrency?: string;
  sellPricePerUnit?: number;
  buyPricePerUnit?: number;
}

interface UpdateExternalProductPricingDTO {
  price?: { amount: number; currency: string };
  cost?: { amount: number; currency: string };
}

export const updateGameItemPricing = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const pricingData = req.body as UpdateGameItemPricingDTO;

    if (!itemId) {
      return next(new AppError('El ID del GameItem es requerido.', 400));
    }
    if (!pricingData || Object.keys(pricingData).length === 0) {
      return next(new AppError('Los datos de precios son requeridos.', 400));
    }

    // Aquí se llamaría al servicio de precios
    const updatedGameItem = await PricingService.updateGameItemPricing(itemId, pricingData);

    if (!updatedGameItem) {
      return next(new NotFoundError('GameItem no encontrado o no se pudo actualizar.'));
    }

    logger.info(`Precios actualizados para GameItem ID: ${itemId}`);
    res.status(200).json(updatedGameItem);
  }
);

export const updateExternalProductPricing = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const pricingData = req.body as UpdateExternalProductPricingDTO;

    if (!productId) {
      return next(new AppError('El ID del ExternalProduct es requerido.', 400));
    }
    if (!pricingData || Object.keys(pricingData).length === 0) {
      return next(new AppError('Los datos de precios son requeridos.', 400));
    }

    // Aquí se llamaría al servicio de precios
    const updatedExternalProduct = await PricingService.updateExternalProductPricing(productId, pricingData);

    if (!updatedExternalProduct) {
      return next(new NotFoundError('ExternalProduct no encontrado o no se pudo actualizar.'));
    }

    logger.info(`Precios actualizados para ExternalProduct ID: ${productId}`);
    res.status(200).json(updatedExternalProduct);
  }
); 