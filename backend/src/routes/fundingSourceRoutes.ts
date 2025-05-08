import express from 'express';
import {
  createFundingSource,
  getAllFundingSources,
  getFundingSourceById,
  updateFundingSource,
  archiveFundingSource
} from '../controllers/fundingSourceController';
import { protectWithJwt } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();
logger.info('[Router] Configurando router de fundingSources...');

// Aplicar protección JWT a TODAS las rutas de este router
router.use(protectWithJwt);

// POST /api/funding-sources - Crear una nueva fuente de fondos
router.post('/', createFundingSource);

// GET /api/funding-sources - Listar las fuentes de fondos del usuario logueado
router.get('/', getAllFundingSources);

// --- Rutas para implementar después (también requerirán JWT) ---
// GET /api/funding-sources/:id
router.get('/:id', getFundingSourceById);

// PUT /api/funding-sources/:id
router.put('/:id', updateFundingSource);

// DELETE /api/funding-sources/:id
// Podríamos añadir restrictTo('admin') aquí si solo los admins pueden archivar
router.delete('/:id', archiveFundingSource);

export default router; 