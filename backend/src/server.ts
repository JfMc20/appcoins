import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno desde .env

import app from './app';
import connectDB from './config/database'; // Importar la función de conexión
import cron from 'node-cron'; // Importar node-cron
import { updateFiatExchangeRates } from './services/ExchangeRateService'; // Importar la función de actualización
import { logger } from './utils/logger'; // Importar el logger

const PORT: string | number = process.env.PORT || 3002; // Usar el puerto de .env o 3002 por defecto
const CRON_SCHEDULE = '*/30 * * * *'; // Ejecutar cada 30 minutos

// Función autoejecutable asíncrona para manejar la conexión a la BD y luego iniciar el servidor
const startServer = async () => {
  try { // Envolver en try/catch para capturar error de conexión a BD
    await connectDB(); // Conectar a la base de datos

    // Llamada inicial para actualizar tasas al arrancar (después de conectar a BD)
    logger.info('Realizando actualización inicial de tasas de cambio...');
    await updateFiatExchangeRates().catch(err => {
      logger.error('Error durante la actualización inicial de tasas:', err);
    });

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT}`);

      // Programar el cron job después de que el servidor esté escuchando
      logger.info(`Programando actualización de tasas con schedule: ${CRON_SCHEDULE}`);
      cron.schedule(CRON_SCHEDULE, async () => {
        logger.cron('Ejecutando tarea cron: Actualización de tasas de cambio...');
        try {
          await updateFiatExchangeRates();
          logger.cron('Tarea cron: Actualización de tasas completada.');
        } catch (error) {
          logger.error('Tarea cron: Error durante la actualización de tasas:', error);
        }
      });
    });
  } catch (error) {
    // Este catch es por si connectDB falla inicialmente
    logger.error("Error fatal al iniciar el servidor (posiblemente conexión a BD inicial fallida):", error);
    process.exit(1);
  }
};

startServer(); // No necesitamos el .catch aquí si lo manejamos dentro de startServer 