import { BaseService } from './base.service';
import { PriceBase, PriceTier, PriceType } from '../types';

export class PriceService extends BaseService<PriceBase> {
    protected model: any;

    async findByType(type: PriceType): Promise<PriceBase[]> {
        return await this.model.find({ type });
    }

    async findByCurrency(currency: string): Promise<PriceBase[]> {
        return await this.model.find({ currency });
    }

    async findPricesInRange(min: number, max: number): Promise<PriceBase[]> {
        return await this.model.find({
            amount: { $gte: min, $lte: max }
        });
    }
}

export class PriceTierService extends BaseService<PriceTier> {
    protected model: any;

    async findTiersByPrice(priceId: string): Promise<PriceTier[]> {
        return await this.model.find({
            'prices._id': priceId
        });
    }

    async addPriceToTier(tierId: string, price: PriceBase): Promise<PriceTier | null> {
        return await this.model.findByIdAndUpdate(
            tierId,
            { $push: { prices: price } },
            { new: true }
        );
    }

    async removePriceFromTier(tierId: string, priceId: string): Promise<PriceTier | null> {
        return await this.model.findByIdAndUpdate(
            tierId,
            { $pull: { prices: { _id: priceId } } },
            { new: true }
        );
    }
} 