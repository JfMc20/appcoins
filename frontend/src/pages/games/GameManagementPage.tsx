import type React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import gameService from '../../services/game.service'
import type { Game, CreateGameData } from '../../types/game.types'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { LoadingSpinner, Notification, FilterBar } from '../../components/common'
import { GameTable, GameForm } from '../../components/games'
import { DashboardLayout } from '../../components/layout'
import useNotification from '../../hooks/useNotification'
import Modal from '../../components/common/Modal'
import { toast } from 'react-toastify'
import TibiaInitialSetup from '../../components/games/TibiaInitialSetup'

const GameManagementPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false)
  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [gameToArchive, setGameToArchive] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showArchivedBackend, setShowArchivedBackend] = useState<boolean>(false)
  const [showPermanentDeleteConfirmModal, setShowPermanentDeleteConfirmModal] = useState(false)
  const [gameToPermanentlyDelete, setGameToPermanentlyDelete] = useState<string | null>(null)
  const [showTibiaSetup, setShowTibiaSetup] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()
  const { error, setError, clearMessages } = useNotification()

  const fetchGames = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchStatus = showArchivedBackend ? 'archived' : 'active'
      console.log('[GameManagementPage] fetchGames - status para el servicio:', fetchStatus)
      const data = await gameService.getAllGames({ status: fetchStatus, search: searchTerm })
      setGames(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.message || 'Error al cargar juegos'
        setError(message)
        toast.error(message)
        console.error('Error al cargar juegos:', err)
      } else {
        const message = 'Error desconocido al cargar juegos'
        setError(message)
        toast.error(message)
        console.error('Error desconocido al cargar juegos:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [setError, showArchivedBackend, searchTerm])

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }

    fetchGames()
  }, [user, navigate, fetchGames])

  const handleCreateGame = () => {
    setCurrentGame(null)
    setShowCreateForm(true)
    clearMessages()
  }

  const handleEditGame = (game: Game) => {
    setCurrentGame(game)
    setShowCreateForm(true)
    clearMessages()
  }

  const handleFormSubmit = async (data: CreateGameData | Game) => {
    setIsSubmitting(true)
    setError(null)

    try {
      let savedGame: Game
      if ('_id' in data && data._id) {
        const { _id, ...updateData } = data
        savedGame = await gameService.updateGame(_id, updateData as Partial<Game>)
        toast.success('Juego actualizado con éxito')
        setGames((prevGames) => prevGames.map((g) => (g._id === savedGame._id ? savedGame : g)))
      } else {
        savedGame = await gameService.createGame(data as CreateGameData)
        toast.success('Juego creado con éxito')
        setGames((prevGames) => [...prevGames, savedGame])
      }
      setShowCreateForm(false)
      setCurrentGame(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.message || 'Error al guardar el juego'
        setError(message)
        toast.error(message)
        console.error('Error al guardar juego:', err)
      } else {
        const message = 'Error desconocido al guardar el juego'
        setError(message)
        toast.error(message)
        console.error('Error desconocido al guardar el juego:', err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewGameItems = (gameId: string) => {
    navigate(`/admin/games/${gameId}/items`)
  }

  const handleArchiveRequest = (gameId: string) => {
    setGameToArchive(gameId)
    setShowArchiveConfirmModal(true)
    clearMessages()
  }

  const confirmArchiveGame = async () => {
    if (gameToArchive) {
      setError(null)
      try {
        await gameService.updateGame(gameToArchive, { status: 'archived' })
        toast.success('Juego archivado con éxito')
        fetchGames()
      } catch (err: unknown) {
        if (err instanceof Error) {
          const message = err.message || 'Error al archivar el juego'
          setError(message)
          toast.error(message)
          console.error('Error al archivar juego:', err)
        } else {
          const message = 'Error desconocido al archivar el juego'
          setError(message)
          toast.error(message)
          console.error('Error desconocido al archivar juego:', err)
        }
      } finally {
        setGameToArchive(null)
        setShowArchiveConfirmModal(false)
      }
    }
  }

  const handleRestoreGame = async (gameId: string) => {
    setError(null)
    try {
      await gameService.updateGame(gameId, { status: 'active' })
      toast.success('Juego restaurado con éxito')
      fetchGames()
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.message || 'Error al restaurar el juego'
        setError(message)
        toast.error(message)
        console.error('Error al restaurar juego:', err)
      } else {
        const message = 'Error desconocido al restaurar el juego'
        setError(message)
        toast.error(message)
        console.error('Error desconocido al restaurar juego:', err)
      }
    }
  }

  const handlePermanentDeleteRequest = (gameId: string) => {
    setGameToPermanentlyDelete(gameId)
    setShowPermanentDeleteConfirmModal(true)
    clearMessages()
  }

  const confirmPermanentDeleteGame = async () => {
    if (gameToPermanentlyDelete) {
      setError(null)
      try {
        await gameService.permanentlyDeleteGameById(gameToPermanentlyDelete)
        toast.success('Juego eliminado permanentemente con éxito')
        fetchGames()
      } catch (err: unknown) {
        if (err instanceof Error) {
          const message = err.message || 'Error al eliminar permanentemente el juego'
          setError(message)
          toast.error(message)
          console.error('Error al eliminar permanentemente el juego:', err)
        } else {
          const message = 'Error desconocido al eliminar permanentemente el juego'
          setError(message)
          toast.error(message)
          console.error('Error desconocido al eliminar permanentemente el juego:', err)
        }
      } finally {
        setGameToPermanentlyDelete(null)
        setShowPermanentDeleteConfirmModal(false)
      }
    }
  }

  const closePermanentDeleteModal = () => {
    setGameToPermanentlyDelete(null)
    setShowPermanentDeleteConfirmModal(false)
  }

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm)
    setCurrentGame(null)
    clearMessages()
  }

  const toggleArchivedBackendView = () => {
    setShowArchivedBackend((prev) => !prev)
  }

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const nameMatch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
      const shortNameMatch = (game.shortName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      const clientStatusMatch = statusFilter === 'all' || game.status === statusFilter
      return (nameMatch || shortNameMatch) && clientStatusMatch
    })
  }, [games, searchTerm, statusFilter])

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Juegos</h1>
          <div className="space-x-4">
            <Button variant="secondary" onClick={() => setShowTibiaSetup(true)}>
              Configurar Tibia
            </Button>
            <Button variant="primary" onClick={handleCreateGame}>
              Crear nuevo juego
            </Button>
          </div>
        </div>

        {error && <Notification type="error" message={error} onClose={clearMessages} />}

        {showTibiaSetup && (
          <Modal
            isOpen={showTibiaSetup}
            onClose={() => setShowTibiaSetup(false)}
            title="Configuración de Tibia"
          >
            <TibiaInitialSetup />
          </Modal>
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
                { value: 'archived', label: 'Archivados' },
              ],
            },
          ]}
        />

        <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Juegos {showArchivedBackend ? 'Archivados' : 'Configurados'}
              {filteredGames.length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({filteredGames.length} {filteredGames.length === 1 ? 'juego' : 'juegos'})
                </span>
              )}
            </h2>
            <Button onClick={toggleArchivedBackendView} variant="outline">
              {showArchivedBackend ? 'Ver Activos/Inactivos' : 'Ver Archivados'}
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Cargando juegos..." />
          ) : (
            <GameTable
              games={filteredGames}
              onViewItems={handleViewGameItems}
              onEdit={handleEditGame}
              onArchiveRequest={handleArchiveRequest}
              onRestoreRequest={handleRestoreGame}
              onPermanentDeleteRequest={handlePermanentDeleteRequest}
              showArchived={showArchivedBackend}
              allGamesCount={games.length}
              onClearFilters={handleClearFilters}
            />
          )}
        </Card>

        <Modal
          isOpen={showArchiveConfirmModal}
          onClose={() => {
            setShowArchiveConfirmModal(false)
            setGameToArchive(null)
          }}
          title="Confirmar Archivado"
        >
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            ¿Estás seguro de que deseas archivar este juego? Podrás restaurarlo más tarde desde la vista de archivados.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowArchiveConfirmModal(false)
                setGameToArchive(null)
              }}
            >
              Cancelar
            </Button>
            <Button variant="secondary" onClick={confirmArchiveGame}>
              Archivar
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={showPermanentDeleteConfirmModal}
          onClose={closePermanentDeleteModal}
          title="Confirmar Eliminación Permanente"
        >
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ¿Estás <span className="font-semibold text-red-600 dark:text-red-400">ABSOLUTAMENTE SEGURO</span> de que
            deseas eliminar este juego permanentemente?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Esta acción <strong className="text-red-600 dark:text-red-500">NO</strong> se puede deshacer. Todos los
            datos asociados podrían perderse.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={closePermanentDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmPermanentDeleteGame}>
              Sí, Eliminar Permanentemente
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default GameManagementPage
