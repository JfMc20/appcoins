import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './utils/logger'; // Importar logger
import { WachstumRateLimiter } from './middleware/rateLimiter'; // Asegúrate que la ruta sea correcta
import { NotFoundError, AppError } from './utils/errorHandler';
import { globalErrorHandler } from './middleware/errorHandlingMiddleware';

// Importar rutas
import settingsRoutes from './routes/settingsRoutes';
import fundingSourceRoutes from './routes/fundingSourceRoutes';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import adminRoutes from './routes/adminRoutes'; // Importar las rutas de admin
import userRoutes from './routes/UserRoutes'; // Importar rutas de gestión de usuarios
import gameRoutes from './routes/gameRoutes'; // Importar rutas de juegos
import gameItemRoutes from './routes/gameItemRoutes'; // Importar rutas de ítems de juego

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

logger.info('[App] Montando rutas de gestión de usuarios en /api/admin/users...');
app.use('/api/admin/users', userRoutes);

logger.info('[App] Montando rutas de admin en /api/admin...');
app.use('/api/admin', adminRoutes);

logger.info('[App] Montando rutas de juegos en /api/games...');
app.use('/api/games', gameRoutes);

logger.info('[App] Montando rutas de ítems de juego en /api/game-items...');
app.use('/api/game-items', gameItemRoutes);

// Manejo de rutas no encontradas (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new NotFoundError(`No se encuentra la ruta ${req.originalUrl} en este servidor.`);
  next(err);
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

export default app; 