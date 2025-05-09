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
      const userResponse = user.toObject();
      delete userResponse.passwordHash;
      res.status(201).json(userResponse);
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

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await UserModel.find().select('-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error al obtener usuarios:', error);
    next(error);
  }
};

/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserModel.findById(req.params.id).select('-passwordHash');
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error al obtener usuario con ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * @desc    Actualizar un usuario
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, fullName, role, status, password } = req.body;
    
    // Verificar si el usuario existe
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Si se intenta actualizar username o email, verificar que no existan duplicados
    if (username && username !== user.username) {
      const usernameExists = await UserModel.findOne({ username });
      if (usernameExists) {
        res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        return;
      }
      user.username = username;
    }
    
    if (email && email !== user.email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists) {
        res.status(400).json({ message: 'El email ya está en uso' });
        return;
      }
      user.email = email;
    }
    
    // Actualizar otros campos
    if (fullName !== undefined) user.fullName = fullName;
    if (role && ['admin', 'operator'].includes(role)) user.role = role;
    if (status && ['active', 'inactive', 'pending_verification'].includes(status)) user.status = status;
    
    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      user.passwordHash = password; // El pre-save hook se encargará de hashearla
    }
    
    // Guardar los cambios
    const updatedUser = await user.save();
    
    // Devolver usuario actualizado sin passwordHash
    const userResponse = updatedUser.toObject();
    delete userResponse.passwordHash;
    
    res.status(200).json(userResponse);
    logger.info(`Usuario actualizado: ${user.username} (${user.email})`);
  } catch (error: any) {
    logger.error(`Error al actualizar usuario con ID ${req.params.id}:`, error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación', details: error.errors });
    } else {
      next(error);
    }
  }
};

/**
 * @desc    Eliminar un usuario
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserModel.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Verificar que no sea el último usuario administrador
    if (user.role === 'admin') {
      const adminCount = await UserModel.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({ message: 'No se puede eliminar el último administrador del sistema' });
        return;
      }
    }
    
    await user.remove();
    
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    logger.info(`Usuario eliminado: ${user.username} (${user.email})`);
  } catch (error) {
    logger.error(`Error al eliminar usuario con ID ${req.params.id}:`, error);
    next(error);
  }
}; 