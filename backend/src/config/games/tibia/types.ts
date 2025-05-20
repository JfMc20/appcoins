export interface TibiaItemConfig {
  name: string;
  itemCode: string;
  type: 'currency' | 'service' | 'other';
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
}

export interface TibiaGameConfig {
  gameId: string;
  name: string;
  rules: {
    currencyMultiplier: number;  // 25 para TC
    basePackageSize: number;     // 250 para TC
    minTransactionAmount: number;
    maxTransactionAmount: number;
    allowedCurrencies: string[];  // Array mutable de strings
  };
  predefinedItems: TibiaItemConfig[];
} 