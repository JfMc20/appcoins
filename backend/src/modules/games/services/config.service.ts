import { GameConfig, GameRules, GameItemConfig } from '../config';
import { GameBase } from '../types';
import { logger } from '../../../utils/logger';

export class GameConfigService {
    private static instance: GameConfigService;
    private gameConfigs: Map<string, GameConfig<any>> = new Map();

    private constructor() {}

    static getInstance(): GameConfigService {
        if (!GameConfigService.instance) {
            GameConfigService.instance = new GameConfigService();
        }
        return GameConfigService.instance;
    }

    async loadGameConfig<T extends GameBase>(gameId: string): Promise<GameConfig<T> | null> {
        try {
            if (this.gameConfigs.has(gameId)) {
                return this.gameConfigs.get(gameId) as GameConfig<T>;
            }

            // Importar dinámicamente la configuración del juego
            const config = await import(`../config/${gameId}`);
            if (!config) {
                logger.error(`[GameConfigService] No se encontró configuración para el juego ${gameId}`);
                return null;
            }

            this.gameConfigs.set(gameId, config.default);
            return config.default as GameConfig<T>;
        } catch (error) {
            logger.error(`[GameConfigService] Error al cargar configuración del juego ${gameId}: ${error}`);
            return null;
        }
    }

    getGameRules(gameId: string): GameRules | null {
        const config = this.gameConfigs.get(gameId);
        return config?.rules || null;
    }

    getGameItems(gameId: string): GameItemConfig[] | null {
        const config = this.gameConfigs.get(gameId);
        return config?.items || null;
    }

    getGameItem(gameId: string, itemCode: string): GameItemConfig | null {
        const items = this.getGameItems(gameId);
        return items?.find(item => item.itemCode === itemCode) || null;
    }

    validateTransaction(gameId: string, amount: number): boolean {
        const rules = this.getGameRules(gameId);
        if (!rules) return false;

        return amount >= rules.minTransactionAmount && 
               amount <= rules.maxTransactionAmount;
    }

    calculatePrice(gameId: string, amount: number, currency: string): number | null {
        const rules = this.getGameRules(gameId);
        if (!rules) return null;

        if (!rules.allowedCurrencies.includes(currency)) {
            return null;
        }

        return amount * rules.currencyMultiplier;
    }
} 