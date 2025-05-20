import { Request, Response, NextFunction } from 'express';
import { BaseService } from '../services/base.service';
import { BaseEntity } from '../types';
import { logger } from '../../../utils/logger';

export abstract class BaseController<T extends BaseEntity> {
    protected service: BaseService<T>;

    constructor(service: BaseService<T>) {
        this.service = service;
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const items = await this.service.findAll(req.query);
            res.status(200).json({
                success: true,
                count: items.length,
                data: items
            });
        } catch (error) {
            logger.error(`Error al obtener items: ${error}`);
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const item = await this.service.findById(req.params.id);
            if (!item) {
                res.status(404).json({
                    success: false,
                    message: 'Item no encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: item
            });
        } catch (error) {
            logger.error(`Error al obtener item por ID: ${error}`);
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newItem = await this.service.create(req.body);
            res.status(201).json({
                success: true,
                data: newItem
            });
        } catch (error: any) {
            logger.error(`Error al crear item: ${error}`);
            if (error.code === 11000) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un item con esos datos'
                });
                return;
            }
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const item = await this.service.update(req.params.id, req.body);
            if (!item) {
                res.status(404).json({
                    success: false,
                    message: 'Item no encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: item
            });
        } catch (error: any) {
            logger.error(`Error al actualizar item: ${error}`);
            if (error.code === 11000) {
                res.status(400).json({
                    success: false,
                    message: 'Ya existe un item con esos datos'
                });
                return;
            }
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const success = await this.service.delete(req.params.id);
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Item no encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Item eliminado exitosamente'
            });
        } catch (error) {
            logger.error(`Error al eliminar item: ${error}`);
            next(error);
        }
    }
} 