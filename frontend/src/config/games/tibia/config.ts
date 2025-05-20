export const TIBIA_CONFIG = {
  name: 'Tibia',
  shortName: 'TB',
  predefinedItems: [
    {
      name: 'Tibia Coins',
      itemCode: 'TC',
      type: 'currency',
      rules: {
        followsGameRules: true,
        customMultiplier: 25,
        customPackageSize: 250
      }
    },
    {
      name: 'Recovery Key',
      itemCode: 'RK',
      type: 'service',
      rules: {
        followsGameRules: true
      }
    }
  ]
} as const; 