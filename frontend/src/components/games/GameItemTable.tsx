import React from 'react';
import { GameItem } from '../../types/game.types';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

interface GameItemTableProps {
  items: GameItem[];
  onUpdateStock: (itemId: string, newStock: number) => Promise<void>;
  onStatusChange: (itemId: string, newStatus: 'active' | 'inactive' | 'archived') => Promise<void>;
  allItemsCount: number;
  onClearFilters?: () => void;
}

/**
 * Componente para mostrar la tabla de ítems de juegos
 */
const GameItemTable: React.FC<GameItemTableProps> = ({ 
  items, 
  onUpdateStock, 
  onStatusChange,
  allItemsCount,
  onClearFilters
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No hay ítems"
        description={
          allItemsCount === 0 
            ? 'No hay ítems configurados para este juego.'
            : 'No se encontraron ítems con los filtros aplicados.'
        }
        actionLabel={allItemsCount > 0 ? "Limpiar filtros" : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Código
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Comercializable
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                    {item.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {item.itemCode}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${item.type === 'currency' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : item.type === 'item'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      : item.type === 'service'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`
                }>
                  {item.type === 'currency' ? 'Moneda' : 
                   item.type === 'item' ? 'Ítem' : 
                   item.type === 'service' ? 'Servicio' : 'Otro'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {item.isTradable ? (
                  <span className="text-green-600 dark:text-green-400">Sí</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">No</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {item.managesStock ? (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.currentStock || 0}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const newStock = prompt('Ingrese el nuevo stock:', (item.currentStock || 0).toString());
                        if (newStock !== null) {
                          const stockNumber = parseInt(newStock);
                          if (!isNaN(stockNumber) && stockNumber >= 0) {
                            onUpdateStock(item._id, stockNumber);
                          }
                        }
                      }}
                    >
                      Actualizar
                    </Button>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">No gestiona</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${item.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : item.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`
                  }
                >
                  {item.status === 'active' ? 'Activo' : 
                   item.status === 'inactive' ? 'Inactivo' : 'Archivado'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item._id, e.target.value as 'active' | 'inactive' | 'archived')}
                  className="block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option disabled>Cambiar estado</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="archived">Archivado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameItemTable; 