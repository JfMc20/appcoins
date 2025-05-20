import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config(); // Asegurarse de que las variables de entorno estén cargadas

// La URI de MongoDB puede venir de una variable de entorno (para Docker Compose/Producción)
// o usar un valor predeterminado para desarrollo local.
const MONGO_URI_DEFAULT = 'mongodb://localhost:27017/AdminCoins';
export const MONGODB_URI = process.env.MONGODB_URI || MONGO_URI_DEFAULT;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.db('Conectado exitosamente a MongoDB.');

    // Opcional: Escuchar eventos de conexión después de la conexión inicial
    mongoose.connection.on('error', (err) => {
      logger.error('Error en la conexión a MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado.');
    });

  } catch (error) {
    logger.error('Error fatal al conectar con MongoDB:', error);
    // Salir del proceso con fallo si no se puede conectar a la BD
    // En un entorno de producción, podrías querer reintentar o manejarlo de otra forma.
    process.exit(1);
  }
};

export default connectDB; 