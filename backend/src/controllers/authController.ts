import { Request, Response, NextFunction } from 'express';
import UserModel, { IUser } from '../models/UserModel';
import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Función para generar un token JWT
const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET no está definido en las variables de entorno.');
    throw new Error('Error de configuración del servidor: JWT Secret no encontrado.');
  }
  
  const expiresInValue: string = process.env.JWT_EXPIRES_IN || '30d';
  
  const options = {
    expiresIn: expiresInValue as any,
  };
  
  // Usar la variable 'options'
  return jwt.sign({ id, role }, secret!, options);
};

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public (o protegido por Admin en algunos casos)
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email, password, fullName } = req.body;

  try {
    // Contar cuántos usuarios existen en la base de datos
    const userCount = await UserModel.countDocuments();
    const testUser = await UserModel.findOne({ email: 'test@test.com' });
    
    // Contar usuarios reales (excluyendo el usuario de prueba)
    const realUserCount = testUser ? userCount - 1 : userCount;

    // Si ya existe un usuario real (diferente del test@test.com), bloquear el registro
    if (realUserCount >= 1) {
      logger.warn(`Intento de registro público bloqueado. Ya existe un usuario administrador.`);
      res.status(403).json({ message: 'El registro de nuevos usuarios está actualmente deshabilitado. Ya existe un usuario administrador.' });
      return;
    }

    // Verificar si el email o username ya existe
    const userExists = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ message: 'El usuario o email ya existe.' });
      return;
    }

    // El nuevo usuario será administrador
    const user = await UserModel.create({
      username,
      email,
      passwordHash: password, // Pasamos la contraseña plana aquí, el pre-save hook hashea
      fullName,
      role: 'admin', // Este usuario será el administrador real
      status: 'active',
    });

    if (user) {
      logger.info(`Usuario administrador registrado: ${user.username} (${user.email})`);
      
      // Devolver los datos del usuario sin el token (requiere login explícito)
      res.status(201).json({ _id: user._id, username: user.username, email: user.email, role: user.role });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos.' });
    }
  } catch (error: any) {
    logger.error('Error al registrar usuario:', error);
     if (error.name === 'ValidationError') {
       res.status(400).json({ message: 'Error de validación', details: error.errors });
       return;
     } else {
       next(error);
     }
  }
};

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
     res.status(400).json({ message: 'Por favor, proporcione email y contraseña.' });
     return;
  }

  try {
    // Buscar usuario por email
    const user = await UserModel.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      logger.info(`Login exitoso para: ${user.email}`);
      
      const token = generateToken(user.id, user.role);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        status: user.status,
        token,
      });
    } else {
      logger.warn(`Intento de login fallido para: ${email}`);
      res.status(401).json({ message: 'Email o contraseña inválidos.' });
    }
  } catch (error) {
    logger.error('Error durante el login:', error);
    next(error);
  }
};

/**
 * @desc    Verificar el estado del registro público
 * @route   GET /api/auth/registration-status
 * @access  Public
 */
export const getRegistrationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Contar usuarios en la base de datos
    const userCount = await UserModel.countDocuments();
    
    // Verificar si existe el usuario de prueba
    const testUser = await UserModel.findOne({ email: 'test@test.com' });
    
    // Contar usuarios reales (excluyendo el usuario de prueba)
    const realUserCount = testUser ? userCount - 1 : userCount;
    
    // Si no hay usuarios reales, el registro está abierto
    if (realUserCount < 1) {
      res.status(200).json({ status: 'open', message: 'El registro está abierto para crear un usuario administrador.' });
    } else {
      res.status(200).json({ status: 'closed', message: 'El registro de nuevos usuarios está actualmente deshabilitado. Ya existe un usuario administrador.' });
    }
  } catch (error) {
    logger.error('Error al obtener el estado del registro:', error);
    next(error);
  }
}; 