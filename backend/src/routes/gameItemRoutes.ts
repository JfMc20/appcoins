import express from 'express';
import { 
  getAllGameItems, 
  getGameItemById, 
  createGameItem, 
  updateGameItem, 
  updateGameItemStock,
  deleteGameItem 
} from '../controllers/gameItemController';
import { protectWithJwt } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Ruta: /api/game-items

// Obtener todos los ítems de juego
router.get('/', protectWithJwt, getAllGameItems);

// Obtener un ítem de juego por ID
router.get('/:id', protectWithJwt, getGameItemById);

// Crear un nuevo ítem de juego (solo admin)
router.post('/', protectWithJwt, isAdmin, createGameItem);

// Actualizar un ítem de juego existente (solo admin)
router.put('/:id', protectWithJwt, isAdmin, updateGameItem);

// Actualizar el stock de un ítem de juego (puede ser accesible a operador)
router.patch('/:id/stock', protectWithJwt, updateGameItemStock);

// Eliminar un ítem de juego (solo admin)
router.delete('/:id', protectWithJwt, isAdmin, deleteGameItem);

export default router; 