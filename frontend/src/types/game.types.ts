// Definiciones de tipos para juegos y sus ítems

export interface GameMetrics {
  playerBase?: number;
  popularity?: number;
  profitMargin?: number;
  lastUpdated?: Date;
}

export interface Game {
  _id: string;
  name: string;
  shortName?: string;
  description?: string;
  iconUrl?: string;
  officialUrl?: string;
  releaseDate?: Date;
  lastVersionUpdate?: Date;
  platform?: string[];
  metrics?: GameMetrics;
  status: 'active' | 'inactive' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GameItem {
  _id: string;
  gameId: string | Game;
  name: string;
  itemCode: string;
  type: 'currency' | 'item' | 'service' | 'other';
  description?: string;
  stackable?: boolean;
  isTradable: boolean;
  managesStock: boolean;
  currentStock?: number;
  status: 'active' | 'inactive' | 'archived';
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces para creación y actualización
export interface CreateGameData {
  name: string;
  shortName?: string;
  description?: string;
  iconUrl?: string;
  officialUrl?: string;
  platform?: string[];
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateGameData extends Partial<CreateGameData> {
  metrics?: Partial<GameMetrics>;
}

export interface CreateGameItemData {
  gameId: string;
  name: string;
  itemCode: string;
  type: 'currency' | 'item' | 'service' | 'other';
  description?: string;
  stackable?: boolean;
  isTradable: boolean;
  managesStock: boolean;
  currentStock?: number;
  status?: 'active' | 'inactive' | 'archived';
  attributes?: Array<{
    name: string;
    value: string;
  }>;
}

export interface UpdateGameItemData {
  gameId?: string;
  name?: string;
  itemCode?: string;
  type?: 'currency' | 'item' | 'service' | 'other';
  description?: string;
  stackable?: boolean;
  isTradable?: boolean;
  managesStock?: boolean;
  currentStock?: number;
  status?: 'active' | 'inactive' | 'archived';
  attributes?: Array<{
    name: string;
    value: string;
  }>;
}

export interface GameResponse {
  success: boolean;
  data: Game;
  message?: string;
}

export interface GamesListResponse {
  success: boolean;
  data: Game[];
  message?: string;
} 