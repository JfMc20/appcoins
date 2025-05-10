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

    // Crear objeto de usuario
    const userData: any = {
      username,
      email,
      passwordHash: password, // La contraseña plana se pasa aquí, el hook pre-save la hasheará
      fullName,
      role: newUserRole,
      status: 'active', // Por defecto activo, o se podría requerir verificación por email
    };
    
    // Si es un operador, asignarlo al administrador actual
    if (newUserRole === 'operator') {
      // Suponemos que el ID del admin actual está disponible en req.user._id (depende de cómo se implemente la autenticación)
      userData.assignedTo = req.user?._id;
    }

    const user = await UserModel.create(userData);

    if (user) {
      logger.info(`Usuario creado por admin: ${user.username} (${user.email}) con rol ${user.role}`);
      // Excluimos passwordHash de la respuesta usando desestructuración
      const userObj = user.toObject();
      const { passwordHash, ...userResponse } = userObj;
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
    // Si es un super admin, obtener todos los usuarios
    // Si es un admin regular, obtener solo sus operadores asignados y a sí mismo
    let query = {};
    if (req.user && req.user.role === 'admin') {
      // Si no es un superadmin o tiene restricciones, filtrar solo sus operadores
      // Esta lógica puede personalizarse según los requisitos
      query = { $or: [{ _id: req.user._id }, { assignedTo: req.user._id }] };
    }
    
    const users = await UserModel.find(query)
      .select('-passwordHash')
      .populate('assignedTo', 'username email fullName'); // Poblar con información del admin asignado
      
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
    const { username, email, fullName, role, status, password, assignedTo } = req.body;
    
    // Verificar si el usuario existe
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Verificar permisos del administrador actual sobre este usuario
    if (req.user && req.user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
      // Si el usuario a actualizar no es el admin actual, verificar si es uno de sus operadores asignados
      if (user.assignedTo && user.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'No tienes permisos para modificar este usuario' });
        return;
      }
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
    if (role && ['admin', 'operator'].includes(role)) {
      // Si cambia de operador a admin, eliminar la asignación
      if (role === 'admin' && user.role === 'operator') {
        user.assignedTo = undefined;
      }
      // Si cambia de admin a operador, asignarlo al admin actual
      else if (role === 'operator' && user.role === 'admin') {
        user.assignedTo = req.user?._id;
      }
      user.role = role;
    }
    
    if (status && ['active', 'inactive', 'pending_verification'].includes(status)) user.status = status;
    
    // Si se proporciona una nueva asignación y el usuario es operador
    if (assignedTo && user.role === 'operator') {
      // Verificar que el admin al que se asigna existe
      const adminExists = await UserModel.findOne({ _id: assignedTo, role: 'admin' });
      if (!adminExists) {
        res.status(400).json({ message: 'El administrador asignado no existe' });
        return;
      }
      user.assignedTo = assignedTo;
    }
    
    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      user.passwordHash = password; // El pre-save hook se encargará de hashearla
    }
    
    // Guardar los cambios
    const updatedUser = await user.save();
    
    // Devolver usuario actualizado sin passwordHash usando desestructuración
    const userObj = updatedUser.toObject();
    const { passwordHash, ...userResponse } = userObj;
    
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
    
    // Usar deleteOne() en lugar de remove() que está obsoleto
    await UserModel.deleteOne({ _id: user._id });
    
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    logger.info(`Usuario eliminado: ${user.username} (${user.email})`);
  } catch (error) {
    logger.error(`Error al eliminar usuario con ID ${req.params.id}:`, error);
    next(error);
  }
}; 