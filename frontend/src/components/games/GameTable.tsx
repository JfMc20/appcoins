import React from 'react';
import { Game } from '../../types/game.types';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

interface GameTableProps {
  games: Game[];
  onViewItems: (gameId: string) => void;
  onEdit: (game: Game) => void;
  onArchiveRequest?: (gameId: string) => void;
  onRestoreRequest?: (gameId: string) => void;
  onPermanentDeleteRequest?: (gameId: string) => void;
  showArchived?: boolean;
  allGamesCount: number;
  onClearFilters?: () => void;
}

/**
 * Componente para mostrar la tabla de juegos
 */
const GameTable: React.FC<GameTableProps> = ({ 
  games, 
  onViewItems, 
  onEdit,
  onArchiveRequest,
  onRestoreRequest,
  onPermanentDeleteRequest,
  showArchived,
  allGamesCount,
  onClearFilters
}) => {
  if (games.length === 0) {
    return (
      <EmptyState
        title="No hay juegos"
        description={
          allGamesCount === 0 
            ? 'No hay juegos configurados en el sistema.'
            : 'No se encontraron juegos con los filtros aplicados.'
        }
        actionLabel={allGamesCount > 0 ? "Limpiar filtros" : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {games.map((game) => (
            <tr key={game._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {game.name}
                {game.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                    {game.description}
                  </p>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {game.shortName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${game.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : game.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`
                  }
                >
                  {game.status === 'active' ? 'Activo' : 
                   game.status === 'inactive' ? 'Inactivo' : 'Archivado'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onViewItems(game._id)}
                  >
                    Ver Ítems
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(game)}
                  >
                    Editar
                  </Button>
                  
                  {showArchived ? (
                    <>
                      {onRestoreRequest && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onRestoreRequest(game._id)}
                        >
                          Restaurar
                        </Button>
                      )}
                      {onPermanentDeleteRequest && (
                        <Button
                          variant="danger" 
                          size="sm"
                          onClick={() => onPermanentDeleteRequest(game._id)}
                          className="ml-2"
                        >
                          Eliminar Definitivamente
                        </Button>
                      )}
                    </>
                  ) : (
                    onArchiveRequest && game.status !== 'archived' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onArchiveRequest(game._id)}
                      >
                        Archivar
                      </Button>
                    )
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameTable; 