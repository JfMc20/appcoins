import { BaseService } from './base.service';
import { GameBase, GameStatus } from '../types';

export class GameService extends BaseService<GameBase> {
    protected model: any; // Aquí irá el modelo de Mongoose

    async findByStatus(status: GameStatus): Promise<GameBase[]> {
        return await this.model.find({ status });
    }

    async updateStatus(id: string, status: GameStatus): Promise<GameBase | null> {
        return await this.update(id, { status });
    }

    async searchByName(name: string): Promise<GameBase[]> {
        return await this.model.find({
            name: { $regex: name, $options: 'i' }
        });
    }
} 