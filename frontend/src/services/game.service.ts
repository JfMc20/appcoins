import api from './api';
import { 
  Game,
  CreateGameData, 
  UpdateGameData, 
  GameResponse, 
  GamesListResponse 
} from '../types/game.types';

const GAMES_PATH = '/games';

// Obtener todos los juegos
const getAllGames = (): Promise<Game[]> => {
  return api.get<GamesListResponse>(GAMES_PATH)
    .then(response => response.data.data);
};

// Obtener juegos activos
const getActiveGames = (): Promise<Game[]> => {
  return api.get<GamesListResponse>(`${GAMES_PATH}/active`)
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
const deleteGame = (id: string): Promise<void> => {
  return api.delete(`${GAMES_PATH}/${id}`);
};

// Actualizar métricas del juego
const updateGameMetrics = (id: string, metricsData: any): Promise<Game> => {
  return api.patch<GameResponse>(`${GAMES_PATH}/${id}/metrics`, metricsData)
    .then(response => response.data.data);
};

const gameService = {
  getAllGames,
  getActiveGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameMetrics
};

export default gameService; 