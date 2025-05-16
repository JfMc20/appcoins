import express from 'express';
import {
  createPrice,
  getPrices,
  getPriceById,
  updatePrice,
  deletePrice
} from '../controllers/priceController';
import { protectWithJwt, restrictTo } from '../middleware/authMiddleware'; // Asegúrate que la ruta sea correcta
import { logger } from '../utils/logger';

const router = express.Router();

logger.info('[Router] Configurando router de precios...');

// Todas las rutas de precios requieren autenticación y rol de administrador
router.use(protectWithJwt, restrictTo('admin'));

router.route('/')
  .post(createPrice) // POST /api/prices
  .get(getPrices);    // GET /api/prices?entityId=...&entityType=...

router.route('/:priceId')
  .get(getPriceById)    // GET /api/prices/:priceId
  .put(updatePrice)     // PUT /api/prices/:priceId
  .delete(deletePrice); // DELETE /api/prices/:priceId

export default router; 