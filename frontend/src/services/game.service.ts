import axios from 'axios';
import { 
  Game,
  CreateGameData, 
  UpdateGameData, 
  GameResponse, 
  GamesListResponse 
} from '../types/game.types';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/games`;

// Obtener todos los juegos
const getAllGames = (): Promise<Game[]> => {
  return axios.get<GamesListResponse>(API_URL)
    .then(response => response.data.data);
};

// Obtener juegos activos
const getActiveGames = (): Promise<Game[]> => {
  return axios.get<GamesListResponse>(`${API_URL}/active`)
    .then(response => response.data.data);
};

// Obtener un juego por ID
const getGameById = (id: string): Promise<Game> => {
  return axios.get<GameResponse>(`${API_URL}/${id}`)
    .then(response => response.data.data);
};

// Crear un nuevo juego
const createGame = (gameData: CreateGameData): Promise<Game> => {
  return axios.post<GameResponse>(API_URL, gameData)
    .then(response => response.data.data);
};

// Actualizar un juego existente
const updateGame = (id: string, gameData: UpdateGameData): Promise<Game> => {
  return axios.put<GameResponse>(`${API_URL}/${id}`, gameData)
    .then(response => response.data.data);
};

// Eliminar un juego
const deleteGame = (id: string): Promise<void> => {
  return axios.delete(`${API_URL}/${id}`);
};

// Actualizar métricas del juego
const updateGameMetrics = (id: string, metricsData: any): Promise<Game> => {
  return axios.patch<GameResponse>(`${API_URL}/${id}/metrics`, metricsData)
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