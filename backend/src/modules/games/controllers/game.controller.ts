import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { GameService } from '../services/game.service';
import { GameBase, GameStatus } from '../types';
import { logger } from '../../../utils/logger';

export class GameController extends BaseController<GameBase> {
    constructor(private gameService: GameService) {
        super(gameService);
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status, search } = req.query;
            logger.info(`[GameController] Obteniendo juegos. Filtros: status='${status}', search='${search}'`);

            let games: GameBase[];
            if (status) {
                games = await this.gameService.findByStatus(status as GameStatus);
            } else if (search) {
                games = await this.gameService.searchByName(search as string);
            } else {
                games = await this.gameService.findAll();
            }

            res.status(200).json({
                success: true,
                count: games.length,
                data: games
            });
        } catch (error) {
            logger.error(`[GameController] Error al obtener juegos: ${error}`);
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!Object.values(GameStatus).includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Estado de juego inválido'
                });
                return;
            }

            const game = await this.gameService.updateStatus(id, status);
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
            logger.error(`[GameController] Error al actualizar estado del juego: ${error}`);
            next(error);
        }
    }

    async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const game = await this.gameService.updateStatus(id, GameStatus.DEPRECATED);
            
            if (!game) {
                res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Juego archivado exitosamente',
                data: game
            });
        } catch (error) {
            logger.error(`[GameController] Error al archivar juego: ${error}`);
            next(error);
        }
    }
} 