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
import contactRoutes from './routes/contactRoutes'; // <-- Importar nuevas rutas de contactos
import priceRoutes from './routes/priceRoutes'; // Importar las nuevas rutas de precios

// Inicializar la aplicación Express
const app: Application = express();

// Middlewares
app.use(cors({
  origin: '*', // Permitir cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Configuración personalizada de Morgan para logs detallados
morgan.token('body', (req: Request) => JSON.stringify(req.body));
morgan.token('query', (req: Request) => JSON.stringify(req.query));

// Formato personalizado de Morgan que incluye todos los detalles
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms - Body: :body - Query: :query';

// Middleware para registrar todas las solicitudes con formato detallado
app.use(morgan(morganFormat, {
  immediate: false, // Registra después de completarse la solicitud (incluye códigos de estado)
  stream: {
    write: (message: string) => {
      // Quitamos el salto de línea del final
      logger.info(message.trim());
    }
  }
}));

// Middleware para rastrear el tiempo de respuesta
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.url, res.statusCode, duration);
  });
  next();
});

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

logger.info('[App] Montando rutas de contactos en /api/contacts...');
app.use('/api/contacts', contactRoutes); // <-- Usar rutas de contactos

logger.info('[App] Montando rutas de precios en /api/prices...');
app.use('/api/prices', priceRoutes); // Registrar las nuevas rutas de precios

// Manejo de rutas no encontradas (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new NotFoundError(`No se encuentra la ruta ${req.originalUrl} en este servidor.`);
  next(err);
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

export default app; 