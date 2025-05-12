import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import gameService from '../../../services/game.service';
import { Game, CreateGameData } from '../../../types/game.types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { 
  LoadingSpinner, 
  Notification, 
  FilterBar 
} from '../../../components/common';
import { 
  GameTable, 
  GameForm 
} from '../../../components/games';
import { DashboardLayout } from '../../../components/layout';
import useNotification from '../../../hooks/useNotification';
import Modal from '../../../components/common/Modal';
import { toast } from 'react-toastify';

const GameManagementPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { error, setError, clearMessages } = useNotification();

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gameService.getAllGames();
      setGames(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al cargar juegos';
      setError(message);
      toast.error(message); 
      console.error('Error al cargar juegos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchGames();
  }, [user, navigate, fetchGames]);

  const handleCreateGame = () => {
    setCurrentGame(null);
    setShowCreateForm(true);
    clearMessages();
  };

  const handleEditGame = (game: Game) => {
    setCurrentGame(game);
    setShowCreateForm(true);
    clearMessages();
  };

  const handleFormSubmit = async (data: CreateGameData | Game) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let savedGame: Game;
      if ('_id' in data && data._id) {
        const { _id, ...updateData } = data;
        savedGame = await gameService.updateGame(_id, updateData as Partial<Game>);
        toast.success('Juego actualizado con éxito');
        setGames(prevGames => prevGames.map(g => g._id === savedGame._id ? savedGame : g));
      } else {
        savedGame = await gameService.createGame(data as CreateGameData);
        toast.success('Juego creado con éxito');
        setGames(prevGames => [...prevGames, savedGame]);
      }
      setShowCreateForm(false);
      setCurrentGame(null);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al guardar el juego';
      setError(message);
      toast.error(message);
      console.error('Error al guardar juego:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewGameItems = (gameId: string) => {
    navigate(`/admin/games/${gameId}/items`);
  };
  
  const handleStatusChange = async (gameId: string, newStatus: 'active' | 'inactive' | 'archived') => {
    setError(null);
    try {
      const updatedGame = await gameService.updateGame(gameId, { status: newStatus });
      setGames(prevGames => 
        prevGames.map(game => 
          game._id === gameId ? { ...game, status: updatedGame.status } : game
        )
      );
      toast.success(`Estado del juego actualizado a: ${newStatus}`);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al actualizar estado';
      setError(message);
      toast.error(message);
      console.error('Error actualizando estado:', err);
    }
  };

  const handleDeleteRequest = (gameId: string) => {
    setGameToDelete(gameId);
    setShowDeleteConfirmModal(true);
    clearMessages();
  };

  const handleDeleteGame = async () => {
    if (gameToDelete) {
      setError(null);
      try {
        await gameService.deleteGame(gameToDelete);
        setGames(prevGames => prevGames.filter(game => game._id !== gameToDelete));
        toast.success('Juego eliminado con éxito!');
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Error al eliminar juego';
        setError(message);
        toast.error(message);
        console.error('Error al eliminar juego:', err);
      } finally {
        setGameToDelete(null);
        setShowDeleteConfirmModal(false);
      }
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setCurrentGame(null);
    clearMessages();
  };

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const nameMatch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const shortNameMatch = (game.shortName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || game.status === statusFilter;
      return (nameMatch || shortNameMatch) && statusMatch;
    });
  }, [games, searchTerm, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Juegos
          </h1>
          <Button
            variant="primary"
            onClick={handleCreateGame}
          >
            Crear nuevo juego
          </Button>
        </div>

        {error && (
          <Notification
            type="error"
            message={error}
            onClose={clearMessages}
          />
        )}

        {showCreateForm && (
          <Modal
            isOpen={showCreateForm}
            onClose={toggleCreateForm}
            title={currentGame ? 'Editar Juego' : 'Crear Nuevo Juego'}
          >
            <GameForm
              onSubmit={handleFormSubmit}
              initialData={currentGame || undefined}
              isLoading={isSubmitting}
              onCancel={toggleCreateForm}
            />
          </Modal>
        )}

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o código..."
          filters={[
            {
              id: 'statusFilter',
              label: 'Filtrar por Estado',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' },
                { value: 'archived', label: 'Archivados' }
              ]
            }
          ]}
        />

        <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Juegos Configurados {filteredGames.length > 0 && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({filteredGames.length} {filteredGames.length === 1 ? 'juego' : 'juegos'})</span>}
          </h2>
          
          {isLoading ? (
            <LoadingSpinner message="Cargando juegos..." />
          ) : (
            <GameTable
              games={filteredGames}
              onViewItems={handleViewGameItems}
              onEdit={handleEditGame}
              onStatusChange={handleStatusChange}
              onDeleteRequest={handleDeleteRequest}
              allGamesCount={games.length}
              onClearFilters={handleClearFilters}
            />
          )}
        </Card>

        <Modal
          isOpen={showDeleteConfirmModal}
          onClose={() => {
            setShowDeleteConfirmModal(false);
            setGameToDelete(null);
          }}
          title="Confirmar Eliminación"
        >
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar este juego? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirmModal(false);
              setGameToDelete(null);
            }}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteGame}> 
              Eliminar
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default GameManagementPage; 