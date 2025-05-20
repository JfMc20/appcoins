import api from './api'
import type {
  FundingSource,
  CreateFundingSourceData,
  UpdateFundingSourceData,
  FundingSourceResponse,
} from '../types/fundingSource.types'

const FUNDING_SOURCES_PATH = '/funding-sources'

// Obtener todas las fuentes de fondos
const getAllFundingSources = (): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(FUNDING_SOURCES_PATH).then((response) => response.data)
}

// Obtener fuentes de fondos activas
const getActiveFundingSources = (): Promise<FundingSource[]> => {
  return api
    .get<FundingSource[]>(`${FUNDING_SOURCES_PATH}/active`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('http://localhost:5173/funding-sources:', error)
      throw error
    })
}

// Obtener fuentes de fondos por tipo
const getFundingSourcesByType = (type: string): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(`${FUNDING_SOURCES_PATH}/by-type/${type}`).then((response) => response.data)
}

// Obtener fuentes de fondos por moneda
const getFundingSourcesByCurrency = (currency: string): Promise<FundingSource[]> => {
  return api.get<FundingSource[]>(`${FUNDING_SOURCES_PATH}/by-currency/${currency}`).then((response) => response.data)
}

// Obtener una fuente de fondos por ID
const getFundingSourceById = (id: string): Promise<FundingSource> => {
  return api.get<FundingSourceResponse>(`${FUNDING_SOURCES_PATH}/${id}`).then((response) => response.data.data)
}

// Crear una nueva fuente de fondos
const createFundingSource = (data: CreateFundingSourceData): Promise<FundingSource> => {
  return api.post<FundingSourceResponse>(FUNDING_SOURCES_PATH, data).then((response) => response.data.data)
}

// Actualizar una fuente de fondos existente
const updateFundingSource = (id: string, data: UpdateFundingSourceData): Promise<FundingSource> => {
  return api.put<FundingSourceResponse>(`${FUNDING_SOURCES_PATH}/${id}`, data).then((response) => response.data.data)
}

// Eliminar una fuente de fondos
const deleteFundingSource = (id: string): Promise<void> => {
  return api.delete(`${FUNDING_SOURCES_PATH}/${id}`)
}

// Nueva función para eliminar permanentemente una fuente de fondos
const permanentlyDeleteFundingSourceById = (id: string): Promise<void> => {
  return api.delete(`${FUNDING_SOURCES_PATH}/${id}/permanent`)
}

const getArchivedFundingSources = async (): Promise<FundingSource[]> => {
  const response = await api.get<FundingSource[]>('/funding-sources/archived')
  return response.data
}

// Funciones auxiliares para mostrar etiquetas legibles
const getFundingSourceTypeDisplay = (type: string): string => {
  switch (type) {
    case 'bank_account':
      return 'Cuenta Bancaria'
    case 'crypto_wallet':
      return 'Billetera Crypto'
    case 'cash':
      return 'Efectivo'
    case 'paypal':
      return 'PayPal'
    case 'zelle':
      return 'Zelle'
    case 'other':
      return 'Otro'
    default:
      return type
  }
}

const getFundingSourceStatusDisplay = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Activa'
    case 'inactive':
      return 'Inactiva'
    case 'archived':
      return 'Archivada'
    default:
      return status
  }
}

const fundingSourceService = {
  getAllFundingSources,
  getActiveFundingSources,
  getFundingSourcesByType,
  getFundingSourcesByCurrency,
  getFundingSourceById,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
  permanentlyDeleteFundingSourceById,
  getArchivedFundingSources,
  getFundingSourceTypeDisplay,
  getFundingSourceStatusDisplay,
}

export default fundingSourceService
