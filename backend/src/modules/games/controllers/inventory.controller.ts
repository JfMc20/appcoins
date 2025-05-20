import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { InventoryService, StockService, StockAlertService } from '../services/inventory.service';
import { InventoryBase, StockBase, StockTransactionType, StockAlert } from '../types';
import { logger } from '../../../utils/logger';

export class InventoryController extends BaseController<InventoryBase> {
    constructor(private inventoryService: InventoryService) {
        super(inventoryService);
    }

    async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const inventories = await this.inventoryService.findByUserId(userId);
            res.status(200).json({
                success: true,
                count: inventories.length,
                data: inventories
            });
        } catch (error) {
            logger.error(`[InventoryController] Error al obtener inventarios por usuario: ${error}`);
            next(error);
        }
    }

    async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const { itemId, quantity } = req.body;

            if (!itemId || !quantity || quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere itemId y una cantidad válida'
                });
                return;
            }

            const inventory = await this.inventoryService.addItem(userId, itemId, quantity);
            res.status(200).json({
                success: true,
                data: inventory
            });
        } catch (error) {
            logger.error(`[InventoryController] Error al agregar item al inventario: ${error}`);
            next(error);
        }
    }

    async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.params;
            const { itemId, quantity } = req.body;

            if (!itemId || !quantity || quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere itemId y una cantidad válida'
                });
                return;
            }

            const inventory = await this.inventoryService.removeItem(userId, itemId, quantity);
            res.status(200).json({
                success: true,
                data: inventory
            });
        } catch (error) {
            logger.error(`[InventoryController] Error al remover item del inventario: ${error}`);
            next(error);
        }
    }
}

export class StockController extends BaseController<StockBase> {
    constructor(
        private stockService: StockService,
        private stockAlertService: StockAlertService
    ) {
        super(stockService);
    }

    async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { itemId } = req.params;
            const { quantity, type } = req.body;

            if (!quantity || !type || !Object.values(StockTransactionType).includes(type)) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere cantidad y tipo de transacción válidos'
                });
                return;
            }

            const stock = await this.stockService.updateStock(itemId, quantity, type);
            if (!stock) {
                res.status(404).json({
                    success: false,
                    message: 'Item no encontrado'
                });
                return;
            }

            // Verificar alertas de stock
            const alerts = await this.stockAlertService.checkStockLevels(stock);
            if (alerts.length > 0) {
                logger.warn(`[StockController] Alertas de stock activadas para item ${itemId}: ${alerts.length} alertas`);
            }

            res.status(200).json({
                success: true,
                data: stock,
                alerts: alerts
            });
        } catch (error) {
            logger.error(`[StockController] Error al actualizar stock: ${error}`);
            next(error);
        }
    }

    async reserveStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere una cantidad válida'
                });
                return;
            }

            const stock = await this.stockService.reserveStock(itemId, quantity);
            if (!stock) {
                res.status(404).json({
                    success: false,
                    message: 'Item no encontrado o stock insuficiente'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: stock
            });
        } catch (error) {
            logger.error(`[StockController] Error al reservar stock: ${error}`);
            next(error);
        }
    }

    async releaseStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere una cantidad válida'
                });
                return;
            }

            const stock = await this.stockService.releaseStock(itemId, quantity);
            if (!stock) {
                res.status(404).json({
                    success: false,
                    message: 'Item no encontrado o reserva insuficiente'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: stock
            });
        } catch (error) {
            logger.error(`[StockController] Error al liberar stock: ${error}`);
            next(error);
        }
    }
}

export class StockAlertController extends BaseController<StockAlert> {
    constructor(private stockAlertService: StockAlertService) {
        super(stockAlertService);
    }

    async getActiveAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const alerts = await this.stockAlertService.findActiveAlerts();
            res.status(200).json({
                success: true,
                count: alerts.length,
                data: alerts
            });
        } catch (error) {
            logger.error(`[StockAlertController] Error al obtener alertas activas: ${error}`);
            next(error);
        }
    }
} 