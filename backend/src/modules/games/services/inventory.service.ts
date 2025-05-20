import { BaseService } from './base.service';
import { InventoryBase, StockBase, StockTransaction, StockTransactionType, StockAlert } from '../types';

export class InventoryService extends BaseService<InventoryBase> {
    protected model: any;

    async findByUserId(userId: string): Promise<InventoryBase[]> {
        return await this.model.find({ userId });
    }

    async addItem(userId: string, itemId: string, quantity: number): Promise<InventoryBase | null> {
        return await this.model.findOneAndUpdate(
            { userId },
            { 
                $push: { 
                    items: { 
                        item: itemId,
                        quantity,
                        acquiredAt: new Date()
                    }
                }
            },
            { new: true, upsert: true }
        );
    }

    async removeItem(userId: string, itemId: string, quantity: number): Promise<InventoryBase | null> {
        return await this.model.findOneAndUpdate(
            { userId },
            { 
                $pull: { 
                    items: { 
                        item: itemId,
                        quantity: { $lte: quantity }
                    }
                }
            },
            { new: true }
        );
    }
}

export class StockService extends BaseService<StockBase> {
    protected model: any;

    async updateStock(itemId: string, quantity: number, type: StockTransactionType): Promise<StockBase | null> {
        const update = type === StockTransactionType.ADD 
            ? { $inc: { quantity, available: quantity } }
            : { $inc: { quantity: -quantity, available: -quantity } };

        return await this.model.findOneAndUpdate(
            { itemId },
            update,
            { new: true, upsert: true }
        );
    }

    async reserveStock(itemId: string, quantity: number): Promise<StockBase | null> {
        return await this.model.findOneAndUpdate(
            { 
                itemId,
                available: { $gte: quantity }
            },
            { 
                $inc: { 
                    reserved: quantity,
                    available: -quantity
                }
            },
            { new: true }
        );
    }

    async releaseStock(itemId: string, quantity: number): Promise<StockBase | null> {
        return await this.model.findOneAndUpdate(
            { 
                itemId,
                reserved: { $gte: quantity }
            },
            { 
                $inc: { 
                    reserved: -quantity,
                    available: quantity
                }
            },
            { new: true }
        );
    }
}

export class StockAlertService extends BaseService<StockAlert> {
    protected model: any;

    async findActiveAlerts(): Promise<StockAlert[]> {
        return await this.model.find({ isActive: true });
    }

    async checkStockLevels(stock: StockBase): Promise<StockAlert[]> {
        return await this.model.find({
            itemId: stock.itemId,
            isActive: true,
            $or: [
                { 
                    type: 'LOW_STOCK',
                    threshold: { $gte: stock.available }
                },
                {
                    type: 'HIGH_STOCK',
                    threshold: { $lte: stock.available }
                }
            ]
        });
    }
} 