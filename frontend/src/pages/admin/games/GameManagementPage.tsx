import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import gameService from '../../../services/config/game.service';
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
import useGameFilters from '../../../hooks/useGameFilters';

const GameManagementPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { error, successMessage, setError, setSuccessMessage, clearMessages } = useNotification();
  const { filteredGames, searchTerm, statusFilter, setSearchTerm, setStatusFilter, resetFilters } = useGameFilters(games);

  // Función para cargar juegos
  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gameService.getGames();
      setGames(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar juegos');
      console.error('Error al cargar juegos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  // Cargar juegos al montar el componente
  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirigir a la página principal si no es administrador
      return;
    }

    fetchGames();
  }, [user, navigate, fetchGames]);

  const handleCreateGame = async (gameData: CreateGameData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newGame = await gameService.createGame(gameData);
      setGames(prevGames => [...prevGames, newGame]);
      setSuccessMessage(`¡Juego ${newGame.name} creado con éxito!`);
      
      // Cerrar el formulario
      setShowCreateForm(false);
      
      // Recargar la lista de juegos
      fetchGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear juego');
      console.error('Error al crear juego:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewGameItems = (gameId: string) => {
    navigate(`/admin/games/${gameId}/items`);
  };
  
  const handleStatusChange = async (gameId: string, newStatus: 'active' | 'inactive' | 'archived') => {
    setIsLoading(true);
    setError(null);
    try {
      await gameService.updateGame(gameId, { status: newStatus });
      setGames(prevGames => 
        prevGames.map(game => 
          game._id === gameId ? { ...game, status: newStatus } : game
        )
      );
      setSuccessMessage(`Estado del juego actualizado a: ${newStatus}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el estado del juego');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    clearMessages();
  };

  if (isLoading && games.length === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Cargando juegos..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Juegos
          </h1>
          <Button
            variant="primary"
            onClick={toggleCreateForm}
          >
            {showCreateForm ? 'Cancelar' : 'Crear nuevo juego'}
          </Button>
        </div>

        {error && (
          <Notification
            type="error"
            message={error}
            onClose={clearMessages}
          />
        )}

        {successMessage && (
          <Notification
            type="success"
            message={successMessage}
            onClose={clearMessages}
          />
        )}

        {showCreateForm && (
          <GameForm
            onSubmit={handleCreateGame}
            isLoading={isSubmitting}
            onCancel={toggleCreateForm}
          />
        )}

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o descripción..."
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
          
          <GameTable
            games={filteredGames}
            onViewItems={handleViewGameItems}
            onStatusChange={handleStatusChange}
            allGamesCount={games.length}
            onClearFilters={resetFilters}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GameManagementPage; 