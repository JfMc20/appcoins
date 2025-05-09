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
import adminRoutes from './routes/adminRoutes'; // Importar las nuevas rutas de admin
import userRoutes from './routes/UserRoutes'; // <--- AÑADIR ESTA IMPORTACIÓN

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

// logger.info('[App] Montando rutas de transactions en /api/transactions...');
// app.use('/api/transactions', transactionRoutes); // Comentado previamente para diagnóstico

logger.info('[App] Montando rutas de gestión de usuarios en /api/admin/users...'); // <--- AÑADIR LOG
app.use('/api/admin/users', userRoutes); // <--- MONTAR LAS NUEVAS RUTAS

// logger.info('[App] Montando rutas de admin en /api/admin...');
// app.use('/api/admin', adminRoutes); // Comentado previamente para diagnóstico

// app.use('/api/games', gameRoutes);
// ... etc

// Manejo de rutas no encontradas (404) - Alternativa
// app.all('*', (req, res, next) => {
//   const err = new NotFoundError(`No se encuentra la ruta ${req.originalUrl} en este servidor.`);
//   next(err);
// }); // Este es el que causaba problemas, lo dejamos comentado y eliminado su referencia de "mantener comentado"

// Alternativa para manejo de 404: middleware sin ruta específica
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new NotFoundError(`No se encuentra la ruta ${req.originalUrl} en este servidor.`);
  next(err);
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

export default app; 