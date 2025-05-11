import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno desde .env

import app from './app';
import connectDB from './config/database'; // Importar la función de conexión
import cron from 'node-cron'; // Importar node-cron
import { updateFiatExchangeRates } from './services/ExchangeRateService'; // Importar la función de actualización
import { logger } from './utils/logger'; // Importar el logger

const PORT = parseInt(process.env.PORT || '3002', 10); // Convertir a number
const CRON_SCHEDULE = '*/30 * * * *'; // Ejecutar cada 30 minutos

// Función para actualizar tasas con manejo de errores mejorado
const safeUpdateRates = async () => {
  try {
    logger.info('Realizando actualización de tasas de cambio...');
    await updateFiatExchangeRates();
    logger.info('Actualización de tasas completada exitosamente.');
  } catch (err) {
    logger.error('Error durante la actualización de tasas, el servidor continuará funcionando:', err);
    // No detener el servidor por un error en las tasas
  }
};

// Función autoejecutable asíncrona para manejar la conexión a la BD y luego iniciar el servidor
const startServer = async () => {
  try { // Envolver en try/catch para capturar error de conexión a BD
    await connectDB(); // Conectar a la base de datos

    // Primero iniciar el servidor para que responda a las peticiones
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Servidor corriendo en el puerto ${PORT} y escuchando en todas las interfaces`);
      
      // Agregar una ruta de ping para verificación de vida del servidor
      app.get('/api/status/ping', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
      });
      
      // Agregar una ruta de ping para autenticación
      app.get('/api/auth/ping', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Auth service is running' });
      });

      // Luego actualizar las tasas de manera asíncrona
      setTimeout(() => {
        // Llamada inicial para actualizar tasas (después de que el servidor ya está respondiendo)
        safeUpdateRates();

        // Programar el cron job después de que el servidor esté escuchando
        logger.info(`Programando actualización de tasas con schedule: ${CRON_SCHEDULE}`);
        cron.schedule(CRON_SCHEDULE, safeUpdateRates);
      }, 5000); // Esperar 5 segundos para que el servidor esté completamente listo
    });

    // Manejo de errores del servidor HTTP
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`El puerto ${PORT} ya está en uso. No se puede iniciar el servidor.`);
      } else {
        logger.error('Error en el servidor HTTP:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    // Este catch es por si connectDB falla inicialmente
    logger.error("Error fatal al iniciar el servidor (posiblemente conexión a BD inicial fallida):", error);
    process.exit(1);
  }
};

startServer(); // No necesitamos el .catch aquí si lo manejamos dentro de startServer 