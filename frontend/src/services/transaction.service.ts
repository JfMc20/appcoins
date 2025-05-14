import api from './api';
import { 
  Transaction,
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionResponse,
  TransactionListResponse,
  TransactionSearchFilters
} from '../types/transaction.types';

const TRANSACTIONS_PATH = '/transactions';

// Obtener todas las transacciones (con paginación)
const getAllTransactions = (page = 1, limit = 20): Promise<TransactionListResponse> => {
  return api.get<TransactionListResponse>(`${TRANSACTIONS_PATH}?page=${page}&limit=${limit}`)
    .then(response => response.data);
};

// Buscar transacciones con filtros
const searchTransactions = (filters: TransactionSearchFilters): Promise<TransactionListResponse> => {
  return api.post<TransactionListResponse>(`${TRANSACTIONS_PATH}/search`, filters)
    .then(response => response.data);
};

// Obtener una transacción por ID
const getTransactionById = (id: string): Promise<Transaction> => {
  return api.get<TransactionResponse>(`${TRANSACTIONS_PATH}/${id}`)
    .then(response => response.data);
};

// Obtener transacciones por contacto
const getTransactionsByContact = (contactId: string): Promise<Transaction[]> => {
  return api.get<TransactionListResponse>(`${TRANSACTIONS_PATH}/by-contact/${contactId}`)
    .then(response => response.data.data);
};

// Obtener transacciones por fuente de fondos
const getTransactionsByFundingSource = (fundingSourceId: string): Promise<Transaction[]> => {
  return api.get<TransactionListResponse>(`${TRANSACTIONS_PATH}/by-funding-source/${fundingSourceId}`)
    .then(response => response.data.data);
};

// Obtener transacciones por ítem
const getTransactionsByItem = (itemId: string, itemType: 'GameItem' | 'ExternalProduct'): Promise<Transaction[]> => {
  return api.get<TransactionListResponse>(
    `${TRANSACTIONS_PATH}/by-item/${itemId}?itemType=${itemType}`
  ).then(response => response.data.data);
};

// Crear una nueva transacción
const createTransaction = (data: CreateTransactionData): Promise<Transaction> => {
  return api.post<TransactionResponse>(TRANSACTIONS_PATH, data)
    .then(response => response.data);
};

// Actualizar una transacción existente
const updateTransaction = (id: string, data: UpdateTransactionData): Promise<Transaction> => {
  return api.put<TransactionResponse>(`${TRANSACTIONS_PATH}/${id}`, data)
    .then(response => response.data);
};

// Cambiar el estado de una transacción
const updateTransactionStatus = (
  id: string, 
  status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'requires_attention'
): Promise<Transaction> => {
  return api.patch<TransactionResponse>(`${TRANSACTIONS_PATH}/${id}/status`, { status })
    .then(response => response.data);
};

// Eliminar una transacción
const deleteTransaction = (id: string): Promise<void> => {
  return api.delete(`${TRANSACTIONS_PATH}/${id}`)
    .then(response => response.data);
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