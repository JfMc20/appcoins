import api from './api';
import { 
  FundingSource,
  CreateFundingSourceData, 
  UpdateFundingSourceData, 
  FundingSourceResponse, 
  FundingSourceListResponse 
} from '../types/fundingSource.types';

const FUNDING_SOURCES_PATH = '/funding-sources';

// Obtener todas las fuentes de fondos
const getAllFundingSources = (): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(FUNDING_SOURCES_PATH)
    .then(response => response.data);
};

// Obtener fuentes de fondos activas
const getActiveFundingSources = (): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(`${FUNDING_SOURCES_PATH}/active`)
    .then(response => response.data);
};

// Obtener fuentes de fondos por tipo
const getFundingSourcesByType = (type: string): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(`${FUNDING_SOURCES_PATH}/by-type/${type}`)
    .then(response => response.data);
};

// Obtener fuentes de fondos por moneda
const getFundingSourcesByCurrency = (currency: string): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(`${FUNDING_SOURCES_PATH}/by-currency/${currency}`)
    .then(response => response.data);
};

// Obtener una fuente de fondos por ID
const getFundingSourceById = (id: string): Promise<FundingSource> => {
  return api.get<FundingSourceResponse>(`${FUNDING_SOURCES_PATH}/${id}`)
    .then(response => response.data.data);
};

// Crear una nueva fuente de fondos
const createFundingSource = (data: CreateFundingSourceData): Promise<FundingSource> => {
  return api.post<FundingSourceResponse>(FUNDING_SOURCES_PATH, data)
    .then(response => response.data.data);
};

// Actualizar una fuente de fondos existente
const updateFundingSource = (id: string, data: UpdateFundingSourceData): Promise<FundingSource> => {
  return api.put<FundingSourceResponse>(`${FUNDING_SOURCES_PATH}/${id}`, data)
    .then(response => response.data.data);
};

// Eliminar una fuente de fondos
const deleteFundingSource = (id: string): Promise<void> => {
  return api.delete(`${FUNDING_SOURCES_PATH}/${id}`);
};

const fundingSourceService = {
  getAllFundingSources,
  getActiveFundingSources,
  getFundingSourcesByType,
  getFundingSourcesByCurrency,
  getFundingSourceById,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource
};

export default fundingSourceService; 