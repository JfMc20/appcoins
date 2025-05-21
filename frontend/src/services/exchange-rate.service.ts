import api from './api';
import { API_BASE_URL } from '../config/api.config';
import axios, { AxiosError } from 'axios';

export interface ExchangeRateDetail {
  currentRate?: number;   // Tasa más reciente
  previousRate?: number;  // Tasa anterior
  ask?: number;           // Tasa Ask
  bid?: number;           // Tasa Bid
  change?: number;        // Diferencia numérica
  changePercent?: number; // Cambio porcentual
  lastUpdated?: string;   // Fecha de actualización
  source?: string;        // Fuente de los datos
  isEnabled: boolean;     // Agregar campo para estado habilitado
}

export interface ExchangeRatesMap {
  [pairKey: string]: ExchangeRateDetail;
}

// Para desarrollo, temporalmente eliminamos la autenticación API Key
class ExchangeRateService {
  /**
   * Obtiene las tasas de cambio actuales
   */
  async getExchangeRates(): Promise<ExchangeRatesMap> {
    try {
      console.log('Solicitando tasas al endpoint:', `${API_BASE_URL}/settings/exchange-rates`);
      
      // Intento de conexión directa para depuración
      try {
        const testResponse = await fetch(`${API_BASE_URL}/settings/exchange-rates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'default-dev-key'
          }
        });
        console.log('Test de conexión directa con fetch:', testResponse.status, testResponse.ok);
      } catch (fetchError) {
        console.error('Error en test de conexión con fetch:', fetchError);
      }
      
      const response = await api.get('/settings/exchange-rates');
      console.log('Respuesta recibida:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error al obtener tasas de cambio:', error);
      // Mostrar información más detallada del error
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Detalles del error de respuesta:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          });
        } else if (axiosError.request) {
          console.error('No hubo respuesta del servidor. Verifica la URL y que el servidor esté activo.');
        } else {
          console.error('Error al configurar la petición:', axiosError.message);
        }
      }
      throw error;
    }
  }

  /**
   * Actualiza manualmente las tasas de cambio
   */
  async refreshExchangeRates(): Promise<{ message: string }> {
    try {
      console.log('Actualizando tasas en endpoint:', `${API_BASE_URL}/settings/exchange-rates/refresh`);
      
      // Intento de conexión directa para depuración
      try {
        const testResponse = await fetch(`${API_BASE_URL}/settings/exchange-rates/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'default-dev-key'
          }
        });
        console.log('Test de conexión directa con fetch:', testResponse.status, testResponse.ok);
      } catch (fetchError) {
        console.error('Error en test de conexión con fetch:', fetchError);
      }
      
      const response = await api.post('/settings/exchange-rates/refresh');
      console.log('Respuesta de actualización:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error al actualizar tasas de cambio:', error);
      // Mostrar información más detallada del error
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Detalles del error de respuesta:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          });
        } else if (axiosError.request) {
          console.error('No hubo respuesta del servidor. Verifica la URL y que el servidor esté activo.');
        } else {
          console.error('Error al configurar la petición:', axiosError.message);
        }
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de habilitado de una tasa de cambio
   */
  async updateExchangeRateStatus(pairKey: string, isEnabled: boolean): Promise<any> {
    try {
      console.log(`Actualizando estado de ${pairKey} a ${isEnabled ? 'habilitado' : 'deshabilitado'}`);
      const response = await api.put(`/settings/exchange-rates/${pairKey}/status`, { isEnabled });
      console.log('Respuesta de actualización de estado:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error al actualizar estado de ${pairKey}:`, error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Detalles del error de respuesta:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          });
        } else if (axiosError.request) {
          console.error('No hubo respuesta del servidor. Verifica la URL y que el servidor esté activo.');
        } else {
          console.error('Error al configurar la petición:', axiosError.message);
        }
      }
      throw error;
    }
  }

  /**
   * Formatea una tasa para mostrarla (con 2-4 decimales según magnitud)
   */
  formatRate(rate: number | undefined): string {
    if (rate === undefined) return 'N/A';
    
    // Determinar decimales según la magnitud
    if (rate >= 1000) {
      return rate.toFixed(2);
    } else if (rate >= 10) {
      return rate.toFixed(3);
    } else {
      return rate.toFixed(4);
    }
  }

  /**
   * Formatea el cambio porcentual con un signo + o -
   */
  formatChangePercent(percent: number | undefined): string {
    if (percent === undefined) return 'N/A';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }

  /**
   * Formatea la fecha de actualización
   */
  formatLastUpdated(dateString: string | undefined): string {
    if (!dateString) return 'Desconocido';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  }
}

const exchangeRateService = new ExchangeRateService();
export default exchangeRateService; 