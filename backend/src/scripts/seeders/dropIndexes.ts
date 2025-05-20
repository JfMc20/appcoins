import mongoose from 'mongoose';
import { MONGODB_URI } from '../../config/database';
import { logger } from '../../utils/logger';

const dropIndexes = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      logger.info(`Eliminando índices de la colección: ${collectionName}`);
      
      await db.collection(collectionName).dropIndexes();
      logger.info(`Índices eliminados de ${collectionName}`);
    }

    logger.info('Todos los índices han sido eliminados');
  } catch (error) {
    logger.error('Error eliminando índices:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Desconectado de MongoDB');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  dropIndexes();
}

export default dropIndexes; 