// Interfaces para los detalles específicos por tipo
export interface BankAccountDetails {
  accountNumber: string;
  bankName: string;
  accountType?: 'checking' | 'savings' | 'other';
  accountHolder?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  branchCode?: string;
}

export interface CryptoWalletDetails {
  walletAddress: string;
  network?: string;
  exchange?: string;
  memo?: string;
  isExchangeWallet?: boolean;
}

export interface CashDetails {
  location?: string;
  custodian?: string;
  maxAmount?: number;
  insuranceInfo?: string;
}

export interface DigitalPaymentDetails {
  email: string;
  accountHolder?: string;
  isVerified?: boolean;
  country?: string;
}

// Tipo unión para detalles específicos
export type FundingSourceDetails = 
  | BankAccountDetails 
  | CryptoWalletDetails 
  | CashDetails 
  | DigitalPaymentDetails;

// Interfaz principal para FundingSource
export interface FundingSource {
  _id?: string;
  userId: string;
  name: string;
  currency: string;
  type: 'bank_account' | 'crypto_wallet' | 'cash' | 'paypal' | 'zelle' | 'other';
  currentBalance: number;
  isOperating: boolean;
  lowBalanceThreshold?: number;
  lastReconciliationDate?: Date;
  typeSpecificDetails?: FundingSourceDetails;
  status: 'active' | 'inactive' | 'archived';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaces para respuestas de API
export interface FundingSourceResponse {
  success: boolean;
  data: FundingSource;
  message?: string;
}

export interface FundingSourceListResponse {
  success: boolean;
  data: FundingSource[];
  message?: string;
}

// Interfaces para operaciones CRUD
export interface CreateFundingSourceData {
  name: string;
  currency: string;
  type: 'bank_account' | 'crypto_wallet' | 'cash' | 'paypal' | 'zelle' | 'other';
  currentBalance?: number;
  isOperating?: boolean;
  lowBalanceThreshold?: number;
  typeSpecificDetails?: FundingSourceDetails;
  status?: 'active' | 'inactive' | 'archived';
  notes?: string;
}

export interface UpdateFundingSourceData extends Partial<CreateFundingSourceData> {} 