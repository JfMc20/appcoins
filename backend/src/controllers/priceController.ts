import { Request, Response, NextFunction } from 'express';
import PriceModel, { IPrice } from '../models/PriceModel';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// TODO: Validar que el entityId corresponda a una entidad existente del entityType dado (ej. que GameItem exista)

/**
 * @description Crear un nuevo precio para una entidad.
 * @route POST /api/prices
 * @access Admin
 */
export const createPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityId, entityType, priceType, currency, value, isActive, validFrom, validTo, region, notes } = req.body;

    // Validación básica de campos requeridos
    if (!entityId || !entityType || !priceType || !currency || value === undefined) {
      res.status(400).json({ message: 'Faltan campos requeridos: entityId, entityType, priceType, currency, value.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      res.status(400).json({ message: 'El entityId proporcionado no es un ObjectId válido.' });
      return;
    }

    // TODO: Aquí podríamos añadir una validación para asegurar que entityId realmente existe
    // en la colección correspondiente a entityType (ej. GameItemModel.findById(entityId))
    // Esto requeriría una lógica más compleja o un servicio que maneje la verificación de entidades.

    const newPrice = new PriceModel({
      entityId,
      entityType,
      priceType,
      currency,
      value,
      isActive,
      validFrom,
      validTo,
      region,
      notes,
    });

    const savedPrice = await newPrice.save();
    logger.info(`[PriceController] Nuevo precio creado con ID: ${savedPrice._id} para entidad ${entityType}/${entityId}`);
    res.status(201).json(savedPrice);

  } catch (error) {
    logger.error('[PriceController] Error al crear precio:', error);
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: 'Error de validación', errors: error.errors });
        return;
    }
    next(error);
  }
};

/**
 * @description Obtener todos los precios para una entidad específica o todos los precios si no se especifica entidad.
 * @route GET /api/prices
 * @access Admin
 * @queryParameters entityId, entityType, priceType, currency, isActive
 */
export const getPrices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query: any = {};
    const { entityId, entityType, priceType, currency, isActive } = req.query;

    if (entityId) {
      if (!mongoose.Types.ObjectId.isValid(entityId as string)) {
        res.status(400).json({ message: 'El entityId proporcionado no es un ObjectId válido.' });
        return;
      }
      query.entityId = entityId;
    }
    if (entityType) query.entityType = entityType as string;
    if (priceType) query.priceType = priceType as string;
    if (currency) query.currency = (currency as string).toUpperCase();
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const prices = await PriceModel.find(query);
    logger.info(`[PriceController] ${prices.length} precios encontrados con los filtros aplicados.`);
    res.status(200).json(prices);

  } catch (error) {
    logger.error('[PriceController] Error al obtener precios:', error);
    next(error);
  }
};

/**
 * @description Obtener un precio específico por su ID.
 * @route GET /api/prices/:priceId
 * @access Admin
 */
export const getPriceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { priceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(priceId)) {
      res.status(400).json({ message: 'El ID de precio proporcionado no es un ObjectId válido.' });
      return;
    }

    const price = await PriceModel.findById(priceId);
    if (!price) {
      logger.warn(`[PriceController] Precio con ID: ${priceId} no encontrado.`);
      res.status(404).json({ message: 'Precio no encontrado.' });
      return;
    }

    logger.info(`[PriceController] Precio con ID: ${priceId} encontrado.`);
    res.status(200).json(price);

  } catch (error) {
    logger.error(`[PriceController] Error al obtener precio con ID: ${req.params.priceId}:`, error);
    next(error);
  }
};

/**
 * @description Actualizar un precio existente.
 * @route PUT /api/prices/:priceId
 * @access Admin
 */
export const updatePrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { priceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(priceId)) {
      res.status(400).json({ message: 'El ID de precio proporcionado no es un ObjectId válido.' });
      return;
    }

    const price = await PriceModel.findById(priceId);
    if (!price) {
      logger.warn(`[PriceController] Precio con ID: ${priceId} no encontrado para actualizar.`);
      res.status(404).json({ message: 'Precio no encontrado.' });
      return;
    }

    // Actualizar campos permitidos
    const { value, currency, priceType, isActive, validFrom, validTo, region, notes } = req.body;
    if (value !== undefined) price.value = value;
    if (currency !== undefined) price.currency = currency;
    if (priceType !== undefined) price.priceType = priceType;
    if (isActive !== undefined) price.isActive = isActive;
    if (validFrom !== undefined) price.validFrom = validFrom;
    if (validTo !== undefined) price.validTo = validTo;
    if (region !== undefined) price.region = region;
    if (notes !== undefined) price.notes = notes;
    // entityId y entityType no deberían ser modificables directamente aquí para evitar inconsistencias.
    // Si se necesita cambiar la entidad, se debería borrar este precio y crear uno nuevo.

    const updatedPrice = await price.save();
    logger.info(`[PriceController] Precio con ID: ${priceId} actualizado.`);
    res.status(200).json(updatedPrice);

  } catch (error) {
    logger.error(`[PriceController] Error al actualizar precio con ID: ${req.params.priceId}:`, error);
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: 'Error de validación', errors: error.errors });
        return;
    }
    next(error);
  }
};

/**
 * @description Eliminar un precio por su ID.
 * @route DELETE /api/prices/:priceId
 * @access Admin
 */
export const deletePrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { priceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(priceId)) {
      res.status(400).json({ message: 'El ID de precio proporcionado no es un ObjectId válido.' });
      return;
    }

    const deletedPrice = await PriceModel.findByIdAndDelete(priceId);

    if (!deletedPrice) {
      logger.warn(`[PriceController] Precio con ID: ${priceId} no encontrado para eliminar.`);
      res.status(404).json({ message: 'Precio no encontrado.' });
      return;
    }

    logger.info(`[PriceController] Precio con ID: ${priceId} eliminado.`);
    res.status(200).json({ message: 'Precio eliminado exitosamente.', _id: priceId });

  } catch (error) {
    logger.error(`[PriceController] Error al eliminar precio con ID: ${req.params.priceId}:`, error);
    next(error);
  }
}; 