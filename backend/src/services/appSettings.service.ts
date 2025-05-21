import AppSettingsModel, { IAppSettings, ISupportedFiatCurrency, IExchangeRateAPI } from '../models/AppSettingsModel';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';

/**
 * Service layer for managing AppSettings.
 */
class AppSettingsService {

  /**
   * Retrieves the complete application settings.
   * @returns The AppSettings document or null if not found.
   */
  public async getAppSettings(): Promise<IAppSettings | null> {
    logger.info('[AppSettingsService] Fetching complete AppSettings.');
    try {
      const settings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });
      if (!settings) {
        logger.warn('[AppSettingsService] AppSettings document not found.');
      }
      return settings;
    } catch (error) {
      logger.error('[AppSettingsService] Error fetching AppSettings:', error);
      throw error; // Re-throw the error for the controller to handle
    }
  }

  /**
   * Updates the list of supported fiat currencies in AppSettings.
   * @param currencies - Array of currency updates ({ code: string, isActive: boolean }).
   * @param userId - The ID of the user performing the update (for lastModifiedBy).
   * @returns The updated AppSettings document.
   * @throws Error if settings not found or update fails.
   */
  public async updateSupportedCurrencies(
    currencies: { code: string; isActive: boolean }[],
    userId?: string
  ): Promise<IAppSettings> {
    logger.info('[AppSettingsService] Updating supported fiat currencies.');
    const settings = await this.getAppSettings();

    if (!settings) {
      logger.error('[AppSettingsService] AppSettings not found for currency update.');
      throw new Error('AppSettings not found.'); // Or a more specific custom error
    }

    // Ensure supportedFiatCurrencies is an array (though schema enforces it)
    if (!Array.isArray(settings.supportedFiatCurrencies)) {
        logger.error('[AppSettingsService] supportedFiatCurrencies is not an array.');
        throw new Error('Internal error: supportedFiatCurrencies is not an array.');
    }

    let updatedCount = 0;
    settings.supportedFiatCurrencies.forEach(currencyToUpdate => { // Usar forEach en el array existente
      const currencyUpdate = currencies.find(c => c.code === currencyToUpdate.code);
      if (currencyUpdate) {
        if (currencyToUpdate.isActive !== currencyUpdate.isActive) {
          currencyToUpdate.isActive = currencyUpdate.isActive;
          updatedCount++;
        }
      } else {
        logger.warn(`[AppSettingsService] Currency with code ${currencyToUpdate.code} not found in settings for update.`);
      }
    });

    if (updatedCount > 0) {
      if (userId) {
        settings.lastModifiedBy = new Types.ObjectId(userId);
      }
      await settings.save();
      logger.info(`[AppSettingsService] ${updatedCount} supported fiat currencies updated.`);
    } else {
      logger.info('[AppSettingsService] No changes detected in supported fiat currencies.');
    }

    return settings;
  }

  /**
   * Adds a new exchange rate API to AppSettings.
   * @param apiData - The data for the new API.
   * @param userId - The ID of the user performing the update.
   * @returns The updated AppSettings document.
   * @throws Error if AppSettings not found or API already exists.
   */
  public async addExchangeRateAPI(apiData: IExchangeRateAPI, userId?: string): Promise<IAppSettings> {
    logger.info('[AppSettingsService] Adding new exchange rate API.');
    const settings = await this.getAppSettings();

    if (!settings) {
      logger.error('[AppSettingsService] AppSettings not found for adding API.');
      throw new Error('AppSettings not found.');
    }

    // Ensure exchangeRateAPIs is an array
    if (!Array.isArray(settings.exchangeRateAPIs)) {
        settings.exchangeRateAPIs = []; // Initialize if it's null or undefined
    }

    if (settings.exchangeRateAPIs.some(api => api.name === apiData.name)) {
      logger.warn(`[AppSettingsService] Exchange rate API with name ${apiData.name} already exists.`);
      throw new Error(`Exchange rate API with name ${apiData.name} already exists.`);
    }

    settings.exchangeRateAPIs.push(apiData);

    if (userId) {
      settings.lastModifiedBy = new Types.ObjectId(userId);
    }

    await settings.save();
    logger.info(`[AppSettingsService] Exchange rate API ${apiData.name} added.`);

    return settings;
  }

  /**
   * Updates an existing exchange rate API in AppSettings.
   * @param apiName - The name of the API to update.
   * @param updateData - The data to update.
   * @param userId - The ID of the user performing the update.
   * @returns The updated AppSettings document.
   * @throws Error if AppSettings or API not found.
   */
  public async updateExchangeRateAPI(apiName: string, updateData: Partial<IExchangeRateAPI>, userId?: string): Promise<IAppSettings> {
    logger.info(`[AppSettingsService] Updating exchange rate API: ${apiName}.`);
    const settings = await this.getAppSettings();

    if (!settings) {
      logger.error('[AppSettingsService] AppSettings not found for updating API.');
      throw new Error('AppSettings not found.');
    }

    // Ensure exchangeRateAPIs is an array
    if (!Array.isArray(settings.exchangeRateAPIs)) {
         logger.warn(`[AppSettingsService] Exchange rate APIs array is missing or invalid for update.`);
         throw new Error(`Exchange rate API with name ${apiName} not found.`); // Can't update if array doesn't exist
    }

    const apiIndex = settings.exchangeRateAPIs.findIndex(api => api.name === apiName);

    if (apiIndex === -1) {
      logger.warn(`[AppSettingsService] Exchange rate API with name ${apiName} not found for update.`);
      throw new Error(`Exchange rate API with name ${apiName} not found.`);
    }

    // Apply updates
    settings.exchangeRateAPIs[apiIndex] = { ...settings.exchangeRateAPIs[apiIndex], ...updateData };

    if (userId) {
      settings.lastModifiedBy = new Types.ObjectId(userId);
    }

    await settings.save();
    logger.info(`[AppSettingsService] Exchange rate API ${apiName} updated.`);

    return settings;
  }

  /**
   * Deletes an exchange rate API from AppSettings.
   * @param apiName - The name of the API to delete.
   * @param userId - The ID of the user performing the update.
   * @returns The updated AppSettings document.
   * @throws Error if AppSettings or API not found.
   */
  public async deleteExchangeRateAPI(apiName: string, userId?: string): Promise<IAppSettings> {
    logger.info(`[AppSettingsService] Deleting exchange rate API: ${apiName}.`);
    const settings = await this.getAppSettings();

    if (!settings) {
      logger.error('[AppSettingsService] AppSettings not found for deleting API.');
      throw new Error('AppSettings not found.');
    }

    // Ensure exchangeRateAPIs is an array
     if (!Array.isArray(settings.exchangeRateAPIs)) {
         logger.warn(`[AppSettingsService] Exchange rate APIs array is missing or invalid for deletion.`);
         throw new Error(`Exchange rate API with name ${apiName} not found.`); // Can't delete if array doesn't exist
    }

    const initialLength = settings.exchangeRateAPIs.length;
    settings.exchangeRateAPIs = settings.exchangeRateAPIs.filter(api => api.name !== apiName);

    if (settings.exchangeRateAPIs.length === initialLength) {
      logger.warn(`[AppSettingsService] Exchange rate API with name ${apiName} not found for deletion.`);
      throw new Error(`Exchange rate API with name ${apiName} not found.`);
    }

    if (userId) {
      settings.lastModifiedBy = new Types.ObjectId(userId);
    }

    await settings.save();
    logger.info(`[AppSettingsService] Exchange rate API ${apiName} deleted.`);

    return settings;
  }

  /**
   * Updates the enabled status of a specific exchange rate pair.
   * @param pairKey - The key of the exchange rate pair (e.g., "USDT_VES").
   * @param isEnabled - The new enabled status.
   * @param userId - The ID of the user performing the update.
   * @returns The updated AppSettings document.
   * @throws Error if AppSettings not found or pairKey does not exist in current rates.
   */
  public async updateExchangeRatePairStatus(
    pairKey: string,
    isEnabled: boolean,
    userId?: string
  ): Promise<IAppSettings> {
    logger.info(`[AppSettingsService] Updating status for exchange rate pair: ${pairKey} to ${isEnabled}.`);
    const settings = await this.getAppSettings();

    if (!settings) {
      logger.error('[AppSettingsService] AppSettings not found for updating exchange rate pair status.');
      throw new Error('AppSettings not found.');
    }

    // Ensure currentExchangeRates is a Map and contains the pairKey
    if (!settings.currentExchangeRates || !(settings.currentExchangeRates instanceof Map) || !settings.currentExchangeRates.has(pairKey)) {
      logger.warn(`[AppSettingsService] Exchange rate pair ${pairKey} not found in current rates.`);
      throw new Error(`Exchange rate pair ${pairKey} not found.`); // Frontend can handle 404
    }

    // Get the specific rate detail and update its isEnabled status
    const rateDetail = settings.currentExchangeRates.get(pairKey);
    
    // IMPORTANT: The ICurrentRateDetail interface in AppSettingsModel MUST have an isEnabled field for this to work.
    // If ICurrentRateDetail does not have isEnabled, you will need to update the Mongoose model definition.
    // Assuming ICurrentRateDetail has isEnabled:
    if (rateDetail && rateDetail.isEnabled !== isEnabled) {
        (rateDetail as any).isEnabled = isEnabled; // Cast to any if ICurrentRateDetail doesn't have isEnabled yet
        settings.currentExchangeRates.set(pairKey, rateDetail);
        
        if (userId) {
          settings.lastModifiedBy = new Types.ObjectId(userId);
        }

        await settings.save();
        logger.info(`[AppSettingsService] Exchange rate pair ${pairKey} status updated to ${isEnabled}.`);
    } else {
         logger.info(`[AppSettingsService] Exchange rate pair ${pairKey} status was already ${isEnabled} or rateDetail not found.`);
    }
    
    // Return the full updated settings object
    return settings;
  }

}

export const appSettingsService = new AppSettingsService(); 