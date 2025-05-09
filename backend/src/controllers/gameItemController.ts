import { Request, Response, NextFunction } from 'express';
import GameItemModel, { IGameItem } from '../models/GameItemModel';
import GameModel from '../models/GameModel';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Obtener todos los ítems de juego (con filtros opcionales)
export const getAllGameItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId, type, status, managesStock, isTradable, search } = req.query;
    const filter: any = {};

    // Aplicar filtro por gameId
    if (gameId) {
      filter.gameId = gameId;
    }

    // Aplicar filtro por tipo de ítem
    if (type) {
      filter.type = type;
    }

    // Aplicar filtro por status
    if (status) {
      filter.status = status;
    }

    // Aplicar filtro por managesStock
    if (managesStock !== undefined) {
      filter.managesStock = managesStock === 'true';
    }

    // Aplicar filtro por isTradable
    if (isTradable !== undefined) {
      filter.isTradable = isTradable === 'true';
    }

    // Aplicar filtro de búsqueda por nombre o itemCode
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Populate para traer información del juego asociado
    const gameItems = await GameItemModel.find(filter)
      .populate('gameId', 'name shortName')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: gameItems.length,
      data: gameItems
    });
  } catch (error) {
    logger.error(`Error al obtener ítems de juego: ${error}`);
    next(error);
  }
};

// Obtener un ítem de juego por ID
export const getGameItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gameItem = await GameItemModel.findById(req.params.id)
      .populate('gameId', 'name shortName');
    
    if (!gameItem) {
      res.status(404).json({
        success: false,
        message: 'Ítem de juego no encontrado'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: gameItem
    });
  } catch (error) {
    logger.error(`Error al obtener ítem de juego por ID: ${error}`);
    next(error);
  }
};

// Crear un nuevo ítem de juego
export const createGameItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar si el juego existe
    if (req.body.gameId) {
      const gameExists = await GameModel.findById(req.body.gameId);
      if (!gameExists) {
        res.status(400).json({
          success: false,
          message: 'El juego especificado no existe'
        });
        return;
      }
    }

    // Crear el nuevo ítem
    const newGameItem = await GameItemModel.create(req.body);
    
    // Populate para devolver información del juego relacionado
    await newGameItem.populate('gameId', 'name shortName');
    
    res.status(201).json({
      success: true,
      data: newGameItem
    });
  } catch (error) {
    logger.error(`Error al crear ítem de juego: ${error}`);
    
    // Manejo específico para error de duplicación
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un ítem con ese nombre para el juego especificado, o el itemCode ya está en uso'
      });
      return;
    }
    
    next(error);
  }
};

// Actualizar un ítem de juego existente
export const updateGameItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gameItem = await GameItemModel.findById(req.params.id);
    
    if (!gameItem) {
      res.status(404).json({
        success: false,
        message: 'Ítem de juego no encontrado'
      });
      return;
    }
    
    // Si se está actualizando el juego, verificar que exista
    if (req.body.gameId && req.body.gameId !== gameItem.gameId.toString()) {
      const gameExists = await GameModel.findById(req.body.gameId);
      if (!gameExists) {
        res.status(400).json({
          success: false,
          message: 'El juego especificado no existe'
        });
        return;
      }
    }
    
    // Actualizar el ítem con validación
    const updatedGameItem = await GameItemModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('gameId', 'name shortName');
    
    res.status(200).json({
      success: true,
      data: updatedGameItem
    });
  } catch (error) {
    logger.error(`Error al actualizar ítem de juego: ${error}`);
    
    // Manejo específico para error de duplicación
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un ítem con ese nombre para el juego especificado, o el itemCode ya está en uso'
      });
      return;
    }
    
    next(error);
  }
};

// Actualizar el stock de un ítem de juego
export const updateGameItemStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentStock, notes } = req.body;
    
    if (currentStock === undefined) {
      res.status(400).json({
        success: false,
        message: 'Se requiere el valor currentStock'
      });
      return;
    }
    
    // Verificar que el ítem existe y gestiona stock
    const gameItem = await GameItemModel.findById(id);
    
    if (!gameItem) {
      res.status(404).json({
        success: false,
        message: 'Ítem de juego no encontrado'
      });
      return;
    }
    
    if (!gameItem.managesStock) {
      res.status(400).json({
        success: false,
        message: 'Este ítem no gestiona stock (managesStock: false)'
      });
      return;
    }
    
    // Actualizar solo el stock
    gameItem.currentStock = currentStock;
    await gameItem.save();
    
    // Devolver el ítem actualizado
    await gameItem.populate('gameId', 'name shortName');
    
    res.status(200).json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: gameItem
    });
  } catch (error) {
    logger.error(`Error al actualizar stock de ítem: ${error}`);
    next(error);
  }
};

// Eliminar un ítem de juego (o cambiar su estado a 'archived')
export const deleteGameItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gameItem = await GameItemModel.findById(req.params.id);
    
    if (!gameItem) {
      res.status(404).json({
        success: false,
        message: 'Ítem de juego no encontrado'
      });
      return;
    }
    
    // Verificamos si el parámetro de consulta 'archive' está presente y es true
    const shouldArchive = req.query.archive === 'true';
    
    if (shouldArchive) {
      // Simplemente cambiamos el estado a 'archived' en lugar de eliminar
      const archivedItem = await GameItemModel.findByIdAndUpdate(
        req.params.id,
        { status: 'archived' },
        { new: true }
      ).populate('gameId', 'name shortName');
      
      res.status(200).json({
        success: true,
        message: 'Ítem de juego archivado exitosamente',
        data: archivedItem
      });
    } else {
      // Eliminación física del documento
      // En un sistema de producción, probablemente querrías verificar dependencias antes de eliminar
      await GameItemModel.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'Ítem de juego eliminado exitosamente',
        data: {}
      });
    }
  } catch (error) {
    logger.error(`Error al eliminar ítem de juego: ${error}`);
    next(error);
  }
}; 