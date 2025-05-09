import axios from 'axios';
import { 
  Game, 
  GameItem, 
  CreateGameData, 
  UpdateGameData, 
  CreateGameItemData, 
  UpdateGameItemData 
} from '../../types/game.types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const GAMES_URL = `${API_BASE_URL}/games`;
const GAME_ITEMS_URL = `${API_BASE_URL}/game-items`;

// === JUEGOS ===

// Obtener todos los juegos (con filtros opcionales)
const getGames = async (filters?: { status?: string; search?: string }): Promise<Game[]> => {
  const params = new URLSearchParams();
  
  if (filters?.status) {
    params.append('status', filters.status);
  }
  
  if (filters?.search) {
    params.append('search', filters.search);
  }
  
  const queryString = params.toString();
  const url = queryString ? `${GAMES_URL}?${queryString}` : GAMES_URL;
  
  const response = await axios.get(url);
  return response.data.data;
};

// Obtener un juego por ID
const getGameById = async (id: string): Promise<Game> => {
  const response = await axios.get(`${GAMES_URL}/${id}`);
  return response.data.data;
};

// Crear un nuevo juego
const createGame = async (gameData: CreateGameData): Promise<Game> => {
  const response = await axios.post(GAMES_URL, gameData);
  return response.data.data;
};

// Actualizar un juego existente
const updateGame = async (id: string, gameData: UpdateGameData): Promise<Game> => {
  const response = await axios.put(`${GAMES_URL}/${id}`, gameData);
  return response.data.data;
};

// Eliminar un juego
const deleteGame = async (id: string, archive: boolean = true): Promise<void> => {
  await axios.delete(`${GAMES_URL}/${id}${archive ? '?archive=true' : ''}`);
};

// === ITEMS DE JUEGOS ===

// Obtener todos los ítems de juegos (con filtros opcionales)
const getGameItems = async (filters?: {
  gameId?: string;
  type?: string;
  status?: string;
  managesStock?: boolean;
  isTradable?: boolean;
  search?: string;
}): Promise<GameItem[]> => {
  const params = new URLSearchParams();
  
  if (filters?.gameId) {
    params.append('gameId', filters.gameId);
  }
  
  if (filters?.type) {
    params.append('type', filters.type);
  }
  
  if (filters?.status) {
    params.append('status', filters.status);
  }
  
  if (filters?.managesStock !== undefined) {
    params.append('managesStock', filters.managesStock.toString());
  }
  
  if (filters?.isTradable !== undefined) {
    params.append('isTradable', filters.isTradable.toString());
  }
  
  if (filters?.search) {
    params.append('search', filters.search);
  }
  
  const queryString = params.toString();
  const url = queryString ? `${GAME_ITEMS_URL}?${queryString}` : GAME_ITEMS_URL;
  
  const response = await axios.get(url);
  return response.data.data;
};

// Obtener un ítem de juego por ID
const getGameItemById = async (id: string): Promise<GameItem> => {
  const response = await axios.get(`${GAME_ITEMS_URL}/${id}`);
  return response.data.data;
};

// Crear un nuevo ítem de juego
const createGameItem = async (itemData: CreateGameItemData): Promise<GameItem> => {
  const response = await axios.post(GAME_ITEMS_URL, itemData);
  return response.data.data;
};

// Actualizar un ítem de juego existente
const updateGameItem = async (id: string, itemData: UpdateGameItemData): Promise<GameItem> => {
  const response = await axios.put(`${GAME_ITEMS_URL}/${id}`, itemData);
  return response.data.data;
};

// Actualizar el stock de un ítem de juego
const updateGameItemStock = async (id: string, currentStock: number): Promise<GameItem> => {
  const response = await axios.patch(`${GAME_ITEMS_URL}/${id}/stock`, { currentStock });
  return response.data.data;
};

// Eliminar un ítem de juego
const deleteGameItem = async (id: string, archive: boolean = true): Promise<void> => {
  await axios.delete(`${GAME_ITEMS_URL}/${id}${archive ? '?archive=true' : ''}`);
};

const gameService = {
  // Juegos
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  
  // Items de Juegos
  getGameItems,
  getGameItemById,
  createGameItem,
  updateGameItem,
  updateGameItemStock,
  deleteGameItem
};

export default gameService; 