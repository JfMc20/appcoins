import React, { useState, useEffect } from 'react';
import gameService from '../../../services/game.service'; // Corregido: ../../../
import { Game, CreateGameData, UpdateGameData } from '../../../types/game.types'; // Corregido: ../../../
import { DashboardLayout } from '../../../components/layout'; // Corregido: ../../../
import { LoadingSpinner, Notification, Button, Modal, Input } from '../../../components/common'; // Corregido: ../../../

const GamesManagementPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para mensajes de éxito

  // Estados para el modal de Creación
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newGameName, setNewGameName] = useState<string>('');
  const [newGameIconUrl, setNewGameIconUrl] = useState<string>('');
  const [newGameStatus, setNewGameStatus] = useState<'active' | 'inactive'>('active');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Estados para el modal de Edición
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editGameName, setEditGameName] = useState<string>('');
  const [editGameIconUrl, setEditGameIconUrl] = useState<string>('');
  const [editGameStatus, setEditGameStatus] = useState<'active' | 'inactive'>('active');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Estados para el modal de Confirmación de Eliminación
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedGames = await gameService.getAllGames();
        setGames(fetchedGames);
      } catch (err: any) {
        console.error("Error fetching games:", err);
        setError(err.response?.data?.message || 'Error al cargar los juegos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []); // El array vacío asegura que se ejecute solo al montar

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    const gameData: CreateGameData = {
      name: newGameName,
      iconUrl: newGameIconUrl || undefined,
      status: newGameStatus
    };

    try {
      const newGame = await gameService.createGame(gameData);
      setGames(prevGames => [...prevGames, newGame]);
      setSuccessMessage(`Juego "${newGame.name}" creado con éxito.`);
      setShowCreateModal(false);
      setNewGameName('');
      setNewGameIconUrl('');
      setNewGameStatus('active');
    } catch (err: any) {
      console.error("Error creating game:", err);
      setError(err.response?.data?.message || 'Error al crear el juego.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    const gameData: UpdateGameData = {
      name: editGameName,
      iconUrl: editGameIconUrl || undefined,
      status: editGameStatus
    };

    try {
      const updatedGame = await gameService.updateGame(editingGame._id, gameData);
      setGames((prevGames: Game[]) => prevGames.map((g: Game) => 
        g._id === updatedGame._id ? updatedGame : g
      ));
      setSuccessMessage(`Juego "${updatedGame.name}" actualizado con éxito.`);
      setShowEditModal(false);
      setEditingGame(null);
    } catch (err: any) {
      console.error("Error updating game:", err);
      setError(err.response?.data?.message || 'Error al actualizar el juego.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!deletingGame) return;

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await gameService.deleteGame(deletingGame._id);
      setGames((prevGames: Game[]) => prevGames.filter((g: Game) => g._id !== deletingGame._id));
      setSuccessMessage(`Juego "${deletingGame.name}" eliminado con éxito.`);
      setShowDeleteConfirmModal(false);
      setDeletingGame(null);
    } catch (err: any) {
      console.error("Error deleting game:", err);
      setError(err.response?.data?.message || 'Error al eliminar el juego.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Juegos</h1>
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="primary"
          >
            Crear nuevo juego
          </Button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <Notification type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <Notification type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        )}

        {/* Indicador de carga */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            {games.length > 0 ? (
              <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Icono
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {games.map((game: Game) => (
                      <tr key={game._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {game.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {/* Mostrar icono si existe */}
                          {game.iconUrl ? (
                            <img src={game.iconUrl} alt={game.name} className="h-8 w-8 object-contain" />
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                            game.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 
                            game.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                          }`}>
                            {game.status === 'active' ? 'Activo' : game.status === 'inactive' ? 'Inactivo' : 'Archivado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingGame(game);
                              setShowEditModal(true);
                              setEditGameName(game.name);
                              setEditGameIconUrl(game.iconUrl || '');
                              setEditGameStatus(game.status === 'archived' ? 'inactive' : game.status);
                            }}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setDeletingGame(game);
                              setShowDeleteConfirmModal(true);
                            }}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-8 text-center">
                 <p className="mt-4 text-gray-500 dark:text-gray-400">No se encontraron juegos.</p>
                 {/* Podríamos añadir un botón aquí para crear el primero si la lista está vacía */}
                 <Button 
                   onClick={() => console.log('Abrir modal Crear Juego')} 
                   variant="primary"
                   className="mt-4"
                 >
                   Crear el primer juego
                 </Button>
               </div>
            )}
          </div>
        )}

        {/* Modal de Creación */}
        <Modal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Juego"
        >
          <form onSubmit={handleCreateGame} className="space-y-4">
            <Input 
              label="Nombre del Juego"
              id="newGameName"
              value={newGameName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGameName(e.target.value)}
              required
            />
            <Input 
              label="URL del Icono (Opcional)"
              id="newGameIconUrl"
              type="url" // Sugerir tipo URL
              value={newGameIconUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGameIconUrl(e.target.value)}
            />
            <div>
              <label htmlFor="newGameStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <select 
                id="newGameStatus"
                value={newGameStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewGameStatus(e.target.value as 'active' | 'inactive')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreating} disabled={isCreating}>
                {isCreating ? 'Creando...' : 'Crear Juego'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Edición */}
        {editingGame && (
          <Modal 
            isOpen={showEditModal} 
            onClose={() => {
              setShowEditModal(false);
              setEditingGame(null);
            }}
            title={`Editar Juego: ${editingGame.name}`}
          >
            <form onSubmit={handleUpdateGame} className="space-y-4">
              <Input 
                label="Nombre del Juego"
                id="editGameName"
                value={editGameName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditGameName(e.target.value)}
                required
              />
              <Input 
                label="URL del Icono (Opcional)"
                id="editGameIconUrl"
                type="url"
                value={editGameIconUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditGameIconUrl(e.target.value)}
              />
              <div>
                <label htmlFor="editGameStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select 
                  id="editGameStatus"
                  value={editGameStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditGameStatus(e.target.value as 'active' | 'inactive')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={() => {
                  setShowEditModal(false);
                  setEditingGame(null);
                }} disabled={isUpdating}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isUpdating} disabled={isUpdating}>
                  {isUpdating ? 'Actualizando...' : 'Actualizar Juego'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {deletingGame && (
          <Modal
            isOpen={showDeleteConfirmModal}
            onClose={() => {
              setShowDeleteConfirmModal(false);
              setDeletingGame(null);
            }}
            title={`Confirmar Eliminación`}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ¿Estás seguro de que quieres eliminar el juego "<strong>{deletingGame.name}</strong>"?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                 <Button 
                   type="button" 
                   variant="secondary" 
                   onClick={() => {
                     setShowDeleteConfirmModal(false);
                     setDeletingGame(null);
                   }} 
                   disabled={isDeleting}
                 >
                   Cancelar
                 </Button>
                 <Button 
                   type="button" 
                   variant="danger" 
                   isLoading={isDeleting} 
                   disabled={isDeleting}
                   onClick={handleDeleteGame}
                 >
                   {isDeleting ? 'Eliminando...' : 'Eliminar Juego'}
                 </Button>
               </div>
            </div>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default GamesManagementPage; 