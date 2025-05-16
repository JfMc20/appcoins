import api from './api'; // Ajusta la ruta si es necesario
import { Price } from '../types/price.types';
import { AxiosResponse, AxiosError } from 'axios';

const API_URL = '/prices'; // URL base para los endpoints de precios

/**
 * Interfaz para los parámetros de consulta al obtener precios.
 */
export interface GetPricesQueryParams {
  entityId?: string;
  entityType?: string;
  priceType?: string;
  currency?: string;
  isActive?: boolean;
}

/**
 * Crea un nuevo precio.
 * @param priceData Datos del precio a crear.
 * @returns El precio creado.
 */
const createPrice = (priceData: Omit<Price, '_id' | 'createdAt' | 'updatedAt'>): Promise<Price> => {
  return api.post<Price>(API_URL, priceData)
    .then((response: AxiosResponse<Price>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error('Error al crear el precio:', error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Obtiene precios basados en los parámetros de consulta.
 * @param params Parámetros de consulta.
 * @returns Un array de precios.
 */
const getPrices = (params?: GetPricesQueryParams): Promise<Price[]> => {
  return api.get<Price[]>(API_URL, { params })
    .then((response: AxiosResponse<Price[]>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error('Error al obtener precios:', error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Obtiene un precio específico por su ID.
 * @param priceId El ID del precio.
 * @returns El precio encontrado.
 */
const getPriceById = (priceId: string): Promise<Price> => {
  return api.get<Price>(`${API_URL}/${priceId}`)
    .then((response: AxiosResponse<Price>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error(`Error al obtener el precio con ID ${priceId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Actualiza un precio existente.
 * @param priceId El ID del precio a actualizar.
 * @param priceData Los datos a actualizar.
 * @returns El precio actualizado.
 */
const updatePrice = (priceId: string, priceData: Partial<Omit<Price, '_id' | 'entityId' | 'entityType' | 'createdAt' | 'updatedAt'>>): Promise<Price> => {
  return api.put<Price>(`${API_URL}/${priceId}`, priceData)
    .then((response: AxiosResponse<Price>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error(`Error al actualizar el precio con ID ${priceId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

/**
 * Elimina un precio por su ID.
 * @param priceId El ID del precio a eliminar.
 * @returns Un mensaje de confirmación.
 */
const deletePrice = (priceId: string): Promise<{ message: string; _id: string }> => {
  return api.delete<{ message: string; _id: string }>(`${API_URL}/${priceId}`)
    .then((response: AxiosResponse<{ message: string; _id: string }>) => response.data)
    .catch((error: AxiosError | any) => {
      console.error(`Error al eliminar el precio con ID ${priceId}:`, error.response?.data || error.message);
      throw error.response?.data || error;
    });
};

export const priceService = {
  createPrice,
  getPrices,
  getPriceById,
  updatePrice,
  deletePrice,
}; 