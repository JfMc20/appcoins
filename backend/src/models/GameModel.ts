import mongoose, { Schema, Document } from 'mongoose';

// Interface para describir la estructura de un documento Game (opcional pero buena práctica)
export interface IGame extends Document {
  name: string;
  shortName?: string; // Opcional
  description?: string; // Opcional
  iconUrl?: string; // Opcional
  status: 'active' | 'archived' | 'coming_soon';
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

// Definición del Esquema
const GameSchema: Schema<IGame> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Elimina espacios en blanco al inicio y al final
      unique: true, // Asegura que el nombre del juego sea único
    },
    shortName: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permite múltiples documentos sin este campo, pero si está presente, debe ser único
    },
    description: {
      type: String,
      trim: true,
    },
    iconUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'coming_soon'],
      default: 'active',
    },
  },
  {
    timestamps: true, // Añade automáticamente los campos createdAt y updatedAt
  }
);

// Crear y exportar el modelo
// El primer argumento es el nombre singular de la colección a la que este modelo pertenece.
// Mongoose automáticamente buscará la versión plural en minúsculas de este nombre (ej. 'games')
const GameModel = mongoose.model<IGame>('Game', GameSchema);

export default GameModel; 