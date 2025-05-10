import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el subdocumento de métricas/estadísticas
export interface IGameMetrics {
  playerBase?: number; // Número estimado de jugadores activos
  popularity?: number; // Puntuación de 1-10 de popularidad
  profitMargin?: number; // Margen de beneficio promedio (%)
  lastUpdated?: Date; // Fecha de última actualización de métricas
}

// Interfaz para el documento Game
export interface IGame extends Document {
  name: string; // Nombre del juego, ej: "Tibia", "Albion Online"
  shortName?: string; // Nombre corto o código, ej: "TB", "AO"
  description?: string; // Descripción breve del juego
  iconUrl?: string; // URL a un logo o ícono del juego
  officialUrl?: string; // URL oficial del juego
  releaseDate?: Date; // Fecha de lanzamiento del juego
  lastVersionUpdate?: Date; // Fecha de última actualización importante
  platform?: string[]; // Plataformas en las que está disponible (PC, Mobile, Console)
  metrics?: IGameMetrics; // Métricas y estadísticas del juego
  status: 'active' | 'archived' | 'coming_soon'; // Estado del juego en la plataforma
  // Timestamps de Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const GameMetricsSchema: Schema<IGameMetrics> = new Schema({
  playerBase: { 
    type: Number, 
    min: 0 
  },
  popularity: { 
    type: Number, 
    min: 1, 
    max: 10 
  },
  profitMargin: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

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
    officialUrl: {
      type: String,
      trim: true,
      // Validador simple para formato de URL
      validate: {
        validator: function(v: string) {
          return !v || /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(v);
        },
        message: props => `${props.value} no es una URL válida`
      }
    },
    releaseDate: {
      type: Date,
    },
    lastVersionUpdate: {
      type: Date,
    },
    platform: {
      type: [String],
      enum: ['PC', 'Mobile', 'Console', 'Web'],
      default: ['PC']
    },
    metrics: {
      type: GameMetricsSchema,
      default: {}
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
GameSchema.index({ platform: 1 }); // Nuevo índice para búsquedas por plataforma

const GameModel = mongoose.model<IGame>('Game', GameSchema);

export default GameModel; 