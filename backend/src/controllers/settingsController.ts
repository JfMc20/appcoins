import { Request, Response, NextFunction } from 'express';
import AppSettingsModel from '../models/AppSettingsModel';
import { logger } from '../utils/logger';
import { updateFiatExchangeRates } from '../services/ExchangeRateService';

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

// Aquí irían otras funciones del controlador de settings, como la de refresh manual.

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