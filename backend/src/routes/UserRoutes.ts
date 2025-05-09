import express from 'express';
import {
  createUserByAdmin,
  // getUsers, // Descomentar cuando se implementen
  // getUserById,
  // updateUser,
  // deleteUser
} from '../controllers/UserController';
import { protectWithJwt, restrictTo } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = express.Router();
logger.info('[Router] Configurando router de gestión de Usuarios (Admin)...');

// Todas las rutas aquí deberían estar protegidas y restringidas a administradores
router.use(protectWithJwt); // Primero asegurar que el usuario está autenticado
router.use(restrictTo('admin')); // Luego, asegurar que el usuario es admin

// POST / (ej. /api/admin/users) - Crear un nuevo usuario
router.post('/', createUserByAdmin);

// GET / (ej. /api/admin/users) - Listar todos los usuarios
// router.get('/', getUsers);

// Rutas para un usuario específico por ID
// router.route('/:id')
//   .get(getUserById)
//   .put(updateUser)
//   .delete(deleteUser);

export default router; 