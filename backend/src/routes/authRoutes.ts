import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { logger } from '../utils/logger';

const router = express.Router();
logger.info('[Router] Configurando router de auth...');

// POST /api/auth/register - Registrar un nuevo usuario
router.post('/register', registerUser);

// POST /api/auth/login - Autenticar un usuario y obtener token JWT
router.post('/login', loginUser);

// Se podrían añadir otras rutas relacionadas con auth aquí en el futuro
// ej. /password-reset, /verify-email, /refresh-token

export default router; 