import express from 'express';
import { protectWithJwt, restrictTo } from '../middleware/authMiddleware';
import {
  updateGameItemPricing,
  updateExternalProductPricing,
} from '../controllers/adminController';
import {
  createUserByAdmin,
  deleteUser,
  getUserById,
  getUsers,
  updateUser
} from '../controllers/UserController';

const router = express.Router();

// Rutas para la gestión de usuarios
router.get('/users', protectWithJwt, restrictTo('admin'), getUsers);
router.get('/users/:id', protectWithJwt, restrictTo('admin'), getUserById);
router.post('/users', protectWithJwt, restrictTo('admin'), createUserByAdmin);
router.put('/users/:id', protectWithJwt, restrictTo('admin'), updateUser);
router.delete('/users/:id', protectWithJwt, restrictTo('admin'), deleteUser);

// Rutas para la gestión de precios por parte del administrador

/**
 * @swagger
 * /api/admin/game-items/{itemId}/pricing:
 *   put:
 *     summary: Actualiza la información de precios de un GameItem específico.
 *     tags: [Admin - Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del GameItem a actualizar.
 *       - in: body
 *         name: pricingData
 *         required: true
 *         description: Objeto con los nuevos datos de precios para el GameItem.
 *         schema:
 *           $ref: '#/components/schemas/GameItemPricingInput'
 *     responses:
 *       200:
 *         description: Información de precios del GameItem actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameItem'
 *       400:
 *         description: Datos de entrada inválidos.
 *       401:
 *         description: No autorizado (token no válido o no provisto).
 *       403:
 *         description: Prohibido (el usuario no es administrador).
 *       404:
 *         description: GameItem no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put(
  '/game-items/:itemId/pricing',
  protectWithJwt,
  restrictTo('admin'),
  updateGameItemPricing
);

/**
 * @swagger
 * /api/admin/external-products/{productId}/pricing:
 *   put:
 *     summary: Actualiza la información de precios y costo de un ExternalProduct específico.
 *     tags: [Admin - Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ExternalProduct a actualizar.
 *       - in: body
 *         name: pricingData
 *         required: true
 *         description: Objeto con los nuevos datos de precio y/o costo para el ExternalProduct.
 *         schema:
 *           type: object
 *           properties:
 *             price:
 *               $ref: '#/components/schemas/MoneyAmountInput'
 *             cost:
 *               $ref: '#/components/schemas/MoneyAmountInput'
 *     responses:
 *       200:
 *         description: Información de precios/costo del ExternalProduct actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalProduct'
 *       400:
 *         description: Datos de entrada inválidos.
 *       401:
 *         description: No autorizado (token no válido o no provisto).
 *       403:
 *         description: Prohibido (el usuario no es administrador).
 *       404:
 *         description: ExternalProduct no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put(
  '/external-products/:productId/pricing',
  protectWithJwt,
  restrictTo('admin'),
  updateExternalProductPricing
);

export default router; 