import mongoose, { Schema, Document, Types } from 'mongoose';
import { IGame } from './GameModel'; // Para la referencia a Game

// Interfaz para el subdocumento de atributos dinámicos
export interface IItemAttribute {
  key: string;
  value: string | number | boolean | Date; // Valor puede ser de varios tipos
  // Podría añadirse un 'displayType' si se quisiera controlar cómo se muestra en el frontend
}

// Interfaz para el subdocumento de costo promedio ponderado
export interface IAverageCost {
  amount: number;
  currency: string; // Moneda de referencia, ej. USDT
}

// Interfaz para el documento GameItem
export interface IGameItem extends Document {
  gameId: Types.ObjectId | IGame; // Referencia al juego al que pertenece
  name: string; // Nombre del ítem/moneda
  itemCode?: string; // Código corto o identificador interno
  type: string; // Categoría del ítem (ej. "Moneda", "Equipamiento", "Consumible")
  description?: string;
  iconUrl?: string;
  stackable: boolean; // Si el ítem se puede apilar
  isTradable: boolean; // Si el usuario de la app lo comercializa activamente
  defaultUnit?: string; // Unidad estándar para transacciones (ej. "unidad", "k", "kk")
  managesStock: boolean; // Si se gestiona un stock propio de este ítem
  currentStock: number; // Cantidad actual en stock (si managesStock es true)
  lowStockThreshold?: number; // Umbral para alerta de stock bajo
  status: 'active' | 'archived' | 'rare_find'; // Estado del ítem
  attributes?: IItemAttribute[]; // Propiedades dinámicas
  averageCostRef?: IAverageCost; // Costo promedio ponderado en moneda de referencia
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const ItemAttributeSchema: Schema<IItemAttribute> = new Schema({
  key: { type: String, required: true, trim: true },
  value: { type: Schema.Types.Mixed, required: true }, // Mixed permite varios tipos de datos
}, { _id: false });

const AverageCostSchema: Schema<IAverageCost> = new Schema({
  amount: { type: Number, required: true },
  currency: { type: String, required: true, uppercase: true, trim: true },
}, { _id: false });

const GameItemSchema: Schema<IGameItem> = new Schema(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    itemCode: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // Único dentro del mismo gameId si se proporciona
      maxlength: 50,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      // Se podría usar un enum si las categorías son fijas
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
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
      maxlength: 20,
    },
    managesStock: {
      type: Boolean,
      default: false, // Cambiado a false según el documento, para ítems "por pedido"
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0, // El stock no puede ser negativo
      // Validador condicional: requerido si managesStock es true
      validate: {
        validator: function (this: IGameItem, value: number) {
          return !this.managesStock || (this.managesStock && typeof value === 'number');
        },
        message: 'currentStock es requerido si managesStock es true.'
      }
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'rare_find'],
      default: 'active',
      required: true,
    },
    attributes: {
      type: [ItemAttributeSchema],
      default: [],
    },
    averageCostRef: {
      type: AverageCostSchema,
      // No hay default, se calculará y establecerá por lógica de negocio
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Índices sugeridos
GameItemSchema.index({ gameId: 1 });
GameItemSchema.index({ gameId: 1, name: 1 }, { unique: true });
GameItemSchema.index({ gameId: 1, itemCode: 1 }, { unique: true, sparse: true }); // Asegura unicidad si itemCode existe
GameItemSchema.index({ type: 1 });
GameItemSchema.index({ status: 1 });
GameItemSchema.index({ managesStock: 1 });

const GameItemModel = mongoose.model<IGameItem>('GameItem', GameItemSchema);

export default GameItemModel; 