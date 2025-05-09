import express from 'express';
import { 
  getAllGameItems, 
  getGameItemById, 
  createGameItem, 
  updateGameItem, 
  updateGameItemStock,
  deleteGameItem 
} from '../controllers/gameItemController';
import { isAuthenticated } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Ruta: /api/game-items

// Obtener todos los ítems de juego
router.get('/', isAuthenticated, getAllGameItems);

// Obtener un ítem de juego por ID
router.get('/:id', isAuthenticated, getGameItemById);

// Crear un nuevo ítem de juego (solo admin)
router.post('/', isAuthenticated, isAdmin, createGameItem);

// Actualizar un ítem de juego existente (solo admin)
router.put('/:id', isAuthenticated, isAdmin, updateGameItem);

// Actualizar el stock de un ítem de juego (puede ser accesible a operador)
router.patch('/:id/stock', isAuthenticated, updateGameItemStock);

// Eliminar un ítem de juego (solo admin)
router.delete('/:id', isAuthenticated, isAdmin, deleteGameItem);

export default router; 