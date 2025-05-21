import type React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import type { Contact, GetContactsParams, PaginatedContactsResponse } from '../../types/contact.types'
import contactService from '../../services/contact.service'
import { LoadingSpinner, Notification, Button } from '../../components/common'
// Asumiremos que existe un componente Paginator o creamos botones simples
// import Paginator from '../../components/common/Paginator';
import Pathnames from '../../router/pathnames' // Lo añadiremos después
import { toast } from 'react-toastify'
import { debounce } from 'lodash' // Para evitar llamadas API excesivas al buscar

const CONTACT_TYPES = [
  { value: '', label: 'Todos los Tipos' },
  { value: 'client', label: 'Cliente' },
  { value: 'provider', label: 'Proveedor' },
  { value: 'other', label: 'Otro' },
]

const CONTACT_STATUSES = [
  { value: '', label: 'Todos los Estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'potential', label: 'Potencial' },
  { value: 'blocked', label: 'Bloqueado' },
]

const ContactsListPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20, // Coincidir con el límite por defecto del backend
  })
  const [filters, setFilters] = useState<Omit<GetContactsParams, 'page' | 'limit'>>({
    search: '',
    contactType: '',
    status: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // --- Fetching Data ---
  const fetchContacts = useCallback(async (params: GetContactsParams) => {
    setLoading(true)
    setError(null)
    try {
      const response: PaginatedContactsResponse = await contactService.getAllContacts(params)
      setContacts(response.data)
      setPagination(response.pagination)
    } catch (err: unknown) {
      console.error('Error fetching contacts:', err)
      if (err instanceof Error) {
        const apiError = err.message || 'Error al cargar los contactos'
        setError(apiError)
        toast.error(apiError)
      } else {
        setError('Error desconocido al cargar los contactos')
        toast.error('Error desconocido al cargar los contactos')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce para la búsqueda
  const debouncedFetch = useMemo(
    () => debounce((params: GetContactsParams) => fetchContacts(params), 500),
    [fetchContacts]
  )

  // useEffect para cargar datos cuando cambian los filtros o la página
  useEffect(() => {
    const params: GetContactsParams = {
      ...filters,
      page: currentPage,
      limit: pagination.itemsPerPage,
    }
    // Usar debounce solo para la búsqueda para evitar llamadas API en cada tecla
    if (filters.search) {
      debouncedFetch(params)
    } else {
      fetchContacts(params)
    }
    // Cancelar debounce si el componente se desmonta
    return () => debouncedFetch.cancel()
  }, [filters, currentPage, pagination.itemsPerPage, fetchContacts, debouncedFetch])

  // --- Handlers ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Resetear a la primera página al cambiar filtros
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al contacto "${name}"?`)) {
      return
    }
    setError(null)
    try {
      await contactService.deleteContact(id)
      toast.success(`Contacto "${name}" eliminado.`)
      // Refrescar lista volviendo a llamar a fetchContacts con los params actuales
      fetchContacts({ ...filters, page: currentPage, limit: pagination.itemsPerPage })
    } catch (err: unknown) {
      console.error('Error deleting contact:', err)
      if (err instanceof Error) {
        const apiError = err.message || 'Error al eliminar el contacto.'
        setError(apiError)
        toast.error(apiError)
      } else {
        setError('Error desconocido al eliminar el contacto')
        toast.error('Error desconocido al eliminar el contacto')
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Contactos</h1>
          <Button variant="primary" onClick={() => navigate(Pathnames.contacts.new)}>
            Nuevo Contacto
          </Button>
        </div>

        {/* --- Filtros --- */}
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Buscar por nombre, email, etc."
              value={filters.search}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            />
            <select
              name="contactType"
              value={filters.contactType}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            >
              {CONTACT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            >
              {CONTACT_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Loading / Error --- */}
        {loading && <LoadingSpinner message="Cargando contactos..." />}
        {error && <Notification type="error" message={error} onClose={() => setError(null)} />}

        {/* --- Tabla de Contactos --- */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            {contacts.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Nombre
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Tipo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Email P.
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Teléfono P.
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {contact.name} {contact.nickname && `(${contact.nickname})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {CONTACT_TYPES.find((t) => t.value === contact.contactType)?.label || contact.contactType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {contact.primaryEmail || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {contact.primaryPhone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contact.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : contact.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              : contact.status === 'potential'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' // blocked
                          }`}
                        >
                          {CONTACT_STATUSES.find((s) => s.value === contact.status)?.label || contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => navigate(Pathnames.contacts.edit.replace(':contactId', contact._id))}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3"
                        >
                          Editar
                        </button>
                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleDelete(contact._id, contact.name)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-gray-500 dark:text-gray-400">
                No se encontraron contactos con los filtros actuales.
              </p>
            )}
          </div>
        )}

        {/* --- Paginación --- */}
        {!loading && !error && contacts.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
              {pagination.totalItems} contactos
            </span>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ContactsListPage
