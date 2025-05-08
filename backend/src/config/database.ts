import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Asegurarse de que las variables de entorno estén cargadas

// La URI de MongoDB puede venir de una variable de entorno (para Docker Compose/Producción)
// o usar un valor predeterminado para desarrollo local.
const MONGO_URI_DEFAULT = 'mongodb://localhost:27017/AdminCoins';
const MONGO_URI = process.env.MONGODB_URI || MONGO_URI_DEFAULT;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado exitosamente.');

    // Opcional: Escuchar eventos de conexión después de la conexión inicial
    mongoose.connection.on('error', (err) => {
      console.error(`Error en la conexión a MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado.');
    });

  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    // Salir del proceso con fallo si no se puede conectar a la BD
    // En un entorno de producción, podrías querer reintentar o manejarlo de otra forma.
    process.exit(1);
  }
};

export default connectDB; 