import { TibiaItemConfig } from './types';
import { TIBIA_CONSTANTS } from './constants';

export const TIBIA_PREDEFINED_ITEMS: TibiaItemConfig[] = [
  {
    name: 'Tibia Coins',
    itemCode: TIBIA_CONSTANTS.ITEM_CODES.TIBIA_COINS,
    type: 'currency',
    rules: {
      followsGameRules: true,
      customMultiplier: TIBIA_CONSTANTS.CURRENCY_MULTIPLIER,
      customPackageSize: TIBIA_CONSTANTS.BASE_PACKAGE_SIZE
    },
    pricing: {
      buyPrice: {
        amount: 0, // Este valor se debe configurar según el precio de reseller
        currency: 'USD'
      },
      sellPrice: {
        amount: 0, // Este valor se debe configurar según el precio de venta
        currency: 'USD'
      }
    }
  },
  {
    name: 'Recovery Key',
    itemCode: TIBIA_CONSTANTS.ITEM_CODES.RECOVERY_KEY,
    type: 'service',
    rules: {
      followsGameRules: false
    },
    pricing: {
      buyPrice: {
        amount: 0, // Este valor se debe configurar según el precio de reseller
        currency: 'USD'
      },
      sellPrice: {
        amount: 0, // Este valor se debe configurar según el precio de venta
        currency: 'USD'
      }
    }
  }
]; 