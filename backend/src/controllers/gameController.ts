import { Request, Response, NextFunction } from 'express';
import GameModel, { IGame } from '../models/GameModel';
import logger from '../utils/logger';

// Obtener todos los juegos (con filtros opcionales)
export const getAllGames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    // Aplicar filtro de status si viene en la query
    if (status) {
      filter.status = status;
    }

    // Aplicar filtro de búsqueda por nombre si viene en la query
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // búsqueda insensible a mayúsculas/minúsculas
    }

    const games = await GameModel.find(filter).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    logger.error(`Error al obtener juegos: ${error}`);
    next(error);
  }
};

// Obtener un juego por ID
export const getGameById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await GameModel.findById(req.params.id);
    
    if (!game) {
      res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    logger.error(`Error al obtener juego por ID: ${error}`);
    next(error);
  }
};

// Crear un nuevo juego
export const createGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newGame = await GameModel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newGame
    });
  } catch (error) {
    logger.error(`Error al crear juego: ${error}`);
    
    // Manejo específico para error de duplicación (nombre único)
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un juego con ese nombre o shortName'
      });
      return;
    }
    
    next(error);
  }
};

// Actualizar un juego existente
export const updateGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await GameModel.findById(req.params.id);
    
    if (!game) {
      res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
      return;
    }
    
    // Opciones: { new: true } para devolver el documento actualizado, runValidators para validar según el esquema
    const updatedGame = await GameModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedGame
    });
  } catch (error) {
    logger.error(`Error al actualizar juego: ${error}`);
    
    // Manejo específico para error de duplicación (nombre único)
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un juego con ese nombre o shortName'
      });
      return;
    }
    
    next(error);
  }
};

// Eliminar un juego (o cambiar su estado a 'archived')
export const deleteGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const game = await GameModel.findById(req.params.id);
    
    if (!game) {
      res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
      return;
    }
    
    // Verificamos si el parámetro de consulta 'archive' está presente y es true
    const shouldArchive = req.query.archive === 'true';
    
    if (shouldArchive) {
      // Simplemente cambiamos el estado a 'archived' en lugar de eliminar
      const archivedGame = await GameModel.findByIdAndUpdate(
        req.params.id,
        { status: 'archived' },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Juego archivado exitosamente',
        data: archivedGame
      });
    } else {
      // Eliminación física del documento
      // En un sistema de producción, probablemente querrías verificar dependencias antes de eliminar
      await GameModel.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'Juego eliminado exitosamente',
        data: {}
      });
    }
  } catch (error) {
    logger.error(`Error al eliminar juego: ${error}`);
    next(error);
  }
}; 