import express from 'express';
import { getExchangeRates, refreshExchangeRates } from '../controllers/settingsController';
import { logger } from '../utils/logger'; // Importar logger
import { protectWithJwt, restrictTo } from '../middleware/authMiddleware'; // Importar protectWithJwt y restrictTo
// Importar middlewares de autenticación/autorización si son necesarios aquí
// import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware'; // Ejemplo

logger.info('[Router] Configurando router de settings...'); // <<< LOG AÑADIDO (Nivel Módulo)

const router = express.Router();

// GET /api/settings/exchange-rates
// En modo desarrollo, deshabilitamos temporalmente la autenticación
router.get(
  '/exchange-rates',
  protectWithJwt,        // Usar autenticación JWT
  restrictTo('admin'), // Requerir rol de administrador
  (req, res, next) => {
    logger.info('[Router] Petición GET /api/settings/exchange-rates recibida por admin.');
    getExchangeRates(req, res, next);
  }
);

// POST /api/settings/exchange-rates/refresh
// En modo desarrollo, deshabilitamos temporalmente la autenticación
router.post(
  '/exchange-rates/refresh',
  protectWithJwt,        // Usar autenticación JWT
  restrictTo('admin'), // Requerir rol de administrador
  (req, res, next) => { // <<< Envoltura y LOG AÑADIDO
    logger.info('[Router] Petición POST /api/settings/exchange-rates/refresh recibida por admin.');
    refreshExchangeRates(req, res, next);
  }
);

export default router; 