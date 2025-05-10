import axios from 'axios';
import { 
  Transaction,
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionResponse, 
  TransactionListResponse,
  TransactionSearchFilters
} from '../types/transaction.types';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/transactions`;

// Obtener todas las transacciones (con paginación)
const getAllTransactions = (page = 1, limit = 20): Promise<{
  transactions: Transaction[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}> => {
  return axios.get<TransactionListResponse>(`${API_URL}?page=${page}&limit=${limit}`)
    .then(response => ({
      transactions: response.data.data,
      pagination: response.data.pagination || {
        total: response.data.data.length,
        page,
        limit,
        pages: Math.ceil(response.data.data.length / limit)
      }
    }));
};

// Buscar transacciones con filtros
const searchTransactions = (filters: TransactionSearchFilters): Promise<{
  transactions: Transaction[],
  pagination?: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}> => {
  return axios.post<TransactionListResponse>(`${API_URL}/search`, filters)
    .then(response => ({
      transactions: response.data.data,
      pagination: response.data.pagination
    }));
};

// Obtener una transacción por ID
const getTransactionById = (id: string): Promise<Transaction> => {
  return axios.get<TransactionResponse>(`${API_URL}/${id}`)
    .then(response => response.data.data);
};

// Obtener transacciones por contacto
const getTransactionsByContact = (contactId: string): Promise<Transaction[]> => {
  return axios.get<TransactionListResponse>(`${API_URL}/by-contact/${contactId}`)
    .then(response => response.data.data);
};

// Obtener transacciones por fuente de fondos
const getTransactionsByFundingSource = (fundingSourceId: string): Promise<Transaction[]> => {
  return axios.get<TransactionListResponse>(`${API_URL}/by-funding-source/${fundingSourceId}`)
    .then(response => response.data.data);
};

// Obtener transacciones por ítem
const getTransactionsByItem = (itemId: string, itemType: 'GameItem' | 'ExternalProduct'): Promise<Transaction[]> => {
  return axios.get<TransactionListResponse>(
    `${API_URL}/by-item/${itemId}?itemType=${itemType}`
  ).then(response => response.data.data);
};

// Crear una nueva transacción
const createTransaction = (data: CreateTransactionData): Promise<Transaction> => {
  return axios.post<TransactionResponse>(API_URL, data)
    .then(response => response.data.data);
};

// Actualizar una transacción existente
const updateTransaction = (id: string, data: UpdateTransactionData): Promise<Transaction> => {
  return axios.put<TransactionResponse>(`${API_URL}/${id}`, data)
    .then(response => response.data.data);
};

// Cambiar el estado de una transacción
const updateTransactionStatus = (
  id: string, 
  status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'requires_attention'
): Promise<Transaction> => {
  return axios.patch<TransactionResponse>(`${API_URL}/${id}/status`, { status })
    .then(response => response.data.data);
};

// Eliminar una transacción
const deleteTransaction = (id: string): Promise<void> => {
  return axios.delete(`${API_URL}/${id}`);
};

const transactionService = {
  getAllTransactions,
  searchTransactions,
  getTransactionById,
  getTransactionsByContact,
  getTransactionsByFundingSource,
  getTransactionsByItem,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction
};

export default transactionService; 