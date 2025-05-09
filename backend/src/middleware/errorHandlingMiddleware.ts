import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

// Función para enviar errores en desarrollo (más detallado)
const sendErrorDev = (err: AppError, res: Response) => {
  logger.error('ERROR EN DESARROLLO ', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Función para enviar errores en producción (más genérico)
const sendErrorProd = (err: AppError, res: Response) => {
  // Errores operacionales y de confianza: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Errores de programación o desconocidos: no filtrar detalles al cliente
    logger.error('ERROR DE PRODUCCIÓN NO OPERACIONAL ', err);
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal en el servidor.',
    });
  }
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Si el error no tiene statusCode, es probable que sea un error no manejado o no operacional
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; // Copiar el error para no mutar el original directamente
    error.message = err.message; // Asegurar que el mensaje original se mantenga si es un AppError

    // Aquí se podrían manejar errores específicos de Mongoose, JWT, etc.
    // Ejemplo: CastError de Mongoose (ID inválido)
    if (err.name === 'CastError') {
      const message = `Recurso inválido. ${err.path}: ${err.value}`;
      error = new AppError(message, 400);
    }
    // Ejemplo: Error de duplicado de Mongoose (unique constraint)
    if (err.code === 11000) {
        const value = err.errmsg.match(/(?<=")\"?(.*?)\"(?=")/)[0];
        const message = `Valor duplicado: ${value}. Por favor, use otro valor.`;
        error = new AppError(message, 400);
    }
    // Ejemplo: Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el: any) => el.message);
        const message = `Datos de entrada inválidos. ${errors.join('. ')}`;
        error = new AppError(message, 400);
    }
    // Ejemplo: Error de JWT (token inválido o expirado)
    if (err.name === 'JsonWebTokenError') error = new AppError('Token inválido. Por favor, inicie sesión de nuevo.', 401);
    if (err.name === 'TokenExpiredError') error = new AppError('Su token ha expirado. Por favor, inicie sesión de nuevo.', 401);

    sendErrorProd(error, res);
  } else {
    // Por si NODE_ENV no está seteado, default a un manejo simple
    logger.error('ERROR (NODE_ENV no configurado) ', err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
  }
}; 