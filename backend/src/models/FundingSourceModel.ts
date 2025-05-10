import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './UserModel'; // Para referenciar al usuario propietario

// Interfaces para los diferentes tipos de fuentes de fondos
export interface IBankAccountDetails {
  accountNumber: string;
  bankName: string;
  accountType?: 'checking' | 'savings' | 'other';
  accountHolder?: string;
  routingNumber?: string; // ABA/Routing para US
  swiftCode?: string; // Para transferencias internacionales
  iban?: string; // Para Europa principalmente
  branchCode?: string;
}

export interface ICryptoWalletDetails {
  walletAddress: string;
  network?: string; // Ej. ERC20, TRC20, etc.
  exchange?: string; // Ej. Binance, Coinbase
  memo?: string; // Para algunas criptomonedas
  isExchangeWallet?: boolean; // Si es wallet en un exchange o personal
}

export interface ICashDetails {
  location?: string; // Ubicación física donde se guarda
  custodian?: string; // Persona responsable
  maxAmount?: number; // Monto máximo recomendado
  insuranceInfo?: string; // Información sobre seguro si existe
}

export interface IDigitalPaymentDetails {
  email: string; // Email asociado a PayPal, Zelle, etc.
  accountHolder?: string;
  isVerified?: boolean;
  country?: string; // País de la cuenta
}

// Unión de tipos para typeSpecificDetails
export type FundingSourceDetails = 
  | IBankAccountDetails 
  | ICryptoWalletDetails 
  | ICashDetails 
  | IDigitalPaymentDetails;

// Interfaz para el documento FundingSource
export interface IFundingSource extends Document {
  userId: Types.ObjectId | IUser; // Quién es el dueño de esta fuente de fondos
  name: string; // Nombre descriptivo (ej. "Banco Mercantil USD", "Binance USDT", "Caja Chica VES")
  currency: string; // Código de la moneda (ej. "USD", "USDT", "VES", "COP")
  type: 'bank_account' | 'crypto_wallet' | 'cash' | 'paypal' | 'zelle' | 'other'; // Tipo de fuente
  currentBalance: number; // Saldo actual, se actualiza con transacciones
  isOperating: boolean; // Si está en uso operativo o no
  lowBalanceThreshold?: number; // Umbral para alertas de saldo bajo
  lastReconciliationDate?: Date; // Última fecha de conciliación
  typeSpecificDetails?: FundingSourceDetails; // Detalles según el tipo
  status: 'active' | 'inactive' | 'archived';
  notes?: string; // Notas adicionales
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

// Esquemas para los diferentes tipos de detalles
const BankAccountDetailsSchema: Schema = new Schema({
  accountNumber: { 
    type: String, 
    required: true, 
    trim: true 
  },
  bankName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  accountType: { 
    type: String, 
    enum: ['checking', 'savings', 'other'],
    default: 'checking'
  },
  accountHolder: { 
    type: String, 
    trim: true 
  },
  routingNumber: { 
    type: String, 
    trim: true 
  },
  swiftCode: { 
    type: String, 
    trim: true,
    uppercase: true
  },
  iban: { 
    type: String, 
    trim: true,
    uppercase: true
  },
  branchCode: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

const CryptoWalletDetailsSchema: Schema = new Schema({
  walletAddress: { 
    type: String, 
    required: true, 
    trim: true 
  },
  network: { 
    type: String, 
    trim: true 
  },
  exchange: { 
    type: String, 
    trim: true 
  },
  memo: { 
    type: String, 
    trim: true 
  },
  isExchangeWallet: { 
    type: Boolean, 
    default: false 
  }
}, { _id: false });

const CashDetailsSchema: Schema = new Schema({
  location: { 
    type: String, 
    trim: true 
  },
  custodian: { 
    type: String, 
    trim: true 
  },
  maxAmount: { 
    type: Number, 
    min: 0 
  },
  insuranceInfo: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

const DigitalPaymentDetailsSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} no es un email válido`
    }
  },
  accountHolder: { 
    type: String, 
    trim: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  country: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

const FundingSourceSchema: Schema<IFundingSource> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Asumiendo que cada fuente pertenece a un usuario del sistema
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true, // ej. "USD", "USDT"
      // Podría tener una validación enum si las monedas son fijas o referenciar AppSettings
    },
    type: {
      type: String,
      required: true,
      enum: ['bank_account', 'crypto_wallet', 'cash', 'paypal', 'zelle', 'other'],
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    isOperating: {
      type: Boolean,
      default: true
    },
    lowBalanceThreshold: {
      type: Number,
      min: 0
    },
    lastReconciliationDate: {
      type: Date
    },
    typeSpecificDetails: {
      type: Schema.Types.Mixed,
      required: true,
      validate: [
        {
          validator: function(this: IFundingSource, details: any) {
            // Validación según el tipo de fuente
            if (this.type === 'bank_account') {
              return details && details.accountNumber && details.bankName;
            }
            if (this.type === 'crypto_wallet') {
              return details && details.walletAddress;
            }
            if (this.type === 'paypal' || this.type === 'zelle') {
              return details && details.email;
            }
            // Para 'cash' y 'other' no hay requisitos específicos
            return true;
          },
          message: 'Los detalles específicos son incorrectos para el tipo de fuente de fondos'
        }
      ]
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Middleware pre-save para asegurar que typeSpecificDetails tenga la estructura correcta
FundingSourceSchema.pre('validate', function(this: IFundingSource, next) {
  const details = this.typeSpecificDetails;
  
  if (!details) {
    // Si no hay detalles, crear un objeto vacío según el tipo
    this.typeSpecificDetails = {};
    return next();
  }
  
  // No necesitamos más validación aquí porque lo hacemos con el validador personalizado
  next();
});

// Índices sugeridos del documento de diseño
FundingSourceSchema.index({ userId: 1, name: 1 }, { unique: true }); // Nombre único por usuario
FundingSourceSchema.index({ userId: 1, status: 1, currency: 1 }); // Para consultas comunes
FundingSourceSchema.index({ userId: 1, type: 1 }); // Para filtrar por tipo de fuente
FundingSourceSchema.index({ isOperating: 1 }); // Para filtrar fuentes operativas

const FundingSourceModel = mongoose.model<IFundingSource>('FundingSource', FundingSourceSchema);

export default FundingSourceModel; 