import { useState, useEffect } from 'react'
import type { Game } from '../types/game.types'

interface UseGameFiltersReturn {
  filteredGames: Game[]
  searchTerm: string
  statusFilter: string
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: string) => void
  resetFilters: () => void
}

/**
 * Hook para manejar los filtros de juegos
 */
export const useGameFilters = (games: Game[]): UseGameFiltersReturn => {
  const [filteredGames, setFilteredGames] = useState<Game[]>(games)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Efecto para filtrar juegos cuando cambian los criterios de filtrado
  useEffect(() => {
    let result = [...games]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (game) =>
          game.name.toLowerCase().includes(searchLower) ||
          (game.shortName ? game.shortName.toLowerCase().includes(searchLower) : false) ||
          (game.description && game.description.toLowerCase().includes(searchLower)),
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      result = result.filter((game) => game.status === statusFilter)
    }

    setFilteredGames(result)
  }, [games, searchTerm, statusFilter])

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  return {
    filteredGames,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    resetFilters,
  }
}

export default useGameFilters
