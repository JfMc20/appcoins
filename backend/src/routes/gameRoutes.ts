import express from 'express';
import { 
  getAllGames, 
  getGameById, 
  createGame, 
  updateGame, 
  deleteGame 
} from '../controllers/gameController';
import { isAuthenticated } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Ruta: /api/games

// Obtener todos los juegos
router.get('/', isAuthenticated, getAllGames);

// Obtener un juego por ID
router.get('/:id', isAuthenticated, getGameById);

// Crear un nuevo juego (solo admin)
router.post('/', isAuthenticated, isAdmin, createGame);

// Actualizar un juego existente (solo admin)
router.put('/:id', isAuthenticated, isAdmin, updateGame);

// Eliminar un juego (solo admin)
router.delete('/:id', isAuthenticated, isAdmin, deleteGame);

export default router; 