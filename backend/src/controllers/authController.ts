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
  const { username, email, password, fullName, role } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ message: 'El usuario o email ya existe.' });
      return;
    }

    // Crear usuario (la contraseña en texto plano se pasa a passwordHash, el hook pre-save la hasheará)
    const user = await UserModel.create({
      username,
      email,
      passwordHash: password, // Pasamos la contraseña plana aquí, el pre-save hook hashea
      fullName,
      role: role || 'operator', // Default a operator si no se especifica
    });

    if (user) {
      logger.info(`Usuario registrado: ${user.username} (${user.email})`);
      // Opcional: devolver el token directamente al registrar
      // const token = generateToken(user._id.toString(), user.role);
      // res.status(201).json({ _id: user._id, username: user.username, email: user.email, role: user.role, token });
      
      // O simplemente devolver los datos del usuario sin el token (requiere login explícito)
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
    // Buscar usuario por email (el campo passwordHash no se selecciona por defecto si usamos select: false)
    // Necesitamos pedirlo explícitamente si lo necesitamos para comparar.
    // Edit: Cambiamos el schema a no usar select: false en passwordHash, así que ya viene.
    const user = await UserModel.findOne({ email }); //.select('+passwordHash'); // Descomentar si se usa select: false en el modelo

    if (user && (await user.comparePassword(password))) {
      logger.info(`Login exitoso para: ${user.email}`);
      // Resetear intentos fallidos si se implementa bloqueo
      // user.failedLoginAttempts = 0;
      // user.lockUntil = undefined;
      // await user.save();
      
      const token = generateToken(user.id, user.role);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        token,
      });
    } else {
      logger.warn(`Intento de login fallido para: ${email}`);
      // Implementar lógica de bloqueo por intentos fallidos si se desea
      // if (user) {
      //   user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      //   if (user.failedLoginAttempts >= 5) { // Ejemplo: bloquear tras 5 intentos
      //     user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Bloquear por 15 min
      //   }
      //   await user.save();
      // }
      res.status(401).json({ message: 'Email o contraseña inválidos.' });
    }
  } catch (error) {
    logger.error('Error durante el login:', error);
    next(error);
  }
}; 