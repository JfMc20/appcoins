// Clase base para errores de la aplicación (operacionales)
class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Los errores operacionales son aquellos que esperamos (ej. input inválido)

    // Capturar el stack trace, excluyendo el constructor de esta clase
    Error.captureStackTrace(this, this.constructor);
  }
}

// Clase para errores de "No Encontrado" (404)
class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado.') {
    super(message, 404);
  }
}

// Clase para errores de "No Autorizado" (401)
class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado.') {
    super(message, 401);
  }
}

// Clase para errores de "Prohibido" (403)
class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido.') {
    super(message, 403);
  }
}

// Clase para errores de "Solicitud incorrecta" (400)
class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud incorrecta.') {
    super(message, 400);
  }
}

export { AppError, NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError }; 