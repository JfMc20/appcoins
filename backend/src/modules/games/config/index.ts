import { GameBase } from '../types';

export interface GameConfig<T extends GameBase> {
    gameId: string;
    name: string;
    version: string;
    rules: GameRules;
    items: GameItemConfig[];
    metadata: Record<string, any>;
}

export interface GameRules {
    currencyMultiplier: number;
    basePackageSize: number;
    minTransactionAmount: number;
    maxTransactionAmount: number;
    allowedCurrencies: string[];
    customRules?: Record<string, any>;
}

export interface GameItemConfig {
    name: string;
    itemCode: string;
    type: string;
    rules: {
        followsGameRules: boolean;
        customMultiplier?: number;
        customPackageSize?: number;
    };
    pricing: {
        buyPrice: {
            amount: number;
            currency: string;
        };
        sellPrice: {
            amount: number;
            currency: string;
        };
    };
    metadata?: Record<string, any>;
}

// Exportar configuraciones específicas de juegos
export * from './tibia'; 