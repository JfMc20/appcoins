import api from './api';
import { 
  Game,
  CreateGameData, 
  UpdateGameData, 
  GameResponse, 
  GamesListResponse, 
  GameItem, 
  CreateGameItemData, 
  UpdateGameItemData
} from '../types/game.types';

const GAMES_PATH = '/games';
const GAME_ITEMS_PATH = '/game-items';

// Obtener todos los juegos
const getAllGames = (filters?: { status?: string; search?: string }): Promise<Game[]> => {
  return api.get<GamesListResponse>(GAMES_PATH, { params: filters })
    .then(response => response.data.data);
};

// Obtener un juego por ID
const getGameById = (id: string): Promise<Game> => {
  return api.get<GameResponse>(`${GAMES_PATH}/${id}`)
    .then(response => response.data.data);
};

// Crear un nuevo juego
const createGame = (gameData: CreateGameData): Promise<Game> => {
  return api.post<GameResponse>(GAMES_PATH, gameData)
    .then(response => response.data.data);
};

// Actualizar un juego existente
const updateGame = (id: string, gameData: UpdateGameData): Promise<Game> => {
  return api.put<GameResponse>(`${GAMES_PATH}/${id}`, gameData)
    .then(response => response.data.data);
};

// Eliminar un juego
const deleteGame = (id: string, archive: boolean = true): Promise<void> => {
  return api.delete(`${GAMES_PATH}/${id}`, { params: { archive } });
};

// Obtener todos los ítems de juegos
const getGameItems = (filters?: {
  gameId?: string;
  type?: string;
  status?: string;
  managesStock?: boolean;
  isTradable?: boolean;
  search?: string;
}): Promise<GameItem[]> => {
  return api.get<GamesListResponse>(GAME_ITEMS_PATH, { params: filters })
    .then(response => response.data.data as GameItem[]);
};

// Obtener un ítem de juego por ID
const getGameItemById = (id: string): Promise<GameItem> => {
  return api.get<GameResponse>(`${GAME_ITEMS_PATH}/${id}`)
    .then(response => response.data.data as GameItem);
};

// Crear un nuevo ítem de juego
const createGameItem = (itemData: CreateGameItemData): Promise<GameItem> => {
  return api.post<GameResponse>(GAME_ITEMS_PATH, itemData)
    .then(response => response.data.data as GameItem);
};

// Actualizar un ítem de juego existente
const updateGameItem = (id: string, itemData: UpdateGameItemData): Promise<GameItem> => {
  return api.put<GameResponse>(`${GAME_ITEMS_PATH}/${id}`, itemData)
    .then(response => response.data.data as GameItem);
};

// Actualizar el stock de un ítem de juego
const updateGameItemStock = (id: string, currentStock: number): Promise<GameItem> => {
  return api.patch<GameResponse>(`${GAME_ITEMS_PATH}/${id}/stock`, { currentStock })
    .then(response => response.data.data as GameItem);
};

// Eliminar un ítem de juego
const deleteGameItem = (id: string, archive: boolean = true): Promise<void> => {
  return api.delete(`${GAME_ITEMS_PATH}/${id}`, { params: { archive } });
};

const gameService = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getGameItems,
  getGameItemById,
  createGameItem,
  updateGameItem,
  updateGameItemStock,
  deleteGameItem
};

export default gameService; 