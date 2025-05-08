import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './utils/logger'; // Importar logger

// Importar rutas
import settingsRoutes from './routes/settingsRoutes';
import fundingSourceRoutes from './routes/fundingSourceRoutes';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';

// Inicializar la aplicación Express
const app: Application = express();

// Middlewares
app.use(cors()); // Habilitar CORS para todas las rutas

// Usar Morgan con el formato 'dev' si estamos en desarrollo, o 'combined' en producción
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Ruta de prueba básica
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API de AdminCoins v1' });
});

// Rutas principales de la aplicación
logger.info('[App] Montando rutas de auth en /api/auth...');
app.use('/api/auth', authRoutes);

logger.info('[App] Montando rutas de settings en /api/settings...');
app.use('/api/settings', settingsRoutes);

logger.info('[App] Montando rutas de fundingSources en /api/funding-sources...');
app.use('/api/funding-sources', fundingSourceRoutes);

logger.info('[App] Montando rutas de transactions en /api/transactions...');
app.use('/api/transactions', transactionRoutes);

// app.use('/api/games', gameRoutes);
// ... etc

// Middleware de manejo de errores (usando logger)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error no manejado:', err.stack);
  // Evitar enviar detalles del error en producción por seguridad
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Si no se puso status antes, default a 500
  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
  });
});

export default app; 