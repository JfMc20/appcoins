import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

// Middleware para verificar si el usuario es admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Verificar que el usuario existe y tiene rol 'admin'
    if (!req.user || req.user.role !== 'admin') {
      throw new AppError('No tienes permisos para acceder a este recurso. Se requiere rol de administrador.', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar si el usuario es operador o admin
export const isOperatorOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Verificar que el usuario existe y tiene rol 'operator' o 'admin'
    if (!req.user || (req.user.role !== 'operator' && req.user.role !== 'admin')) {
      throw new AppError('No tienes permisos para acceder a este recurso. Se requiere rol de operador o administrador.', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 