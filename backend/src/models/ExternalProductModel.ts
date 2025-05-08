import mongoose, { Schema, Document, Types } from 'mongoose';
import { IGame } from './GameModel'; // Para la referencia opcional a Game

// Interface para un item individual de stock (ej. código de activación)
interface IStockItem {
  code: string;
  status: 'available' | 'sold' | 'used' | 'expired';
  addedAt?: Date;
  soldAt?: Date;
  transactionId?: Types.ObjectId; // Referencia a la transacción de venta
  // Otros campos relevantes para el item de stock
}

// Interface para la información de precio
interface IPriceInfo {
  amount: number;
  currency: string; // ej: "USDT", "VES", "USD"
}

export interface IExternalProduct extends Document {
  name: string;
  productCode?: string;
  category: string;
  description?: string;
  supplier?: string;
  relatedGameId?: Types.ObjectId | IGame; // Opcional
  managesStock: boolean;
  currentStock: number;
  lowStockThreshold?: number;
  stockItems?: IStockItem[]; // Para rastrear items individuales si es necesario
  price: IPriceInfo;
  cost?: IPriceInfo; // Opcional
  status: 'active' | 'discontinued' | 'out_of_stock' | 'coming_soon';
  imageUrl?: string;
  tags?: string[];
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

const StockItemSchema: Schema<IStockItem> = new Schema({
  code: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['available', 'sold', 'used', 'expired'],
    required: true,
    default: 'available',
  },
  addedAt: { type: Date, default: Date.now },
  soldAt: { type: Date },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' }, // Asumiendo un modelo Transaction
}, { _id: false }); // O _id: true si cada stock item debe tener su propio ObjectId

const PriceInfoSchema: Schema<IPriceInfo> = new Schema({
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, trim: true },
}, { _id: false });

const ExternalProductSchema: Schema<IExternalProduct> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Para búsquedas por nombre
    },
    productCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Si se usa, debe ser único
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    relatedGameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game', // Referencia al modelo Game
      index: true, // Si se filtra frecuentemente por juego relacionado
    },
    managesStock: {
      type: Boolean,
      default: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
    },
    stockItems: [StockItemSchema], // Array de subdocumentos para códigos únicos
    price: {
      type: PriceInfoSchema,
      required: true,
    },
    cost: PriceInfoSchema, // Opcional
    status: {
      type: String,
      enum: ['active', 'discontinued', 'out_of_stock', 'coming_soon'],
      default: 'active',
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true, index: true }], // Array de strings
  },
  {
    timestamps: true,
  }
);

const ExternalProductModel = mongoose.model<IExternalProduct>(
  'ExternalProduct',
  ExternalProductSchema
);

export default ExternalProductModel; 