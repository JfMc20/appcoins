import express from 'express';
import { 
  getAllGames, 
  getGameById, 
  createGame, 
  updateGame, 
  deleteGame,
  permanentlyDeleteGame
} from '../controllers/gameController';
import { protectWithJwt } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Ruta: /api/games

// Obtener todos los juegos
router.get('/', protectWithJwt, getAllGames);

// Obtener un juego por ID
router.get('/:id', protectWithJwt, getGameById);

// Crear un nuevo juego (solo admin)
router.post('/', protectWithJwt, isAdmin, createGame);

// Actualizar un juego existente (solo admin)
router.put('/:id', protectWithJwt, isAdmin, updateGame);

// Eliminar un juego (solo admin)
router.delete('/:id', protectWithJwt, isAdmin, deleteGame);

// Nueva ruta para eliminación permanente
router.delete('/:id/permanent', protectWithJwt, isAdmin, permanentlyDeleteGame);

export default router; 