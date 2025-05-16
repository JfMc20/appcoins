import mongoose, { Schema, Document, Types } from 'mongoose';

// Interfaz para el documento de Precio
export interface IPrice extends Document {
  entityId: Types.ObjectId; // ID de la entidad a la que pertenece el precio (ej. GameItem, ExternalProduct)
  entityType: string; // Tipo de la entidad (ej. "GameItem", "ExternalProduct")
  priceType: string; // Tipo de precio (ej. "cost", "base_sell", "promo_sell", "purchase_cost")
  currency: string; // Código de la moneda del precio (ej. "USD", "USDT", "EUR")
  value: number; // Valor numérico del precio
  isActive: boolean; // Si el precio está actualmente activo
  validFrom?: Date; // Fecha desde la cual el precio es válido
  validTo?: Date; // Fecha hasta la cual el precio es válido
  region?: string; // Para precios específicos por región (opcional)
  notes?: string; // Notas adicionales (opcional)
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const PriceSchema: Schema<IPrice> = new Schema(
  {
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // Podríamos usar un enum si los tipos de entidad son fijos y conocidos
      // enum: ['GameItem', 'ExternalProduct'],
    },
    priceType: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // Ejemplo de tipos de precio, se pueden expandir
      // enum: ['cost', 'base_sell', 'promo_sell', 'recommended_retail', 'purchase_cost'],
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // Debería alinearse con las monedas soportadas o la moneda de referencia de AppSettings
    },
    value: {
      type: Number,
      required: true,
      min: 0, // Generalmente los precios no son negativos
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
    },
    validTo: {
      type: Date,
    },
    region: {
      type: String,
      trim: true,
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

// Índices compuestos para consultas comunes
PriceSchema.index({ entityId: 1, entityType: 1 });
PriceSchema.index({ entityId: 1, entityType: 1, priceType: 1, currency: 1, isActive: 1 }, { name: 'price_lookup_active' });
PriceSchema.index({ entityType: 1, priceType: 1, currency: 1 });


// Validaciones personalizadas (ejemplo)
PriceSchema.pre<IPrice>('save', function (next) {
  if (this.validFrom && this.validTo && this.validFrom > this.validTo) {
    next(new Error('La fecha "validFrom" no puede ser posterior a "validTo".'));
  } else {
    next();
  }
});

const PriceModel = mongoose.model<IPrice>('Price', PriceSchema);

export default PriceModel; 