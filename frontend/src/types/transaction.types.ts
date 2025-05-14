// Tipos de transacciones
export type TransactionType = 
  | 'COMPRA_ITEM_JUEGO' 
  | 'VENTA_ITEM_JUEGO' 
  | 'COMPRA_PRODUCTO_EXTERNO' 
  | 'VENTA_PRODUCTO_EXTERNO'
  | 'AJUSTE_STOCK_POSITIVO'
  | 'AJUSTE_STOCK_NEGATIVO'
  | 'DEVOLUCION_CLIENTE'
  | 'DEVOLUCION_PROVEEDOR'
  | 'DECLARACION_SALDO_INICIAL_CAPITAL'
  | 'DECLARACION_OPERADOR_INICIO_DIA'
  | 'AJUSTE_ADMIN_CAPITAL'
  | 'TRANSFERENCIA_ENTRE_FUENTES'
  | 'GASTO_OPERATIVO'
  | 'INGRESO_NO_OPERACIONAL';

// Interfaz para el monto monetario
export interface MoneyAmount {
  amount: number;
  currency: string;
}

// Interfaz para detalles de ítem/producto
export interface TransactionItemDetail {
  itemType: 'GameItem' | 'ExternalProduct';
  itemId: string;
  itemNameSnapshot: string;
  gameIdSnapshot?: string;
  quantity: number;
  unitPrice?: MoneyAmount;
  totalAmount?: MoneyAmount;
  stockItemCode?: string;
}

// Interfaz para detalles de pago
export interface TransactionPaymentDetail {
  fundingSourceId: string;
  amount: number;
  currency: string;
  exchangeRatesUsed?: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    source?: string;
  }[];
  valueInReferenceCurrency?: MoneyAmount;
  fundingSourceBalanceBefore?: number;
  fundingSourceBalanceAfter?: number;
  paymentMethod?: string;
  transactionReference?: string;
}

// Interfaz para declaración de capital
export interface CapitalDeclarationEntry {
  fundingSourceId: string;
  declaredBalance: number;
  currency: string;
  previousBalance?: number;
}

// Interfaz para detalles de ganancia
export interface ProfitDetail {
  costOfGoods?: MoneyAmount;
  grossProfit?: MoneyAmount;
  commission?: {
    amount: number;
    currency: string;
    percentage?: number;
    type?: string;
  };
  netProfit?: MoneyAmount;
}

// Interfaz principal para Transacción
export interface Transaction {
  _id?: string;
  transactionDate: Date;
  type: TransactionType;
  contactId?: string;
  operatorUserId: string;
  itemDetails?: TransactionItemDetail;
  paymentDetails?: TransactionPaymentDetail;
  capitalDeclaration?: CapitalDeclarationEntry[];
  profitDetails?: ProfitDetail;
  status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'requires_attention';
  notes?: string;
  relatedTransactionId?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaces para respuestas de API
export type TransactionResponse = Transaction; // Modificado: Respuesta directa de la transacción

export interface TransactionListResponse {
  data: Transaction[];
  pagination?: {
    currentPage: number; // Ajustado para coincidir con la paginación de contactos
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Interfaces para filtros de búsqueda
export interface TransactionSearchFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType | TransactionType[];
  contactId?: string;
  operatorUserId?: string;
  itemId?: string;
  itemType?: 'GameItem' | 'ExternalProduct';
  fundingSourceId?: string;
  status?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: string;
}

// Interfaces para creación/actualización
export interface CreateTransactionData {
  transactionDate?: Date;
  type: TransactionType;
  contactId?: string;
  itemDetails?: TransactionItemDetail;
  paymentDetails?: TransactionPaymentDetail;
  capitalDeclaration?: CapitalDeclarationEntry[];
  profitDetails?: ProfitDetail;
  status?: 'pending' | 'completed' | 'cancelled' | 'failed' | 'requires_attention';
  notes?: string;
  relatedTransactionId?: string;
  tags?: string[];
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {} 