import mongoose, { Schema, Document, Types } from 'mongoose';
// import { IUser } from './UserModel'; // Si los contactos están vinculados a un usuario/operador específico

// Interfaz para el subdocumento de información de contacto adicional
export interface IContactDetail {
  type: 'email' | 'phone' | 'whatsapp' | 'telegram' | 'discord' | 'game_username' | 'other';
  value: string;
  label?: string; // Ej. "Principal", "Secundario", "Trabajo"
  isPrimary?: boolean;
}

// Interfaz para el subdocumento de dirección
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  label?: string; // Ej. "Casa", "Oficina"
}

// Interfaz para el documento Contact
export interface IContact extends Document {
  // userId?: Types.ObjectId | IUser; // A qué usuario del sistema pertenece este contacto (si aplica)
  contactType: 'client' | 'provider' | 'other'; // Tipo de contacto
  name: string; // Nombre completo o de la empresa
  nickname?: string; // Apodo o nombre corto
  primaryEmail?: string; // Email principal (para conveniencia, aunque también puede estar en contactDetails)
  primaryPhone?: string; // Teléfono principal
  companyName?: string; // Si es una empresa
  taxId?: string; // CIF/NIF/RIF u otro identificador fiscal
  contactDetails?: IContactDetail[]; // Array de múltiples formas de contacto
  addresses?: IAddress[]; // Array de direcciones
  status: 'active' | 'inactive' | 'potential' | 'blocked';
  notes?: string;
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactDetailSchema: Schema<IContactDetail> = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['email', 'phone', 'whatsapp', 'telegram', 'discord', 'game_username', 'other'],
  },
  value: { type: String, required: true, trim: true },
  label: { type: String, trim: true },
  isPrimary: { type: Boolean, default: false },
}, { _id: false });

const AddressSchema: Schema<IAddress> = new Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, trim: true },
  label: { type: String, trim: true },
}, { _id: false });

const ContactSchema: Schema<IContact> = new Schema(
  {
    // userId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   // Considerar si es requerido o si los contactos son globales
    // },
    contactType: {
      type: String,
      required: true,
      enum: ['client', 'provider', 'other'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true, // Para búsquedas por nombre
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    primaryEmail: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // No todos los contactos tendrán email, pero si lo tienen, podría ser único
      // index: { unique: true, sparse: true } // Si se quiere unicidad de email
      // match: /regex_email/ // Validación de formato
    },
    primaryPhone: {
      type: String,
      trim: true,
      sparse: true,
      // index: { unique: true, sparse: true } // Si se quiere unicidad de teléfono
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    taxId: {
      type: String,
      trim: true,
      sparse: true,
      // index: { unique: true, sparse: true } // Si se quiere unicidad de taxId
    },
    contactDetails: {
      type: [ContactDetailSchema],
      default: [],
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'potential', 'blocked'],
      default: 'active',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Índices sugeridos
ContactSchema.index({ contactType: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ 'contactDetails.value': 1 }); // Para buscar por algún valor en los detalles de contacto

const ContactModel = mongoose.model<IContact>('Contact', ContactSchema);

export default ContactModel; 