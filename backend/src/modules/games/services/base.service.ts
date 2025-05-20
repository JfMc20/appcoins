import { BaseEntity } from '../types';

export abstract class BaseService<T extends BaseEntity> {
    protected abstract model: any;

    async create(data: Partial<T>): Promise<T> {
        const entity = new this.model(data);
        return await entity.save();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findAll(filter: Partial<T> = {}): Promise<T[]> {
        return await this.model.find(filter);
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.model.countDocuments({ _id: id });
        return count > 0;
    }
} 