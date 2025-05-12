import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import gameService from '../../../services/game.service';
import { Game, GameItem, CreateGameItemData } from '../../../types/game.types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { 
  LoadingSpinner, 
  Notification, 
  FilterBar
} from '../../../components/common';
import { 
  GameItemTable, 
  GameItemForm 
} from '../../../components/games';
import { DashboardLayout } from '../../../components/layout';
import useNotification from '../../../hooks/useNotification';
import useGameItemFilters from '../../../hooks/useGameItemFilters';

const GameItemsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { error, successMessage, setError, setSuccessMessage, clearMessages } = useNotification();
  const { 
    filteredItems, 
    searchTerm, 
    typeFilter, 
    statusFilter, 
    setSearchTerm, 
    setTypeFilter, 
    setStatusFilter, 
    resetFilters 
  } = useGameItemFilters(gameItems);

  // Cargar juego y sus ítems al montar el componente
  const fetchGameAndItems = useCallback(async () => {
    if (!gameId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Obtener información del juego
      const gameData = await gameService.getGameById(gameId);
      setGame(gameData);

      // Obtener ítems del juego
      const itemsData = await gameService.getGameItems({ gameId });
      setGameItems(itemsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar información del juego');
      console.error('Error al cargar información del juego:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, setError]);

  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirigir a la página principal si no es administrador
      return;
    }

    if (!gameId) {
      navigate('/admin/games');
      return;
    }

    fetchGameAndItems();
  }, [user, navigate, gameId, fetchGameAndItems]);

  const handleCreateGameItem = async (itemData: CreateGameItemData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newItem = await gameService.createGameItem(itemData);
      setGameItems(prevItems => [...prevItems, newItem]);
      setSuccessMessage(`¡Ítem ${newItem.name} creado con éxito!`);
      
      // Cerrar el formulario
      setShowCreateForm(false);
      
      // Recargar la lista de ítems
      fetchGameAndItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear ítem');
      console.error('Error al crear ítem:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItemStock = async (itemId: string, newStock: number) => {
    try {
      await gameService.updateGameItemStock(itemId, newStock);
      setGameItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, currentStock: newStock } : item
        )
      );
      setSuccessMessage('Stock actualizado con éxito.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar stock');
      console.error('Error al actualizar stock:', err);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, newStatus: 'active' | 'inactive' | 'archived') => {
    setIsLoading(true);
    setError(null);
    try {
      await gameService.updateGameItem(itemId, { status: newStatus });
      setGameItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, status: newStatus } : item
        )
      );
      setSuccessMessage(`Estado del ítem actualizado a: ${newStatus}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el estado del ítem');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    clearMessages();
  };

  if (isLoading && !game) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Cargando información del juego..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button 
              onClick={() => navigate('/admin/games')}
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver a Juegos
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ítems de {game?.name}
            </h1>
            <div className="flex items-center mt-1">
              <p className="text-gray-600 dark:text-gray-400">
                Código: {game?.shortName}
              </p>
              <span className="mx-2">•</span>
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${game?.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : game?.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`
                }
              >
                {game?.status === 'active' ? 'Activo' : 
                 game?.status === 'inactive' ? 'Inactivo' : 'Archivado'}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={toggleCreateForm}
          >
            {showCreateForm ? 'Cancelar' : 'Crear nuevo ítem'}
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

        {showCreateForm && gameId && (
          <GameItemForm
            onSubmit={handleCreateGameItem}
            isLoading={isSubmitting}
            onCancel={toggleCreateForm}
            gameId={gameId}
          />
        )}

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o código..."
          filters={[
            {
              id: 'typeFilter',
              label: 'Filtrar por Tipo',
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { value: 'all', label: 'Todos' },
                { value: 'currency', label: 'Monedas' },
                { value: 'item', label: 'Ítems' },
                { value: 'service', label: 'Servicios' },
                { value: 'other', label: 'Otros' }
              ]
            },
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
            Ítems Configurados {filteredItems.length > 0 && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({filteredItems.length} {filteredItems.length === 1 ? 'ítem' : 'ítems'})</span>}
          </h2>
          
          <GameItemTable
            items={filteredItems}
            onUpdateStock={handleUpdateItemStock}
            onStatusChange={handleUpdateItemStatus}
            allItemsCount={gameItems.length}
            onClearFilters={resetFilters}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GameItemsPage; 