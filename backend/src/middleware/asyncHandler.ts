import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Middleware wrapper para manejar errores en funciones asíncronas de Express.
 * Evita la necesidad de bloques try-catch explícitos en cada controlador asíncrono
 * para pasar errores al siguiente middleware de manejo de errores.
 *
 * @param fn La función de controlador asíncrona (Request -> Promise<void>).
 * @returns Una función RequestHandler que maneja la promesa y los errores.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 