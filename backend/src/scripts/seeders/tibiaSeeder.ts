import mongoose from 'mongoose';
import GameModel from '../../models/GameModel';
import GameItemModel from '../../models/GameItemModel';
import { TIBIA_CONFIG } from '../../config/games/tibia/config';
import { logger } from '../../utils/logger';

export const seedTibiaGame = async (): Promise<void> => {
  try {
    // Crear el juego Tibia si no existe
    let tibiaGame = await GameModel.findOne({ name: TIBIA_CONFIG.name });
    
    if (!tibiaGame) {
      tibiaGame = await GameModel.create({
        name: TIBIA_CONFIG.name,
        shortName: 'TB',
        description: 'Tibia es un MMORPG clásico desarrollado por CipSoft.',
        status: 'active',
        platform: ['PC'],
        metrics: {
          popularity: 8,
          lastUpdated: new Date()
        }
      });
      logger.info('Juego Tibia creado exitosamente');
    }

    // Eliminar items existentes para este juego
    await GameItemModel.deleteMany({ gameId: tibiaGame._id });
    logger.info('Items existentes eliminados');

    // Crear los items predefinidos
    for (const item of TIBIA_CONFIG.predefinedItems) {
      const itemData = {
        gameId: tibiaGame._id,
        name: item.name,
        itemCode: item.itemCode,
        type: item.type,
        description: `${item.name} para ${TIBIA_CONFIG.name}`,
        stackable: true,
        isTradable: true,
        managesStock: true,
        currentStock: 0,
        status: 'active',
        attributes: [
          {
            key: 'followsGameRules',
            value: item.rules.followsGameRules.toString()
          },
          {
            key: 'customMultiplier',
            value: item.rules.customMultiplier?.toString() || ''
          },
          {
            key: 'customPackageSize',
            value: item.rules.customPackageSize?.toString() || ''
          }
        ],
        pricing: {
          strategy: 'fixed',
          referenceCurrency: 'USD',
          buyPricePerUnit: item.pricing.buyPrice.amount,
          sellPricePerUnit: item.pricing.sellPrice.amount,
          lastUpdated: new Date()
        }
      };

      const result = await GameItemModel.create(itemData);
      logger.info(`Item ${item.name} (${item.itemCode}) creado exitosamente`);
    }

    logger.info('Seeder de Tibia completado exitosamente');
  } catch (error) {
    logger.error('Error en el seeder de Tibia:', error);
    throw error;
  }
}; 