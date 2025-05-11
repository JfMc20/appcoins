import express from 'express';
import { registerUser, loginUser, getRegistrationStatus } from '../controllers/authController';
import { logger } from '../utils/logger';

const router = express.Router();
logger.info('[Router] Configurando router de auth...');

// GET /api/auth/ping - Verificar disponibilidad del servicio de autenticación
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth service is running' });
});

// POST /api/auth/register - Registrar un nuevo usuario
router.post('/register', registerUser);

// POST /api/auth/login - Autenticar un usuario y obtener token JWT
router.post('/login', loginUser);

// GET /api/auth/registration-status - Verificar si el registro está abierto
router.get('/registration-status', getRegistrationStatus);

// Se podrían añadir otras rutas relacionadas con auth aquí en el futuro
// ej. /password-reset, /verify-email, /refresh-token

export default router; 