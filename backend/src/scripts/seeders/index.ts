import mongoose from 'mongoose';
import { seedTibiaGame } from './tibiaSeeder';
import { logger } from '../../utils/logger';
import { MONGODB_URI } from '../../config/database';

const runSeeders = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Conectado a MongoDB');

    // Ejecutar seeders
    await seedTibiaGame();

    logger.info('Todos los seeders completados exitosamente');
  } catch (error) {
    logger.error('Error ejecutando seeders:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Desconectado de MongoDB');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeeders();
}

export { runSeeders }; 