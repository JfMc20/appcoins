import axios from 'axios';
import { 
  FundingSource,
  CreateFundingSourceData, 
  UpdateFundingSourceData, 
  FundingSourceResponse, 
  FundingSourceListResponse 
} from '../types/fundingSource.types';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/funding-sources`;

// Obtener todas las fuentes de fondos
const getAllFundingSources = (): Promise<FundingSource[]> => {
  return axios.get<FundingSourceListResponse>(API_URL)
    .then(response => response.data.data);
};

// Obtener fuentes de fondos activas
const getActiveFundingSources = (): Promise<FundingSource[]> => {
  return axios.get<FundingSourceListResponse>(`${API_URL}/active`)
    .then(response => response.data.data);
};

// Obtener fuentes de fondos por tipo
const getFundingSourcesByType = (type: string): Promise<FundingSource[]> => {
  return axios.get<FundingSourceListResponse>(`${API_URL}/by-type/${type}`)
    .then(response => response.data.data);
};

// Obtener fuentes de fondos por moneda
const getFundingSourcesByCurrency = (currency: string): Promise<FundingSource[]> => {
  return axios.get<FundingSourceListResponse>(`${API_URL}/by-currency/${currency}`)
    .then(response => response.data.data);
};

// Obtener una fuente de fondos por ID
const getFundingSourceById = (id: string): Promise<FundingSource> => {
  return axios.get<FundingSourceResponse>(`${API_URL}/${id}`)
    .then(response => response.data.data);
};

// Crear una nueva fuente de fondos
const createFundingSource = (data: CreateFundingSourceData): Promise<FundingSource> => {
  return axios.post<FundingSourceResponse>(API_URL, data)
    .then(response => response.data.data);
};

// Actualizar una fuente de fondos existente
const updateFundingSource = (id: string, data: UpdateFundingSourceData): Promise<FundingSource> => {
  return axios.put<FundingSourceResponse>(`${API_URL}/${id}`, data)
    .then(response => response.data.data);
};

// Actualizar solo el saldo de una fuente de fondos
const updateFundingSourceBalance = (id: string, balance: number): Promise<FundingSource> => {
  return axios.patch<FundingSourceResponse>(`${API_URL}/${id}/balance`, { currentBalance: balance })
    .then(response => response.data.data);
};

// Eliminar una fuente de fondos
const deleteFundingSource = (id: string): Promise<void> => {
  return axios.delete(`${API_URL}/${id}`);
};

const fundingSourceService = {
  getAllFundingSources,
  getActiveFundingSources,
  getFundingSourcesByType,
  getFundingSourcesByCurrency,
  getFundingSourceById,
  createFundingSource,
  updateFundingSource,
  updateFundingSourceBalance,
  deleteFundingSource
};

export default fundingSourceService; 