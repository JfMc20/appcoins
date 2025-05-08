import mongoose, { Schema, Document, Types } from 'mongoose';
// import { IGame } from './GameModel'; // Para la referencia opcional en ContactMethod

interface IContactMethod {
  platform: string; // ej: "WhatsApp", "Telegram", "Discord", "InGame", "Email", "Phone"
  identifier: string; // ej: "+123456789", "usuarioDiscord#1234", "correo@dominio.com"
  gameId?: Types.ObjectId; // Opcional, referencia a Game si es un contacto InGame
}

const ContactMethodSchema: Schema<IContactMethod> = new Schema({
  platform: { type: String, required: true, trim: true },
  identifier: { type: String, required: true, trim: true },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game' }, // Referencia a Game
}, { _id: false });


interface ITotalVolume {
  amount: number;
  currency: string; // ej. "USDT"
}

const TotalVolumeSchema: Schema<ITotalVolume> = new Schema({
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, trim: true },
}, { _id: false });


export interface IContact extends Document {
  displayName: string;
  firstName?: string;
  lastName?: string;
  type: 'Cliente' | 'Proveedor' | 'Ambos' | 'Otro';
  primaryContactMethod?: IContactMethod;
  additionalContactMethods?: IContactMethod[];
  notes?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'blocked';
  lastTransactionDate?: Date;
  totalTransactionsCount?: number;
  totalVolume?: ITotalVolume;
  profileImageUrl?: string;
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Cliente', 'Proveedor', 'Ambos', 'Otro'],
      default: 'Cliente',
      index: true,
    },
    primaryContactMethod: ContactMethodSchema, // Subdocumento embebido
    additionalContactMethods: [ContactMethodSchema], // Array de subdocumentos
    notes: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true, index: true }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
      index: true,
    },
    lastTransactionDate: {
      type: Date,
      index: true,
    },
    totalTransactionsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalVolume: TotalVolumeSchema, // Subdocumento embebido
    profileImageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices sugeridos adicionales
ContactSchema.index({ 'primaryContactMethod.platform': 1, 'primaryContactMethod.identifier': 1 });
// Considerar si el siguiente índice es realmente necesario o si las búsquedas serán más generales
// ContactSchema.index({ 'additionalContactMethods.platform': 1, 'additionalContactMethods.identifier': 1 });


const ContactModel = mongoose.model<IContact>('Contact', ContactSchema);

export default ContactModel; 