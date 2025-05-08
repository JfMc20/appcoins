import mongoose, { Schema, Document, Types } from 'mongoose';
// import { IUser } from './UserModel'; // Para la referencia a User

// Interface para detalles específicos de la fuente de fondos
interface IFundingSourceDetails {
  accountNumber?: string;
  email?: string; // Para Zelle, PayPal, etc.
  walletAddress?: string; // Para criptomonedas
  bankName?: string;
  holderName?: string;
  // Otros campos según necesidad
}

const FundingSourceDetailsSchema: Schema<IFundingSourceDetails> = new Schema({
  accountNumber: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  walletAddress: { type: String, trim: true },
  bankName: { type: String, trim: true },
  holderName: { type: String, trim: true },
}, { _id: false });


export interface IFundingSource extends Document {
  userId: Types.ObjectId; // Referencia a User (o IUser si la importas)
  name: string;
  currency: string;
  type: string; // Podría ser un enum: 'ExchangeCripto', 'CuentaBancariaNacional', ...
  currentBalance: number;
  details?: IFundingSourceDetails;
  status: 'active' | 'inactive' | 'archived';
  lastTransactionDate?: Date;
  notes?: string;
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

const FundingSourceSchema: Schema<IFundingSource> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Referencia al modelo User
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      // El índice de unicidad será compuesto con userId
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // Buena práctica para códigos de moneda
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      // Ejemplo de enum si se define un conjunto fijo:
      // enum: ['ExchangeCripto', 'CuentaBancariaNacional', 'CuentaBancariaInternacional', 'BilleteraElectronica', 'EfectivoFisico', 'Otro'],
      index: true,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    details: FundingSourceDetailsSchema, // Subdocumento embebido
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
    },
    lastTransactionDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para asegurar que el nombre de la fuente sea único por usuario
FundingSourceSchema.index({ userId: 1, name: 1 }, { unique: true });

const FundingSourceModel = mongoose.model<IFundingSource>(
  'FundingSource',
  FundingSourceSchema
);

export default FundingSourceModel; 