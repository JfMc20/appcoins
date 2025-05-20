import { TibiaGameConfig } from './types';
import { TIBIA_CONSTANTS } from './constants';
import { TIBIA_PREDEFINED_ITEMS } from './items';

export const TIBIA_CONFIG: TibiaGameConfig = {
  gameId: TIBIA_CONSTANTS.GAME_ID,
  name: TIBIA_CONSTANTS.GAME_NAME,
  rules: {
    currencyMultiplier: TIBIA_CONSTANTS.CURRENCY_MULTIPLIER,
    basePackageSize: TIBIA_CONSTANTS.BASE_PACKAGE_SIZE,
    minTransactionAmount: TIBIA_CONSTANTS.MIN_TRANSACTION_AMOUNT,
    maxTransactionAmount: TIBIA_CONSTANTS.MAX_TRANSACTION_AMOUNT,
    allowedCurrencies: TIBIA_CONSTANTS.ALLOWED_CURRENCIES
  },
  predefinedItems: TIBIA_PREDEFINED_ITEMS
}; 