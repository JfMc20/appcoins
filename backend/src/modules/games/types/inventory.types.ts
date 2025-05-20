import { BaseEntity } from './base.types';
import { GameItemBase } from './base.types';

export interface InventoryBase extends BaseEntity {
    userId: string;
    items: InventoryItem[];
    capacity: number;
    metadata: Record<string, any>;
}

export interface InventoryItem {
    item: GameItemBase;
    quantity: number;
    acquiredAt: Date;
    expiresAt?: Date;
    metadata: Record<string, any>;
}

export interface StockBase extends BaseEntity {
    itemId: string;
    quantity: number;
    reserved: number;
    available: number;
    metadata: Record<string, any>;
}

export interface StockTransaction extends BaseEntity {
    type: StockTransactionType;
    itemId: string;
    quantity: number;
    referenceId?: string;
    metadata: Record<string, any>;
}

export enum StockTransactionType {
    ADD = 'ADD',
    REMOVE = 'REMOVE',
    RESERVE = 'RESERVE',
    RELEASE = 'RELEASE',
    TRANSFER = 'TRANSFER'
}

export interface StockAlert extends BaseEntity {
    itemId: string;
    type: StockAlertType;
    threshold: number;
    isActive: boolean;
    metadata: Record<string, any>;
}

export enum StockAlertType {
    LOW_STOCK = 'LOW_STOCK',
    HIGH_STOCK = 'HIGH_STOCK',
    STOCK_DEPLETED = 'STOCK_DEPLETED',
    CUSTOM = 'CUSTOM'
} 