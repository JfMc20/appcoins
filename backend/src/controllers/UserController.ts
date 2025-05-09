import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/UserModel';
import { logger } from '../utils/logger';

/**
 * @desc    Crear un nuevo usuario (por un Administrador)
 * @route   POST /api/admin/users  (o la ruta que se defina)
 * @access  Private (Admin)
 */
export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email, password, fullName, role } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ message: 'El usuario o email ya existe.' });
      return;
    }

    // Determinar el rol del nuevo usuario.
    // Si el admin no especifica un rol, por defecto será 'operator'.
    // Un admin podría potencialmente crear otro admin si se permite en la lógica de negocio.
    const newUserRole = role && ['admin', 'operator'].includes(role) ? role : 'operator';

    const user = await UserModel.create({
      username,
      email,
      passwordHash: password, // La contraseña plana se pasa aquí, el hook pre-save la hasheará
      fullName,
      role: newUserRole,
      status: 'active', // Por defecto activo, o se podría requerir verificación por email
    });

    if (user) {
      logger.info(`Usuario creado por admin: ${user.username} (${user.email}) con rol ${user.role}`);
      // Excluimos passwordHash de la respuesta
      const { passwordHash, ...userWithoutPassword } = user.toObject();
      res.status(201).json(userWithoutPassword);
    } else {
      // Esto no debería ocurrir si .create no lanza error, pero por si acaso.
      res.status(400).json({ message: 'No se pudo crear el usuario. Datos inválidos.' });
    }
  } catch (error: any) {
    logger.error('Error al crear usuario por admin:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación al crear usuario.', details: error.errors });
    } else {
      next(error);
    }
  }
};

// Aquí se añadirán otras funciones para listar, actualizar, (des)activar usuarios por el admin.
// export const getUsers = async (req: Request, res: Response, next: NextFunction) => { /* ... */ };
// export const getUserById = async (req: Request, res: Response, next: NextFunction) => { /* ... */ };
// export const updateUser = async (req: Request, res: Response, next: NextFunction) => { /* ... */ };
// export const deleteUser = async (req: Request, res: Response, next: NextFunction) => { /* ... */ }; 