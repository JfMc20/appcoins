export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GameBase extends BaseEntity {
    name: string;
    description: string;
    version: string;
    status: GameStatus;
    metadata: Record<string, any>;
}

export enum GameStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE',
    DEPRECATED = 'DEPRECATED'
}

export interface GameItemBase extends BaseEntity {
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    attributes: Record<string, any>;
}

export enum ItemType {
    WEAPON = 'WEAPON',
    ARMOR = 'ARMOR',
    CONSUMABLE = 'CONSUMABLE',
    CURRENCY = 'CURRENCY',
    COLLECTIBLE = 'COLLECTIBLE',
    OTHER = 'OTHER'
}

export enum ItemRarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    MYTHIC = 'MYTHIC'
} 