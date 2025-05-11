import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Importar JwtPayload
import UserModel, { IUser } from '../models/UserModel'; // Importar UserModel e IUser
import { logger } from '../utils/logger';

// Usar la variable de entorno si está disponible, o una clave por defecto para desarrollo
const API_KEY = process.env.API_SECRET_KEY || 'default-dev-key';

if (!process.env.API_SECRET_KEY) {
  logger.warn('API_SECRET_KEY no está configurada en las variables de entorno. Usando clave por defecto para desarrollo.');
}

export const simpleApiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const providedApiKey = req.headers['x-api-key']; // Usaremos la cabecera 'X-API-Key'

  if (!providedApiKey) {
    logger.warn('Acceso denegado: No se proporcionó X-API-Key.');
    return res.status(401).json({ message: 'Acceso no autorizado: Falta API Key.' });
  }

  if (providedApiKey !== API_KEY) {
    logger.warn(`Acceso denegado: X-API-Key incorrecta. Proporcionada: ${providedApiKey}, Esperada: ${API_KEY}`);
    return res.status(403).json({ message: 'Acceso prohibido: API Key incorrecta.' });
  }

  logger.debug('Acceso API Key validado.');
  next();
};

// Extender la interfaz Request de Express para incluir la propiedad 'user'
declare global {
  namespace Express {
    interface Request {
      user?: IUser | null; // El usuario autenticado (o null/undefined si no)
    }
  }
}

export const protectWithJwt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // Obtener token de la cabecera (Bearer token)
      token = authHeader.split(' ')[1];

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        logger.error('JWT_SECRET no está definido, no se puede verificar token.');
        res.status(500).json({ message: 'Error de configuración del servidor (JWT).' });
      }

      // Verificar token
      const decoded = jwt.verify(token, secret!) as unknown as JwtPayload & { id: string };

      // Obtener usuario del token y adjuntarlo a req.user
      // Excluimos passwordHash al obtener el usuario
      req.user = await UserModel.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
         // Esto podría pasar si el usuario fue eliminado después de emitir el token
         logger.warn(`Usuario no encontrado para token válido (ID: ${decoded.id}). Acceso denegado.`);
         res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
         return;
      }
      
      logger.debug(`Usuario autenticado por JWT: ${req.user.email} (ID: ${req.user._id})`);
      next(); // Usuario autenticado, pasar al siguiente middleware/controlador

    } catch (error) {
      logger.error('Error al verificar JWT o buscar usuario:', error);
      res.status(401).json({ message: 'No autorizado, token fallido.' });
    }
  } else {
    // Si no hay cabecera Authorization o no empieza con Bearer
    logger.warn('Intento de acceso sin token Bearer.');
    res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
  }
};

// (Opcional) Middleware para restringir acceso por rol
export const restrictTo = (...roles: string[]) => {
  return function(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || !roles.includes(req.user.role)) {
       logger.warn(`Acceso denegado por rol. Usuario: ${req.user?.email}, Rol: ${req.user?.role}, Roles requeridos: ${roles.join(', ')}`);
       res.status(403).json({ message: 'No tienes permiso para realizar esta acción.'});
       return;
    }
    next();
  };
}; 