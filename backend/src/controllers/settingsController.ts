import { Request, Response, NextFunction } from 'express';
import AppSettingsModel, { IAppSettings, ICurrentRateDetail, IExchangeRateAPI } from '../models/AppSettingsModel';
import { logger } from '../utils/logger';
import { updateFiatExchangeRates } from '../services/ExchangeRateService';
import { appSettingsService } from '../services/appSettings.service';

/**
 * Obtiene las tasas de cambio actuales almacenadas en AppSettings.
 */
const getExchangeRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
const getAppSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para obtener AppSettings completa recibida.');
  try {
    const settings = await appSettingsService.getAppSettings();

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
const refreshExchangeRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
const updateSupportedCurrencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para actualizar monedas fiat soportadas recibida.');
  const { currencies } = req.body; // Espera un objeto { currencies: [ { code: string, isActive: boolean }, ... ] }

  if (!Array.isArray(currencies) || currencies.some(c => typeof c.code !== 'string' || typeof c.isActive !== 'boolean')) {
    logger.warn('[Controller] Datos inválidos para actualizar monedas fiat soportadas.');
    res.status(400).json({ message: 'Datos inválidos. Se espera un array de objetos { code: string, isActive: boolean }.' });
    return;
  }

  try {
    const userId = req.user?._id?.toString();
    const updatedSettings = await appSettingsService.updateSupportedCurrencies(currencies, userId);

    logger.info('[Controller] Monedas fiat soportadas actualizadas a través del servicio.');
    res.status(200).json({ message: 'Monedas actualizadas exitosamente.', settings: updatedSettings });

  } catch (error) {
    logger.error('[Controller] Error al actualizar monedas fiat soportadas:', error);
    next(error);
  }
};

/**
 * Adds a new Exchange Rate API to AppSettings.
 * Requires admin role.
 * Expects ExchangeRateAPI data in req.body.
 */
const addExchangeRateAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para añadir nueva Exchange Rate API recibida.');
  const apiData: IExchangeRateAPI = req.body; // Asumimos que el body tiene la estructura correcta

  // Basic validation (can be enhanced with a validation middleware/schema)
  if (!apiData || !apiData.name || typeof apiData.isEnabled !== 'boolean') {
    logger.warn('[Controller] Datos inválidos para añadir Exchange Rate API.');
    res.status(400).json({ message: 'Datos inválidos. Se espera al menos name (string) y isEnabled (boolean).' });
    return;
  }

  try {
    const userId = req.user?._id?.toString();
    const updatedSettings = await appSettingsService.addExchangeRateAPI(apiData, userId);

    logger.info('[Controller] Exchange Rate API añadida a través del servicio.');
    res.status(201).json({ message: 'Exchange Rate API añadida exitosamente.', settings: updatedSettings });

  } catch (error: any) {
    logger.error('[Controller] Error al añadir Exchange Rate API:', error);
    // Check for specific service errors (e.g., API already exists)
    if (error.message.includes('already exists')) {
      res.status(409).json({ message: error.message }); // 409 Conflict
    } else if (error.message.includes('AppSettings not found')) {
       res.status(404).json({ message: error.message }); // 404 Not Found
    }
    else {
      next(error); // Pass other errors to the global error handler
    }
  }
};

/**
 * Updates an existing Exchange Rate API in AppSettings.
 * Requires admin role.
 * Expects apiName in req.params and updateData (Partial<IExchangeRateAPI>) in req.body.
 */
const updateExchangeRateAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para actualizar Exchange Rate API recibida.');
  const apiName: string = req.params.apiName; // Obtener el nombre de la API desde la URL
  const updateData: Partial<IExchangeRateAPI> = req.body; // Asumimos que el body tiene los datos de actualización

  // Basic validation (can be enhanced)
   if (!apiName || Object.keys(updateData).length === 0) {
    logger.warn('[Controller] Datos inválidos para actualizar Exchange Rate API.');
    res.status(400).json({ message: 'Datos inválidos. Se espera un nombre de API en la URL y datos de actualización en el cuerpo.' });
    return;
  }

  try {
    const userId = req.user?._id?.toString();
    const updatedSettings = await appSettingsService.updateExchangeRateAPI(apiName, updateData, userId);

    logger.info('[Controller] Exchange Rate API actualizada a través del servicio.');
    res.status(200).json({ message: 'Exchange Rate API actualizada exitosamente.', settings: updatedSettings });

  } catch (error: any) {
    logger.error('[Controller] Error al actualizar Exchange Rate API:', error);
     if (error.message.includes('not found')) {
       res.status(404).json({ message: error.message }); // 404 Not Found
    }
    else {
      next(error); // Pass other errors to the global error handler
    }
  }
};

/**
 * Deletes an Exchange Rate API from AppSettings.
 * Requires admin role.
 * Expects apiName in req.params.
 */
const deleteExchangeRateAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para eliminar Exchange Rate API recibida.');
  const apiName: string = req.params.apiName; // Obtener el nombre de la API desde la URL

   if (!apiName) {
    logger.warn('[Controller] Nombre de API no proporcionado para eliminar.');
    res.status(400).json({ message: 'Nombre de API no proporcionado.' });
    return;
  }

  try {
    const userId = req.user?._id?.toString();
    const updatedSettings = await appSettingsService.deleteExchangeRateAPI(apiName, userId);

    logger.info('[Controller] Exchange Rate API eliminada a través del servicio.');
    res.status(200).json({ message: 'Exchange Rate API eliminada exitosamente.', settings: updatedSettings });

  } catch (error: any) {
    logger.error('[Controller] Error al eliminar Exchange Rate API:', error);
     if (error.message.includes('not found')) {
       res.status(404).json({ message: error.message }); // 404 Not Found
    }
    else {
      next(error); // Pass other errors to the global error handler
    }
  }
};

/**
 * Updates the enabled status of a specific exchange rate pair.
 * Requires admin role.
 * Expects pairKey in req.params and { isEnabled: boolean } in req.body.
 */
const updateExchangeRatePairStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('[Controller] Solicitud para actualizar estado de tasa de cambio recibida.');
  const pairKey: string = req.params.pairKey; // Obtener el pairKey desde la URL
  const { isEnabled } = req.body; // Obtener isEnabled desde el cuerpo

  // Basic validation
   if (!pairKey || typeof isEnabled !== 'boolean') {
    logger.warn('[Controller] Datos inválidos para actualizar estado de tasa de cambio.');
    res.status(400).json({ message: 'Datos inválidos. Se espera un pairKey en la URL y { isEnabled: boolean } en el cuerpo.' });
    return;
  }

  try {
    const userId = req.user?._id?.toString();
    const updatedSettings = await appSettingsService.updateExchangeRatePairStatus(pairKey, isEnabled, userId);

    logger.info(`[Controller] Estado de tasa de cambio ${pairKey} actualizado a ${isEnabled}.`);
    // Devolvemos las settings completas para que el frontend pueda recargar la vista si es necesario
    res.status(200).json({ message: 'Estado de tasa de cambio actualizado exitosamente.', settings: updatedSettings });

  } catch (error: any) {
    logger.error(`[Controller] Error al actualizar estado de tasa de cambio ${pairKey}:`, error);
     if (error.message.includes('not found')) {
       res.status(404).json({ message: error.message }); // 404 Not Found si el pairKey no existe
    }
    else {
      next(error); // Pass other errors to the global error handler
    }
  }
};

// Combine existing and new exports
export { getExchangeRates, refreshExchangeRates, getAppSettings, updateSupportedCurrencies, addExchangeRateAPI, updateExchangeRateAPI, deleteExchangeRateAPI, updateExchangeRatePairStatus }; 