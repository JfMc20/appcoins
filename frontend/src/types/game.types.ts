// Definiciones de tipos para juegos y sus ítems

export interface Game {
  _id: string;
  name: string;
  shortName: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt?: string;
  updatedAt?: string;
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
  shortName: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateGameData {
  name?: string;
  shortName?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
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