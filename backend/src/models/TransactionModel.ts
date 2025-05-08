import mongoose, { Schema, Document, Types } from 'mongoose';
// Importaremos otras interfaces/modelos según sea necesario para las referencias
// import { IUser } from './UserModel'; // Ejemplo si UserModel.ts existe
// import { IContact } from './ContactModel'; // Ejemplo
// import { IFundingSource } from './FundingSourceModel'; // Ejemplo
// import { IGameItem } from './GameItemModel';
// import { IExternalProduct } from './ExternalProductModel';

// Subdocumento para ItemDetails (polimórfico)
interface IItemDetails {
  itemType: 'GameItem' | 'ExternalProduct';
  itemId: Types.ObjectId; // Referencia a GameItem o ExternalProduct
  itemNameSnapshot: string; // Nombre del ítem al momento de la transacción
  gameIdSnapshot?: Types.ObjectId; // gameId si itemType es GameItem y aplica
  quantity: number;
  unitPrice: { // Precio acordado por unidad del ítem
    amount: number;
    currency: string; // ej: "USDT", "VES"
  };
  totalAmount: { // Monto total de la parte del ítem: quantity * unitPrice.amount
    amount: number;
    currency: string;
  };
}

const ItemDetailsSchema: Schema<IItemDetails> = new Schema({
  itemType: { type: String, required: true, enum: ['GameItem', 'ExternalProduct'] },
  itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'itemDetails.itemType' }, // refPath para referencia dinámica
  itemNameSnapshot: { type: String, required: true, trim: true },
  gameIdSnapshot: { type: Schema.Types.ObjectId, ref: 'Game' }, // Opcional
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
  },
  totalAmount: {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
  },
}, { _id: false });


// Subdocumento para PaymentDetails
interface IPaymentDetails {
  fundingSourceId: Types.ObjectId; // Referencia a FundingSources
  amount: number; // Monto del movimiento
  currency: string; // Moneda del movimiento
  exchangeRatesUsed?: Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    source: string; // ej. "API_CriptoYa", "Manual_Admin"
  }>;
  valueInReferenceCurrency?: { // Valor del movimiento en la moneda de referencia, ej. USDT
    amount: number;
    currency: string; // ej. "USDT"
  };
  fundingSourceBalanceBefore?: number;
  fundingSourceBalanceAfter?: number;
}

const PaymentDetailsSchema: Schema<IPaymentDetails> = new Schema({
  fundingSourceId: { type: Schema.Types.ObjectId, required: true, ref: 'FundingSource' },
  amount: { type: Number, required: true }, // Puede ser positivo o negativo según la transacción
  currency: { type: String, required: true, trim: true },
  exchangeRatesUsed: [{
    fromCurrency: { type: String, required: true, trim: true },
    toCurrency: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    source: { type: String, trim: true },
    _id: false,
  }],
  valueInReferenceCurrency: {
    amount: { type: Number, trim: true },
    currency: { type: String, trim: true },
    _id: false,
  },
  fundingSourceBalanceBefore: { type: Number },
  fundingSourceBalanceAfter: { type: Number },
}, { _id: false });

// Subdocumento para CapitalDeclaration
interface ICapitalDeclarationItem {
  fundingSourceId: Types.ObjectId;
  declaredBalance: number;
  currency: string;
  previousBalance?: number; // Saldo anterior de la fuente, para auditoría
}

const CapitalDeclarationItemSchema: Schema<ICapitalDeclarationItem> = new Schema({
  fundingSourceId: { type: Schema.Types.ObjectId, required: true, ref: 'FundingSource' },
  declaredBalance: { type: Number, required: true },
  currency: { type: String, required: true, trim: true },
  previousBalance: { type: Number },
}, { _id: false });


// Subdocumento para ProfitDetails
interface IOtherFee {
  amount: number;
  currency: string;
  description: string;
}
interface IProfitDetails {
  costOfGoods?: { amount: number; currency: string };
  commission?: {
    percentage?: number;
    fixedAmount?: number;
    calculatedAmount: number;
    description?: string;
    currency: string;
  };
  grossProfit?: { amount: number; currency: string }; // totalAmount (item) - costOfGoods
  netProfit?: { amount: number; currency: string }; // grossProfit - commission
  otherFees?: IOtherFee[];
}

const OtherFeeSchema: Schema<IOtherFee> = new Schema({
    amount: { type: Number, required: true },
    currency: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
}, { _id: false });

const ProfitDetailsSchema: Schema<IProfitDetails> = new Schema({
  costOfGoods: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, trim: true },
    _id: false,
  },
  commission: {
    percentage: { type: Number, min: 0, max: 100 },
    fixedAmount: { type: Number, min: 0 },
    calculatedAmount: { type: Number, required: true },
    description: { type: String, trim: true },
    currency: { type: String, required: true, trim: true },
    _id: false,
  },
  grossProfit: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, trim: true },
    _id: false,
  },
  netProfit: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, trim: true },
    _id: false,
  },
  otherFees: [OtherFeeSchema],
}, { _id: false });


// Definición de la Interfaz Principal para Transaction
export interface ITransaction extends Document {
  transactionDate: Date;
  type: string; // Podría ser un enum con todos los tipos de transacción definidos
  contactId?: Types.ObjectId; // Referencia a Contact
  operatorUserId: Types.ObjectId; // Referencia a User
  itemDetails?: IItemDetails;
  paymentDetails?: IPaymentDetails;
  capitalDeclaration?: ICapitalDeclarationItem[];
  profitDetails?: IProfitDetails;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled' | 'error' | 'refunded';
  relatedTransactionId?: Types.ObjectId; // Para enlazar transacciones, ej. devolución
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

// Definición del Esquema Principal de Transaction
const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // Ejemplo de enum:
      // enum: [
      //   "COMPRA_ITEM_JUEGO", "VENTA_ITEM_JUEGO",
      //   "COMPRA_PRODUCTO_EXTERNO", "VENTA_PRODUCTO_EXTERNO",
      //   "AJUSTE_STOCK_POSITIVO", "AJUSTE_STOCK_NEGATIVO",
      //   "DEVOLUCION_CLIENTE", "DEVOLUCION_PROVEEDOR",
      //   "DECLARACION_SALDO_INICIAL_CAPITAL", "INGRESO_CAPITAL", "RETIRO_CAPITAL",
      //   "PAGO_GASTO_OPERATIVO", "OTROS_INGRESOS", "OTROS_EGRESOS"
      // ],
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact', // Asumiendo un modelo Contact
      index: true,
    },
    operatorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Asumiendo un modelo User
      required: true,
      index: true,
    },
    itemDetails: ItemDetailsSchema, // Subdocumento embebido
    paymentDetails: PaymentDetailsSchema, // Subdocumento embebido
    capitalDeclaration: [CapitalDeclarationItemSchema],
    profitDetails: ProfitDetailsSchema, // Subdocumento embebido
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled', 'error', 'refunded'],
      default: 'completed',
      index: true,
    },
    relatedTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction', // Auto-referencia
    },
  },
  {
    timestamps: true,
  }
);

// Índices adicionales sugeridos en el documento
TransactionSchema.index({ 'itemDetails.itemId': 1 });
TransactionSchema.index({ 'itemDetails.itemType': 1 });
TransactionSchema.index({ 'paymentDetails.fundingSourceId': 1 });
TransactionSchema.index({ 'capitalDeclaration.fundingSourceId': 1 });


const TransactionModel = mongoose.model<ITransaction>(
  'Transaction',
  TransactionSchema
);

export default TransactionModel; 