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
const getAllGames = (filters: { status?: string; search?: string } = {}): Promise<Game[]> => {
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

// Eliminar un juego (puede ser archivar o eliminar permanentemente según el endpoint del backend)
// La función actual parece apuntar a una eliminación que también puede archivar con un query param.
// Vamos a mantenerla así si es necesario, y añadimos una específica para permanente.
const deleteGame = async (id: string, archive: boolean = true): Promise<Game | void> => {
  // El endpoint actual /api/games/:id con método DELETE parece manejar el archivado basado en el query param 'archive'
  // Si archive es true, cambia el estado a 'archived'. Si no se pasa 'archive' o es false, podría eliminar (según la lógica del backend).
  // Revisar la lógica del backend para deleteGame para confirmar.
  const response = await api.delete<{ success: boolean, message?: string, data?: Game }>(`${GAMES_PATH}/${id}${archive ? '?archive=true' : ''}`);
  if (response.data.success && response.data.data) {
    return response.data.data; // Devuelve el juego (posiblemente con estado actualizado)
  }
  // Si no devuelve data (ej. eliminación física), no se devuelve nada o se maneja el mensaje.
  // Considerar lanzar un error si !response.data.success
};

// Nueva función para eliminar permanentemente un juego
const permanentlyDeleteGameById = async (id: string): Promise<void> => {
  try {
    const response = await api.delete<{ message: string }>(`${GAMES_PATH}/${id}/permanent`);
    // No se espera que devuelva el juego, solo un mensaje de éxito.
    // El manejo de errores (ej. si el juego no existe o no está archivado) se hará con el try/catch y lo que devuelva el API.
    // Podrías querer que devuelva algo más específico o manejar la respuesta de manera diferente.
    console.log(response.data.message); // O usar toast.success(response.data.message);
  } catch (error) {
    // El apiClient debería manejar y lanzar errores que pueden ser atrapados aquí
    // o en el componente que llama a esta función.
    console.error('Error al eliminar permanentemente el juego:', error);
    throw error; // Re-lanzar para que el componente lo maneje (ej. mostrar toast.error)
  }
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
  deleteGame, // Esta es la que archiva/desarchiva o elimina según el backend
  permanentlyDeleteGameById, // Nueva función
  getGameItems,
  getGameItemById,
  createGameItem,
  updateGameItem,
  updateGameItemStock,
  deleteGameItem
};

export default gameService; 