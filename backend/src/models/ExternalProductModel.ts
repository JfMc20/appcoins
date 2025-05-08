import mongoose, { Schema, Document, Types } from 'mongoose';
import { IGame } from './GameModel'; // Para la referencia opcional a Game

// Interfaz para el subdocumento de un ítem de stock individual (ej. un código de activación)
export interface IStockItem {
  code: string; // El código o identificador único del ítem de stock
  status: 'available' | 'sold' | 'reserved' | 'used' | 'expired';
  addedAt?: Date;
  soldAt?: Date;
  transactionId?: Types.ObjectId; // ID de la transacción de venta
  notes?: string;
}

// Interfaz para definir precio y costo
export interface IMoneyAmount {
  amount: number;
  currency: string; // ej. "USDT", "VES"
}

// Interfaz para el documento ExternalProduct
export interface IExternalProduct extends Document {
  name: string; // Nombre del producto
  productCode?: string; // Código corto o SKU
  category: string; // Categoría del producto
  description?: string;
  supplier?: string; // Proveedor del producto
  relatedGameId?: Types.ObjectId | IGame; // Referencia opcional a Game si es específico para un juego
  managesStock: boolean; // Si se gestiona stock
  currentStock: number; // Cantidad actual en stock (si managesStock es true y no se usan stockItems individuales)
  lowStockThreshold?: number;
  stockItems?: IStockItem[]; // Array de ítems de stock individuales (si aplica)
  price: IMoneyAmount; // Precio de venta
  cost?: IMoneyAmount; // Costo de adquisición (opcional)
  status: 'active' | 'discontinued' | 'out_of_stock';
  imageUrl?: string;
  tags?: string[];
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const StockItemSchema: Schema<IStockItem> = new Schema({
  code: { type: String, required: true, trim: true, unique: true, sparse: true }, // Único si se provee
  status: {
    type: String,
    required: true,
    enum: ['available', 'sold', 'reserved', 'used', 'expired'],
    default: 'available',
  },
  addedAt: { type: Date, default: Date.now },
  soldAt: { type: Date },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' }, // Referencia a Transaction
  notes: { type: String, trim: true },
}, { _id: true }); // _id: true para que cada stockItem tenga su propio ID si es necesario para manipulación individual

const MoneyAmountSchema: Schema<IMoneyAmount> = new Schema({
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, uppercase: true, trim: true },
}, { _id: false });

const ExternalProductSchema: Schema<IExternalProduct> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
      // Considerar índice unique si los nombres de producto deben ser únicos globalmente
      // index: { unique: true }
    },
    productCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      // Se podría usar un enum si las categorías son fijas
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    relatedGameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      // No es requerido
    },
    managesStock: {
      type: Boolean,
      default: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
      // Validador: Requerido si managesStock es true Y no se están usando stockItems
      // Esto es más complejo de validar a nivel de schema si stockItems es la alternativa
      // Se podría manejar en la lógica de negocio o con un validador más avanzado.
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
    },
    stockItems: {
      type: [StockItemSchema],
      default: [],
    },
    price: {
      type: MoneyAmountSchema,
      required: true,
    },
    cost: {
      type: MoneyAmountSchema,
      // No es requerido
    },
    status: {
      type: String,
      enum: ['active', 'discontinued', 'out_of_stock'],
      default: 'active',
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      // Cada tag puede ser trim y lowercase si se desea normalizar
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Índices sugeridos
ExternalProductSchema.index({ name: 1 });
// El índice unique en productCode ya está definido en el schema.
ExternalProductSchema.index({ category: 1 });
ExternalProductSchema.index({ status: 1 });
ExternalProductSchema.index({ relatedGameId: 1 });
ExternalProductSchema.index({ tags: 1 });
ExternalProductSchema.index({ 'stockItems.code': 1 }, { sparse: true }); // Para buscar por código de stockItem
ExternalProductSchema.index({ 'stockItems.status': 1 }); // Para buscar stockItems por estado

const ExternalProductModel = mongoose.model<IExternalProduct>('ExternalProduct', ExternalProductSchema);

export default ExternalProductModel; 