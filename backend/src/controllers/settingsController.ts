import { Request, Response, NextFunction } from 'express';
import AppSettingsModel from '../models/AppSettingsModel';
import { logger } from '../utils/logger';
import { updateFiatExchangeRates } from '../services/ExchangeRateService';
import { Types } from 'mongoose';

/**
 * Obtiene las tasas de cambio actuales almacenadas en AppSettings.
 */
export const getExchangeRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });

    if (!settings || !settings.currentExchangeRates) {
      logger.warn('AppSettings o currentExchangeRates no encontrados al solicitar tasas.');
      // Decidir si devolver un objeto vacío, null, o un error 404.
      // Devolver un objeto vacío puede ser más fácil para el frontend.
      res.status(200).json({}); // O res.status(404).json({ message: 'Tasas no encontradas' });
      return;
    }

    // Convertir el Map a un objeto simple para la respuesta JSON
    const ratesObject = Object.fromEntries(settings.currentExchangeRates);

    logger.info('Tasas de cambio actuales solicitadas y enviadas.');
    res.status(200).json(ratesObject);

  } catch (error) {
    logger.error('Error al obtener las tasas de cambio:', error);
    // Pasar el error al middleware de manejo de errores (si tienes uno)
    next(error);
    // O enviar una respuesta genérica de error
    // res.status(500).json({ message: 'Error interno del servidor al obtener tasas.' });
  }
};

/**
 * Obtiene la configuración completa de AppSettings.
 * Solo para administradores.
 */
export const getAppSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para obtener AppSettings completa recibida.');
  try {
    const settings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });

    if (!settings) {
      logger.warn('[Controller] AppSettings no encontradas al solicitar configuración completa.');
      res.status(404).json({ message: 'Configuración de la aplicación no encontrada.' });
      return;
    }

    logger.info('[Controller] AppSettings completas enviadas.');
    res.status(200).json(settings);

  } catch (error) {
    logger.error('[Controller] Error al obtener AppSettings completas:', error);
    next(error);
  }
};

/**
 * Dispara manualmente la actualización de las tasas de cambio.
 */
export const refreshExchangeRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para refrescar tasas de cambio recibida.');
  try {
    await updateFiatExchangeRates();
    logger.info('[Controller] Actualización de tasas de cambio completada exitosamente.');
    res.status(200).json({ message: 'Tasas de cambio actualizadas exitosamente.' });
  } catch (error) {
    logger.error('[Controller] Error al refrescar las tasas de cambio:', error);
    // Considerar si el error de updateFiatExchangeRates ya es logueado por el servicio
    // y si se debe devolver un error 500 más genérico al cliente.
    res.status(500).json({ message: 'Error al actualizar las tasas de cambio.', error: (error instanceof Error) ? error.message : 'Error desconocido' });
    // No llamamos a next(error) aquí para dar una respuesta JSON específica de este endpoint
  }
};

/**
 * Actualiza la lista de monedas fiat soportadas en AppSettings.
 * Solo para administradores.
 * Espera en req.body un array de objetos: { code: string, isActive: boolean }
 */
export const updateSupportedCurrencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para actualizar monedas fiat soportadas recibida.');
  const { currencies } = req.body; // Espera un objeto { currencies: [ { code: string, isActive: boolean }, ... ] }

  if (!Array.isArray(currencies) || currencies.some(c => typeof c.code !== 'string' || typeof c.isActive !== 'boolean')) {
    logger.warn('[Controller] Datos inválidos para actualizar monedas fiat soportadas.');
    res.status(400).json({ message: 'Datos inválidos. Se espera un array de objetos { code: string, isActive: boolean }.' });
    return;
  }

  try {
    const settings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });

    if (!settings) {
      logger.error('[Controller] AppSettings no encontradas al intentar actualizar monedas.');
      res.status(404).json({ message: 'Configuración de la aplicación no encontrada.' });
      return;
    }

    let updatedCount = 0;
    currencies.forEach(currencyUpdate => {
      const currencyToUpdate = settings.supportedFiatCurrencies.find(c => c.code === currencyUpdate.code);
      if (currencyToUpdate) {
        if (currencyToUpdate.isActive !== currencyUpdate.isActive) {
          currencyToUpdate.isActive = currencyUpdate.isActive;
          updatedCount++;
        }
      } else {
        logger.warn(`[Controller] Moneda con código ${currencyUpdate.code} no encontrada en la configuración para actualizar.`);
        // Opcionalmente, se podría decidir añadirla si no existe, pero por ahora solo actualizamos existentes.
      }
    });

    if (updatedCount > 0) {
      if (req.user && req.user._id) {
        settings.lastModifiedBy = req.user._id as Types.ObjectId;
      }
      await settings.save();
      logger.info(`[Controller] ${updatedCount} monedas fiat soportadas actualizadas.`);
      res.status(200).json({ message: `${updatedCount} monedas actualizadas exitosamente.`, settings: settings });
    } else {
      logger.info('[Controller] No hubo cambios en las monedas fiat soportadas.');
      res.status(200).json({ message: 'No se realizaron cambios.', settings: settings });
    }

  } catch (error) {
    logger.error('[Controller] Error al actualizar monedas fiat soportadas:', error);
    next(error);
  }
}; 