import { BaseEntity } from './base.types';

export interface PriceBase extends BaseEntity {
    amount: number;
    currency: string;
    type: PriceType;
    metadata: Record<string, any>;
}

export enum PriceType {
    PURCHASE = 'PURCHASE',
    RENTAL = 'RENTAL',
    SUBSCRIPTION = 'SUBSCRIPTION',
    UPGRADE = 'UPGRADE',
    CUSTOM = 'CUSTOM'
}

export interface PriceTier extends BaseEntity {
    name: string;
    description: string;
    prices: PriceBase[];
    conditions: PriceCondition[];
}

export interface PriceCondition {
    type: PriceConditionType;
    value: any;
    operator: PriceConditionOperator;
}

export enum PriceConditionType {
    TIME_LIMIT = 'TIME_LIMIT',
    QUANTITY = 'QUANTITY',
    USER_LEVEL = 'USER_LEVEL',
    CUSTOM = 'CUSTOM'
}

export enum PriceConditionOperator {
    EQUALS = 'EQUALS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    BETWEEN = 'BETWEEN',
    IN = 'IN'
} 