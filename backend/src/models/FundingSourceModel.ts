import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './UserModel'; // Para referenciar al usuario propietario

// Interfaz para el subdocumento de detalles específicos por tipo
export interface IFundingSourceTypeSpecificDetails {
  // Campos comunes o ejemplos, ajustar según necesidad
  accountNumber?: string; // Para bancos
  walletAddress?: string; // Para cripto
  bankName?: string;
  swiftCode?: string;
  paypalEmail?: string;
  zelleEmail?: string;
  // ...otros campos específicos que puedan surgir
}

// Interfaz para el documento FundingSource
export interface IFundingSource extends Document {
  userId: Types.ObjectId | IUser; // Quién es el dueño de esta fuente de fondos
  name: string; // Nombre descriptivo (ej. "Banco Mercantil USD", "Binance USDT", "Caja Chica VES")
  currency: string; // Código de la moneda (ej. "USD", "USDT", "VES", "COP")
  type: 'bank_account' | 'crypto_wallet' | 'cash' | 'paypal' | 'zelle' | 'other'; // Tipo de fuente
  currentBalance: number; // Saldo actual, se actualiza con transacciones
  typeSpecificDetails?: IFundingSourceTypeSpecificDetails; // Detalles según el tipo
  status: 'active' | 'inactive' | 'archived';
  notes?: string; // Notas adicionales
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const FundingSourceTypeSpecificDetailsSchema: Schema<IFundingSourceTypeSpecificDetails> = new Schema({
  accountNumber: { type: String, trim: true },
  walletAddress: { type: String, trim: true },
  bankName: { type: String, trim: true },
  swiftCode: { type: String, trim: true },
  paypalEmail: { type: String, trim: true, lowercase: true },
  zelleEmail: { type: String, trim: true, lowercase: true },
}, { _id: false }); // _id: false para subdocumentos si no necesitan ID propio

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
    typeSpecificDetails: {
      type: FundingSourceTypeSpecificDetailsSchema,
      default: {},
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

// Índices sugeridos del documento de diseño
FundingSourceSchema.index({ userId: 1, name: 1 }, { unique: true }); // Nombre único por usuario
FundingSourceSchema.index({ userId: 1, status: 1, currency: 1 }); // Para consultas comunes

const FundingSourceModel = mongoose.model<IFundingSource>('FundingSource', FundingSourceSchema);

export default FundingSourceModel; 