import { useState, useEffect } from 'react';
import { GameItem } from '../types/game.types';

interface UseGameItemFiltersReturn {
  filteredItems: GameItem[];
  searchTerm: string;
  typeFilter: string;
  statusFilter: string;
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: string) => void;
  setStatusFilter: (status: string) => void;
  resetFilters: () => void;
}

/**
 * Hook para manejar los filtros de ítems de juegos
 */
export const useGameItemFilters = (items: GameItem[]): UseGameItemFiltersReturn => {
  const [filteredItems, setFilteredItems] = useState<GameItem[]>(items);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Efecto para filtrar ítems cuando cambian los criterios de filtrado
  useEffect(() => {
    let result = [...items];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.itemCode.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por tipo
    if (typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter);
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, typeFilter, statusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return {
    filteredItems,
    searchTerm,
    typeFilter,
    statusFilter,
    setSearchTerm,
    setTypeFilter,
    setStatusFilter,
    resetFilters
  };
};

export default useGameItemFilters; 