import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { PriceService, PriceTierService } from '../services/price.service';
import { PriceBase, PriceTier, PriceType } from '../types';
import { logger } from '../../../utils/logger';

export class PriceController extends BaseController<PriceBase> {
    constructor(
        private priceService: PriceService,
        private priceTierService: PriceTierService
    ) {
        super(priceService);
    }

    async getByType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { type } = req.params;
            if (!Object.values(PriceType).includes(type as PriceType)) {
                res.status(400).json({
                    success: false,
                    message: 'Tipo de precio inválido'
                });
                return;
            }

            const prices = await this.priceService.findByType(type as PriceType);
            res.status(200).json({
                success: true,
                count: prices.length,
                data: prices
            });
        } catch (error) {
            logger.error(`[PriceController] Error al obtener precios por tipo: ${error}`);
            next(error);
        }
    }

    async getByCurrency(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { currency } = req.params;
            const prices = await this.priceService.findByCurrency(currency.toUpperCase());
            res.status(200).json({
                success: true,
                count: prices.length,
                data: prices
            });
        } catch (error) {
            logger.error(`[PriceController] Error al obtener precios por moneda: ${error}`);
            next(error);
        }
    }

    async getInRange(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { min, max } = req.query;
            if (!min || !max || isNaN(Number(min)) || isNaN(Number(max))) {
                res.status(400).json({
                    success: false,
                    message: 'Se requieren valores mínimos y máximos válidos'
                });
                return;
            }

            const prices = await this.priceService.findPricesInRange(Number(min), Number(max));
            res.status(200).json({
                success: true,
                count: prices.length,
                data: prices
            });
        } catch (error) {
            logger.error(`[PriceController] Error al obtener precios en rango: ${error}`);
            next(error);
        }
    }
}

export class PriceTierController extends BaseController<PriceTier> {
    constructor(private priceTierService: PriceTierService) {
        super(priceTierService);
    }

    async getTiersByPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { priceId } = req.params;
            const tiers = await this.priceTierService.findTiersByPrice(priceId);
            res.status(200).json({
                success: true,
                count: tiers.length,
                data: tiers
            });
        } catch (error) {
            logger.error(`[PriceTierController] Error al obtener tiers por precio: ${error}`);
            next(error);
        }
    }

    async addPriceToTier(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tierId } = req.params;
            const price = req.body;

            const tier = await this.priceTierService.addPriceToTier(tierId, price);
            if (!tier) {
                res.status(404).json({
                    success: false,
                    message: 'Tier no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: tier
            });
        } catch (error) {
            logger.error(`[PriceTierController] Error al agregar precio al tier: ${error}`);
            next(error);
        }
    }

    async removePriceFromTier(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tierId, priceId } = req.params;
            const tier = await this.priceTierService.removePriceFromTier(tierId, priceId);
            
            if (!tier) {
                res.status(404).json({
                    success: false,
                    message: 'Tier o precio no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: tier
            });
        } catch (error) {
            logger.error(`[PriceTierController] Error al remover precio del tier: ${error}`);
            next(error);
        }
    }
} 