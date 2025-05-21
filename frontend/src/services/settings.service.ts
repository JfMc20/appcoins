import api from './api'; // Corregir la ruta de importación
import { AppSettings, SupportedCurrency, ExchangeRateAPI } from '../types/appSettings.types';
import { AxiosResponse, AxiosError } from 'axios'; // Importar tipos de Axios

const API_URL = '/settings'; // URL base para los endpoints de configuración

interface UpdateCurrenciesResponse {
  message: string;
  settings: AppSettings; // Asumiendo que el backend devuelve el objeto AppSettings anidado
}

/**
 * Obtiene la configuración completa de la aplicación (AppSettings).
 * Requiere rol de administrador.
 */
const getAppSettings = (): Promise<AppSettings> => {
  return api.get<AppSettings>(`${API_URL}/admin/appsettings`)
    .then((response: AxiosResponse<AppSettings>) => response.data) // Tipar response
    .catch((error: AxiosError | any) => { // Tipar error
      console.error('Error al obtener AppSettings:', error.response?.data || error.message);
      // Considerar lanzar un error más específico o formateado si es necesario
      throw error.response?.data || error;
    });
};

/**
 * Actualiza la lista de monedas fiat soportadas.
 * Requiere rol de administrador.
 * @param currencies Array de objetos SupportedCurrency (o un subconjunto para actualizar).
 */
const updateSupportedCurrencies = (currencies: SupportedCurrency[]): Promise<AppSettings> => {
  // Esperamos que el backend devuelva un objeto { message: string, settings: AppSettings }
  return api.put<UpdateCurrenciesResponse>(`${API_URL}/admin/supported-currencies`, { currencies })
    .then((response: AxiosResponse<UpdateCurrenciesResponse>) => {
      console.log('Response data in settingsService:', response.data);
      return response.data.settings;
    })
    .catch((error: AxiosError | any) => { // Tipar error
      console.error('Error al actualizar monedas soportadas:', error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Añade una nueva Exchange Rate API.
 * Requiere rol de administrador.
 * @param apiData Datos de la nueva API (ExchangeRateAPI, excluyendo campos como _id).
 */
const addExchangeRateAPI = (apiData: Partial<ExchangeRateAPI>): Promise<AppSettings> => {
  return api.post<AppSettings>(`${API_URL}/admin/exchange-rate-apis`, apiData)
    .then((response: AxiosResponse<AppSettings>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error('Error al añadir Exchange Rate API:', error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Actualiza una Exchange Rate API existente.
 * Requiere rol de administrador.
 * @param apiName Nombre de la API a actualizar.
 * @param updateData Datos a actualizar (Partial<ExchangeRateAPI>).
 */
const updateExchangeRateAPI = (apiName: string, updateData: Partial<ExchangeRateAPI>): Promise<AppSettings> => {
  return api.put<AppSettings>(`${API_URL}/admin/exchange-rate-apis/${apiName}`, updateData)
    .then((response: AxiosResponse<AppSettings>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error(`Error al actualizar Exchange Rate API ${apiName}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Elimina una Exchange Rate API.
 * Requiere rol de administrador.
 * @param apiName Nombre de la API a eliminar.
 */
const deleteExchangeRateAPI = (apiName: string): Promise<AppSettings> => {
  return api.delete<AppSettings>(`${API_URL}/admin/exchange-rate-apis/${apiName}`)
    .then((response: AxiosResponse<AppSettings>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error(`Error al eliminar Exchange Rate API ${apiName}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

// Podríamos añadir más funciones aquí en el futuro si es necesario, como una para actualizar el margen de ganancia.

export const settingsService = {
  getAppSettings,
  updateSupportedCurrencies,
  addExchangeRateAPI,
  updateExchangeRateAPI,
  deleteExchangeRateAPI,
}; 