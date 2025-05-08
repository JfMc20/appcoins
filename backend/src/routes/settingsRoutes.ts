import express from 'express';
import { getExchangeRates, refreshExchangeRates } from '../controllers/settingsController';
import { logger } from '../utils/logger'; // Importar logger
import { simpleApiKeyAuth } from '../middleware/authMiddleware'; // <<< IMPORTAR MIDDLEWARE
// Importar middlewares de autenticación/autorización si son necesarios aquí
// import { isAuthenticated, isAdmin } from '../middlewares/authMiddleware'; // Ejemplo

logger.info('[Router] Configurando router de settings...'); // <<< LOG AÑADIDO (Nivel Módulo)

const router = express.Router();

// GET /api/settings/exchange-rates
// Protegido con API Key
router.get(
  '/exchange-rates',
  simpleApiKeyAuth, // <<< APLICAR MIDDLEWARE
  (req, res, next) => {
    logger.info('[Router] Petición GET /api/settings/exchange-rates recibida (autenticada).');
    getExchangeRates(req, res, next);
  }
);

// POST /api/settings/exchange-rates/refresh
// Dispara la actualización manual. Protegido con API Key.
router.post(
  '/exchange-rates/refresh',
  simpleApiKeyAuth, // <<< APLICAR MIDDLEWARE
  (req, res, next) => { // <<< Envoltura y LOG AÑADIDO
    logger.info('[Router] Petición POST /api/settings/exchange-rates/refresh recibida (autenticada).');
    refreshExchangeRates(req, res, next);
  }
);

export default router; 