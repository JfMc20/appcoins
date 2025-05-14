import express, { Request, Response, NextFunction } from 'express';
import { createTransaction, getAllTransactions } from '../controllers/transactionController';
import { protectWithJwt } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();

logger.info('[Router] Configurando router de transacciones...');

/**
 * @desc    Obtener todas las transacciones (con paginación y filtros básicos por rol)
 * @route   GET /api/transactions
 * @access  Private (Requiere autenticación)
 */
router.get('/', protectWithJwt, getAllTransactions);

/**
 * @desc    Crear una nueva transacción
 * @route   POST /api/transactions
 * @access  Private (Requiere autenticación, permisos específicos manejados en el controlador)
 */
router.post(
  '/',
  protectWithJwt,
  (req: Request, res: Response, next: NextFunction) => {
    logger.info(`[Router] Petición POST /api/transactions recibida por usuario [${req.user?.id}].`);
    createTransaction(req, res, next);
  }
);

// Aquí se añadirían otras rutas para transacciones (GET /:id, PUT /:id, etc.) en el futuro.
// router.get('/:id', protectWithJwt, getTransactionById);
// router.put('/:id', protectWithJwt, restrictTo('admin'), updateTransaction);
// router.post('/:id/cancel', protectWithJwt, restrictTo('admin', 'operator'), cancelTransaction);

export default router; 