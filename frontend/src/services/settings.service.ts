import api from './api'; // Corregir la ruta de importación
import { AppSettings, SupportedCurrency } from '../types/appSettings.types';
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
 * @param currencies Array de objetos SupportedCurrency.
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

// Podríamos añadir más funciones aquí en el futuro si es necesario, como una para actualizar el margen de ganancia.

export const settingsService = {
  getAppSettings,
  updateSupportedCurrencies,
}; 