import mongoose, { Schema, Document, Types } from 'mongoose';
import { IGame } from './GameModel'; // Asumiendo que IGame está en GameModel.ts

// Interface para los atributos dinámicos
interface IAttribute {
  key: string;
  value: string;
}

// Interface para el costo promedio en moneda de referencia
interface IAverageCostRef {
  amount: number;
  currency: string;
}

// Interface para la información de precios del GameItem
interface IPricingInfo {
  strategy: 'fixed' | 'margin' | 'other';
  referenceCurrency: string; // ej. "USDT"
  sellPricePerUnit?: number; // Opcional si solo compras
  buyPricePerUnit?: number;  // Opcional si solo vendes
  lastUpdated?: Date;
}

export interface IGameItem extends Document {
  gameId: Types.ObjectId | IGame; // Puede ser ObjectId o el documento poblado de Game
  name: string;
  itemCode?: string;
  type: string;
  description?: string;
  iconUrl?: string;
  stackable: boolean;
  isTradable: boolean;
  defaultUnit?: string;
  managesStock: boolean;
  currentStock: number;
  lowStockThreshold?: number;
  status: 'active' | 'archived' | 'rare_find';
  attributes?: IAttribute[];
  averageCostRef?: IAverageCostRef;
  pricing?: IPricingInfo; // Información de precios
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

const AttributeSchema: Schema<IAttribute> = new Schema({
  key: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
}, { _id: false }); // _id: false para subdocumentos si no se necesita un ID individual para cada atributo

const AverageCostRefSchema: Schema<IAverageCostRef> = new Schema({
  amount: { type: Number, required: true },
  currency: { type: String, required: true, trim: true },
}, { _id: false });

const PricingSchema: Schema<IPricingInfo> = new Schema({
  strategy: {
    type: String,
    enum: ['fixed', 'margin', 'other'],
    required: true,
    default: 'fixed',
  },
  referenceCurrency: {
    type: String,
    required: true,
    default: 'USDT', // Podría tomarse de appSettings.defaultReferenceCurrency
    uppercase: true,
    trim: true,
  },
  sellPricePerUnit: { type: Number, min: 0 },
  buyPricePerUnit: { type: Number, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

const GameItemSchema: Schema<IGameItem> = new Schema(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game', // Referencia al modelo Game
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    itemCode: {
      type: String,
      trim: true,
      // Considerar un índice compuesto (gameId, itemCode) { unique: true, sparse: true } si itemCode debe ser único por juego
    },
    type: {
      type: String,
      required: true,
      trim: true,
      // Podría ser un enum si los tipos son fijos: enum: ['Moneda', 'Equipamiento', 'Consumible', ...]
    },
    description: {
      type: String,
      trim: true,
    },
    iconUrl: {
      type: String,
      trim: true,
    },
    stackable: {
      type: Boolean,
      default: true,
    },
    isTradable: {
      type: Boolean,
      default: true,
    },
    defaultUnit: {
      type: String,
      trim: true,
    },
    managesStock: {
      type: Boolean,
      default: false,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0, // El stock no puede ser negativo
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'rare_find'],
      default: 'active',
    },
    attributes: [AttributeSchema], // Array de subdocumentos
    averageCostRef: AverageCostRefSchema, // Subdocumento embebido
    pricing: PricingSchema, // Campo de precios añadido
  },
  {
    timestamps: true,
  }
);

// Índice para asegurar que itemCode sea único dentro de un mismo gameId, si se decide implementarlo así.
// GameItemSchema.index({ gameId: 1, itemCode: 1 }, { unique: true, sparse: true });

// Índice para asegurar que el nombre del item sea único dentro de un mismo juego (sugerido en el doc)
GameItemSchema.index({ gameId: 1, name: 1 }, { unique: true });

const GameItemModel = mongoose.model<IGameItem>('GameItem', GameItemSchema);

export default GameItemModel; 