import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import { IUser } from './UserModel';
import { IContact } from './ContactModel';
import { IGameItem } from './GameItemModel';
import { IExternalProduct } from './ExternalProductModel';
import { IFundingSource } from './FundingSourceModel';
import { IGame } from './GameModel';

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

// Interfaz para el subdocumento de detalles de ítem/producto en una transacción
export interface ITransactionItemDetail {
  itemType: 'GameItem' | 'ExternalProduct';
  itemId: Types.ObjectId | IGameItem | IExternalProduct;
  itemNameSnapshot: string; // Nombre del ítem/producto al momento de la transacción
  gameIdSnapshot?: Types.ObjectId | IGame; // Si es GameItem, o si ExternalProduct tiene relatedGameId
  quantity: number;
  // Precio unitario acordado para esta transacción específica
  unitPrice?: {
    amount: number;
    currency: string; // Moneda del precio unitario
  };
  // Monto total por los ítems (quantity * unitPrice.amount)
  totalAmount?: {
    amount: number;
    currency: string; // Misma moneda que unitPrice
  };
  // Para ExternalProducts con stockItems (códigos)
  stockItemCode?: string; // Código específico vendido/comprado
}

// Interfaz para el subdocumento de detalles de pago/movimiento monetario
export interface ITransactionPaymentDetail {
  fundingSourceId: Types.ObjectId | IFundingSource; // Fuente de fondos afectada
  amount: number; // Monto del movimiento en la fundingSource
  currency: string; // Moneda del movimiento en la fundingSource
  exchangeRatesUsed?: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    source?: string; // ej. "API_CriptoYa", "Manual_Admin"
  }[];
  valueInReferenceCurrency?: { // Valor del movimiento en la moneda de referencia del sistema (ej. USDT)
    amount: number;
    currency: string;
  };
  fundingSourceBalanceBefore?: number; // Saldo de la fuente antes de la transacción (auditoría)
  fundingSourceBalanceAfter?: number; // Saldo de la fuente después de la transacción (auditoría)
  paymentMethod?: string; // ej. "Transferencia Bancaria", "Efectivo", "Binance Pay"
  transactionReference?: string; // ID de transacción del banco, hash de cripto, etc.
}

// Interfaz para el subdocumento de declaración de capital
export interface ICapitalDeclarationEntry {
  fundingSourceId: Types.ObjectId | IFundingSource;
  declaredBalance: number;
  currency: string;
  previousBalance?: number; // Saldo antes de esta declaración (auditoría)
}

// Interfaz para el subdocumento de detalles de ganancia/pérdida
export interface IProfitDetail {
  costOfGoods?: { // Costo de los bienes vendidos
    amount: number;
    currency: string; // Debería ser en la moneda de referencia
  };
  grossProfit?: { // Ganancia bruta (venta - costo)
    amount: number;
    currency: string; // Moneda de referencia
  };
  commission?: { // Comisión aplicada a la transacción
    amount: number;
    currency: string; // Moneda de referencia
    percentage?: number;
    type?: string; // ej. "percentage_sale", "fixed_fee"
  };
  netProfit?: { // Ganancia neta (bruta - comisión)
    amount: number;
    currency: string; // Moneda de referencia
  };
}

// Interfaz principal para el documento Transaction
export interface ITransaction extends Document {
  transactionDate: Date; // Fecha y hora de la transacción
  // Tipo de transacción
  type: TransactionType;
  contactId?: Types.ObjectId | IContact; // Cliente o proveedor (si aplica)
  operatorUserId: Types.ObjectId | IUser; // Usuario que registró la transacción
  
  itemDetails?: ITransactionItemDetail; // Presente si la transacción involucra un ítem/producto
  paymentDetails?: ITransactionPaymentDetail; // Presente si la transacción implica movimiento de dinero
  capitalDeclaration?: ICapitalDeclarationEntry[]; // Aplica a DECLARACION_SALDO_INICIAL_CAPITAL, DECLARACION_OPERADOR_INICIO_DIA, AJUSTE_ADMIN_CAPITAL
  profitDetails?: IProfitDetail; // Principalmente para ventas, para registrar ganancias

  status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'requires_attention';
  notes?: string; // Notas generales sobre la transacción
  relatedTransactionId?: Types.ObjectId | ITransaction; // Para vincular transacciones (ej. devolución a una venta)
  tags?: string[];

  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;

  // Métodos de instancia
  calculateTotalAmount(): number | null; // Calcula el monto total de la transacción
  getReferenceCurrencyAmount(): { amount: number; currency: string } | null; // Obtiene el monto en moneda de referencia
  affectsInventory(): boolean; // Determina si la transacción afecta el inventario
  affectsCapital(): boolean; // Determina si la transacción afecta el capital
}

// Interfaz para el modelo estático
export interface ITransactionModel extends Model<ITransaction> {
  getTransactionsByContact(contactId: string): Promise<ITransaction[]>;
  getTransactionsByFundingSource(fundingSourceId: string): Promise<ITransaction[]>;
  getTransactionsByItem(itemId: string, itemType: 'GameItem' | 'ExternalProduct'): Promise<ITransaction[]>;
}

// ---- Schemas ----

const TransactionItemDetailSchema: Schema<ITransactionItemDetail> = new Schema({
  itemType: { type: String, required: true, enum: ['GameItem', 'ExternalProduct'] },
  itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'itemDetails.itemType' },
  itemNameSnapshot: { type: String, required: true, trim: true },
  gameIdSnapshot: { type: Schema.Types.ObjectId, ref: 'Game' },
  quantity: { type: Number, required: true, min: 0 }, // Usar min: 0.000001 si se necesitan fracciones muy pequeñas
  unitPrice: {
    amount: { type: Number, required: function() { return !!(this as any).totalAmount; } }, // Req si hay totalAmount
    currency: { type: String, uppercase: true, trim: true, required: function() { return !!(this as any).totalAmount; } },
  },
  totalAmount: {
    amount: { type: Number, required: function() { return !!(this as any).unitPrice; } }, // Req si hay unitPrice
    currency: { type: String, uppercase: true, trim: true, required: function() { return !!(this as any).unitPrice; } },
  },
  stockItemCode: { type: String, trim: true }, // Código de stock individual si aplica
}, { _id: false });

const TransactionPaymentDetailSchema: Schema<ITransactionPaymentDetail> = new Schema({
  fundingSourceId: { type: Schema.Types.ObjectId, ref: 'FundingSource', required: true },
  amount: { type: Number, required: true }, // Puede ser positivo (ingreso) o negativo (egreso) a la fuente
  currency: { type: String, required: true, uppercase: true, trim: true },
  exchangeRatesUsed: [
    {
      fromCurrency: { type: String, required: true, uppercase: true, trim: true },
      toCurrency: { type: String, required: true, uppercase: true, trim: true },
      rate: { type: Number, required: true },
      source: { type: String, trim: true },
      _id: false,
    },
  ],
  valueInReferenceCurrency: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true }, // Debería ser la moneda de referencia de AppSettings
  },
  fundingSourceBalanceBefore: { type: Number },
  fundingSourceBalanceAfter: { type: Number },
  paymentMethod: { type: String, trim: true, maxlength: 100 },
  transactionReference: { type: String, trim: true, maxlength: 200 }, // ej. ID de transferencia bancaria, hash de tx cripto
}, { _id: false });

const CapitalDeclarationEntrySchema: Schema<ICapitalDeclarationEntry> = new Schema({
  fundingSourceId: { type: Schema.Types.ObjectId, ref: 'FundingSource', required: true },
  declaredBalance: { type: Number, required: true },
  currency: { type: String, required: true, uppercase: true, trim: true },
  previousBalance: { type: Number },
}, { _id: false });

const ProfitDetailSchema: Schema<IProfitDetail> = new Schema({
  costOfGoods: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
  },
  grossProfit: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
  },
  commission: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
    percentage: { type: Number, min: 0, max: 100 },
    type: { type: String, trim: true },
  },
  netProfit: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
  },
}, { _id: false });

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    transactionDate: { type: Date, required: true, default: Date.now, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'COMPRA_ITEM_JUEGO', 'VENTA_ITEM_JUEGO', 'COMPRA_PRODUCTO_EXTERNO', 'VENTA_PRODUCTO_EXTERNO',
        'AJUSTE_STOCK_POSITIVO', 'AJUSTE_STOCK_NEGATIVO', 'DEVOLUCION_CLIENTE', 'DEVOLUCION_PROVEEDOR',
        'DECLARACION_SALDO_INICIAL_CAPITAL',
        'DECLARACION_OPERADOR_INICIO_DIA',
        'AJUSTE_ADMIN_CAPITAL',
        'TRANSFERENCIA_ENTRE_FUENTES', 'GASTO_OPERATIVO', 'INGRESO_NO_OPERACIONAL'
      ],
      index: true,
    },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', sparse: true, index: true },
    operatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemDetails: { type: TransactionItemDetailSchema },
    paymentDetails: { type: TransactionPaymentDetailSchema },
    capitalDeclaration: { type: [CapitalDeclarationEntrySchema], default: undefined },
    profitDetails: { type: ProfitDetailSchema },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'cancelled', 'failed', 'requires_attention'],
      default: 'completed',
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 10000 },
    relatedTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', sparse: true },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Validación a nivel de esquema completo
TransactionSchema.pre('validate', function(this: ITransaction, next) {
  const type = this.type;

  // Validaciones específicas por tipo de transacción
  if (['COMPRA_ITEM_JUEGO', 'VENTA_ITEM_JUEGO', 'COMPRA_PRODUCTO_EXTERNO', 'VENTA_PRODUCTO_EXTERNO'].includes(type)) {
    // Transacciones de compra/venta de items o productos siempre requieren itemDetails
    if (!this.itemDetails) {
      return next(new Error(`La transacción de tipo ${type} requiere detalles del ítem (itemDetails)`));
    }
    
    // Transacciones de compra/venta siempre requieren paymentDetails
    if (!this.paymentDetails) {
      return next(new Error(`La transacción de tipo ${type} requiere detalles de pago (paymentDetails)`));
    }
  }
  
  if (['AJUSTE_STOCK_POSITIVO', 'AJUSTE_STOCK_NEGATIVO'].includes(type)) {
    // Ajustes de stock siempre requieren itemDetails
    if (!this.itemDetails) {
      return next(new Error(`La transacción de tipo ${type} requiere detalles del ítem (itemDetails)`));
    }
  }
  
  if (['DECLARACION_SALDO_INICIAL_CAPITAL', 'DECLARACION_OPERADOR_INICIO_DIA', 'AJUSTE_ADMIN_CAPITAL'].includes(type)) {
    // Transacciones de capital siempre requieren capitalDeclaration
    if (!this.capitalDeclaration || !this.capitalDeclaration.length) {
      return next(new Error(`La transacción de tipo ${type} requiere declaración de capital (capitalDeclaration)`));
    }
  }
  
  if (['TRANSFERENCIA_ENTRE_FUENTES'].includes(type)) {
    // Transferencias siempre requieren paymentDetails
    if (!this.paymentDetails) {
      return next(new Error(`La transacción de tipo ${type} requiere detalles de pago (paymentDetails)`));
    }
    
    // TO-DO: Aquí podríamos validar que exista un paymentDetails para la fuente origen y otro para la destino
  }

  next();
});

// Métodos de instancia
TransactionSchema.methods.calculateTotalAmount = function(this: ITransaction): number | null {
  if (this.itemDetails && this.itemDetails.totalAmount) {
    return this.itemDetails.totalAmount.amount;
  }
  
  if (this.paymentDetails) {
    return Math.abs(this.paymentDetails.amount);
  }
  
  if (this.capitalDeclaration && this.capitalDeclaration.length) {
    // Sumar todos los montos declarados
    return this.capitalDeclaration.reduce((sum, entry) => sum + entry.declaredBalance, 0);
  }
  
  return null;
};

TransactionSchema.methods.getReferenceCurrencyAmount = function(this: ITransaction): { amount: number; currency: string } | null {
  if (this.paymentDetails && this.paymentDetails.valueInReferenceCurrency) {
    return this.paymentDetails.valueInReferenceCurrency;
  }
  
  if (this.profitDetails && this.profitDetails.netProfit) {
    return {
      amount: this.profitDetails.netProfit.amount,
      currency: this.profitDetails.netProfit.currency
    };
  }
  
  return null;
};

TransactionSchema.methods.affectsInventory = function(this: ITransaction): boolean {
  return [
    'COMPRA_ITEM_JUEGO', 
    'VENTA_ITEM_JUEGO', 
    'COMPRA_PRODUCTO_EXTERNO', 
    'VENTA_PRODUCTO_EXTERNO',
    'AJUSTE_STOCK_POSITIVO', 
    'AJUSTE_STOCK_NEGATIVO',
    'DEVOLUCION_CLIENTE',
    'DEVOLUCION_PROVEEDOR'
  ].includes(this.type);
};

TransactionSchema.methods.affectsCapital = function(this: ITransaction): boolean {
  return [
    'COMPRA_ITEM_JUEGO', 
    'VENTA_ITEM_JUEGO', 
    'COMPRA_PRODUCTO_EXTERNO', 
    'VENTA_PRODUCTO_EXTERNO',
    'DECLARACION_SALDO_INICIAL_CAPITAL',
    'DECLARACION_OPERADOR_INICIO_DIA',
    'AJUSTE_ADMIN_CAPITAL',
    'TRANSFERENCIA_ENTRE_FUENTES',
    'GASTO_OPERATIVO',
    'INGRESO_NO_OPERACIONAL'
  ].includes(this.type);
};

// Métodos estáticos
TransactionSchema.statics.getTransactionsByContact = function(contactId: string): Promise<ITransaction[]> {
  return this.find({ contactId }).sort({ transactionDate: -1 }).exec();
};

TransactionSchema.statics.getTransactionsByFundingSource = function(fundingSourceId: string): Promise<ITransaction[]> {
  return this.find({
    $or: [
      { 'paymentDetails.fundingSourceId': fundingSourceId },
      { 'capitalDeclaration.fundingSourceId': fundingSourceId }
    ]
  }).sort({ transactionDate: -1 }).exec();
};

TransactionSchema.statics.getTransactionsByItem = function(itemId: string, itemType: 'GameItem' | 'ExternalProduct'): Promise<ITransaction[]> {
  return this.find({
    'itemDetails.itemId': itemId,
    'itemDetails.itemType': itemType
  }).sort({ transactionDate: -1 }).exec();
};

// Índices compuestos y específicos
TransactionSchema.index({ 'itemDetails.itemId': 1, 'itemDetails.itemType': 1 });
TransactionSchema.index({ 'paymentDetails.fundingSourceId': 1 });
TransactionSchema.index({ 'capitalDeclaration.fundingSourceId': 1 });
TransactionSchema.index({ tags: 1 });
TransactionSchema.index({ type: 1, transactionDate: -1 });
TransactionSchema.index({ contactId: 1, transactionDate: -1 });

const TransactionModel = mongoose.model<ITransaction, ITransactionModel>('Transaction', TransactionSchema);

export default TransactionModel; 