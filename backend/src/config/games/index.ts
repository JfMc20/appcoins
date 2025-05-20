import { TIBIA_CONFIG } from './tibia/config';

export const GAME_CONFIGS = {
  tibia: TIBIA_CONFIG
} as const;

export type GameConfigKey = keyof typeof GAME_CONFIGS; 