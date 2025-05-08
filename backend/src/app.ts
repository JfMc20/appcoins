import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Inicializar la aplicación Express
const app: Application = express();

// Middlewares
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(morgan('dev')); // Logger de peticiones HTTP en modo desarrollo
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Ruta de prueba básica
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '¡Bienvenido a la API de AdminCoins con TypeScript!' });
});

// Aquí se añadirán las rutas principales de la aplicación
// Ejemplo: import gameRoutes from './routes/gameRoutes';
// app.use('/api/games', gameRoutes);

// Manejo de errores (básico por ahora)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

export default app; 