import { Request, Response, NextFunction } from 'express';
import GameModel, { IGame } from '../models/GameModel';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Obtener todos los juegos (con filtros opcionales)
export const getAllGames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query;
    logger.info(`[getAllGames] Iniciando obtención de juegos. Query params recibidos: status='${status}', search='${search}'`);

    const filter: any = {};

    // Aplicar filtro de status si viene en la query
    if (status) {
      filter.status = status;
    }

    // Aplicar filtro de búsqueda por nombre si viene en la query
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // búsqueda insensible a mayúsculas/minúsculas
    }

    logger.info(`[getAllGames] Filtro aplicado a la consulta de BD: ${JSON.stringify(filter)}`);
    const games = await GameModel.find(filter).sort({ name: 1 });
    
    logger.info(`[getAllGames] Juegos encontrados: ${games.length}`);
    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
      logger.info(`[deleteGame] Juego encontrado para archivar (antes de actualizar): ID ${game._id}, Estado actual: ${game.status}`);
      // Simplemente cambiamos el estado a 'archived' en lugar de eliminar
      const archivedGame = await GameModel.findByIdAndUpdate(
        req.params.id,
        { status: 'archived' }, 
        { new: true }
      );
      logger.info(`[deleteGame] Juego después de intentar archivar: ID ${archivedGame?._id}, Nuevo Estado: ${archivedGame?.status}`);
      
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
  } catch (error: any) {
    logger.error(`Error al eliminar juego: ${error}`);
    next(error);
  }
};

// Nueva función para eliminar permanentemente un juego archivado
export const permanentlyDeleteGame = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`[GameController] Intento de eliminación permanente con ID inválido: ${id}`);
    return res.status(400).json({ message: 'ID de juego inválido' });
  }

  try {
    // Solo permite eliminar permanentemente si el juego está archivado
    const deletedGame = await GameModel.findOneAndDelete({ _id: id, status: 'archived' });

    if (!deletedGame) {
      logger.warn(`[GameController] Juego no encontrado o no archivado para eliminación permanente: ${id}`);
      return res.status(404).json({ message: 'Juego no encontrado, no está archivado, o no tienes permiso para eliminarlo permanentemente' });
    }

    logger.info(`[GameController] Juego eliminado permanentemente: ${id} (Nombre: ${deletedGame.name})`);
    res.status(200).json({ message: 'Juego eliminado permanentemente con éxito' });

  } catch (error: any) {
    logger.error(`[GameController] Error al eliminar permanentemente el juego ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Error interno del servidor al eliminar el juego permanentemente' });
  }
}; 