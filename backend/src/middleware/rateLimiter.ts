import { Request, Response, NextFunction } from 'express';

// Placeholder para el Rate Limiter
// En una implementación real, aquí se usaría una librería como express-rate-limit

export const WachstumRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Lógica de limitación de peticiones iría aquí
  // Por ahora, solo llamamos a next()
  next();
}; 