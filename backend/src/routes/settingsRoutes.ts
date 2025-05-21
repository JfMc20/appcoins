import express from 'express';
import { getExchangeRates, refreshExchangeRates, getAppSettings, updateSupportedCurrencies, addExchangeRateAPI, updateExchangeRateAPI, deleteExchangeRateAPI, updateExchangeRatePairStatus } from '../controllers/settingsController';
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

// Rutas de Admin para Settings
// GET /api/settings/admin/appsettings (o /api/admin/settings si se usa un router base /admin)
router.get(
  '/admin/appsettings', // Ruta para obtener toda la configuración
  protectWithJwt,
  restrictTo('admin'),
  getAppSettings // Usar directamente la función del controlador
);

// PUT /api/settings/admin/supported-currencies
router.put(
  '/admin/supported-currencies',
  protectWithJwt,
  restrictTo('admin'),
  updateSupportedCurrencies // Usar directamente la función del controlador
);

// --- New Routes for Exchange Rate APIs (Admin) --- //

// POST /api/settings/admin/exchange-rate-apis
router.post(
  '/admin/exchange-rate-apis',
  protectWithJwt,
  restrictTo('admin'),
  addExchangeRateAPI
);

// PUT /api/settings/admin/exchange-rate-apis/:apiName
router.put(
  '/admin/exchange-rate-apis/:apiName',
  protectWithJwt,
  restrictTo('admin'),
  updateExchangeRateAPI
);

// DELETE /api/settings/admin/exchange-rate-apis/:apiName
router.delete(
  '/admin/exchange-rate-apis/:apiName',
  protectWithJwt,
  restrictTo('admin'),
  deleteExchangeRateAPI
);

// PUT /api/settings/exchange-rates/:pairKey/status - Nueva ruta para actualizar estado de habilitado
router.put(
  '/exchange-rates/:pairKey/status',
  protectWithJwt,        // Usar autenticación JWT
  restrictTo('admin'), // Requerir rol de administrador
  updateExchangeRatePairStatus // Usar la nueva función del controlador
);

export default router; 