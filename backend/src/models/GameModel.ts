import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento Game
export interface IGame extends Document {
  name: string; // Nombre del juego, ej: "Tibia", "Albion Online"
  shortName?: string; // Nombre corto o código, ej: "TB", "AO"
  description?: string; // Descripción breve del juego
  iconUrl?: string; // URL a un logo o ícono del juego
  status: 'active' | 'archived' | 'coming_soon'; // Estado del juego en la plataforma
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const GameSchema: Schema<IGame> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Asumiendo que el nombre del juego debe ser único
      trim: true,
      maxlength: 100,
    },
    shortName: {
      type: String,
      unique: true,
      sparse: true, // Permite múltiples documentos con shortName null/undefined, pero si existe, debe ser único
      trim: true,
      uppercase: true,
      maxlength: 10,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    iconUrl: {
      type: String,
      trim: true,
      // Se podría añadir validación de URL si se desea
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'coming_soon'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Índices sugeridos por el documento de diseño
// El índice unique en 'name' ya está definido en el schema.
// El índice unique y sparse en 'shortName' ya está definido en el schema.
GameSchema.index({ status: 1 });

const GameModel = mongoose.model<IGame>('Game', GameSchema);

export default GameModel; 