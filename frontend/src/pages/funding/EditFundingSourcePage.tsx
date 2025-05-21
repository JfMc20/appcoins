import type React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import FundingSourceForm from '../../components/funding/FundingSourceForm'
import type { FundingSource, UpdateFundingSourceData } from '../../types/fundingSource.types'
import fundingSourceService from '../../services/fundingSource.service'
import Pathnames from '../../router/pathnames'
import { LoadingSpinner, Notification } from '../../components/common'
import { toast } from 'react-toastify'

const EditFundingSourcePage: React.FC = () => {
  const { id } = useParams<{ id: string }>() // Obtener el ID de la URL
  const navigate = useNavigate()
  const [fundingSource, setFundingSource] = useState<FundingSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchFundingSource = async () => {
      if (!id) {
        setErrorMessage('ID de fuente de fondos no encontrado en la URL.')
        setLoading(false)
        toast.error('ID inválido.')
        navigate(Pathnames.funding.list) // Redirigir si no hay ID
        return
      }
      setLoading(true)
      setErrorMessage(null)
      try {
        const data = await fundingSourceService.getFundingSourceById(id)
        setFundingSource(data)
      } catch (err: unknown) {
        console.error('Error fetching funding source for edit:', err)
        if (err instanceof Error) {
          const apiError = err.message || 'Error al cargar los datos de la fuente de fondos.'
          setErrorMessage(apiError)
          toast.error(apiError)
        } else {
          const apiError = 'Error desconocido al cargar los datos de la fuente de fondos.'
          setErrorMessage(apiError)
          toast.error(apiError)
        }
        // Opcional: redirigir si no se encuentra o hay error
        // navigate(Pathnames.funding.list);
      } finally {
        setLoading(false)
      }
    }

    fetchFundingSource()
  }, [id, navigate])

  const handleSubmit = async (data: UpdateFundingSourceData) => {
    if (!id) {
      toast.error('No se puede actualizar sin un ID válido.')
      return
    }
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      // Asegúrate de que la función update exista en el servicio y acepte el ID y los datos
      await fundingSourceService.updateFundingSource(id, data)
      toast.success('Fuente de fondos actualizada exitosamente!')
      navigate(Pathnames.funding.list) // Redirigir a la lista
    } catch (err: unknown) {
      console.error('Error updating funding source:', err)
      if (err instanceof Error) {
        const apiError = err.message || 'Error al actualizar la fuente de fondos.'
        setErrorMessage(apiError)
        toast.error(apiError)
      } else {
        const apiError = 'Error desconocido al actualizar la fuente de fondos.'
        setErrorMessage(apiError)
        toast.error(apiError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Cargando datos de la fuente de fondos..." />
      </DashboardLayout>
    )
  }

  // Mostrar error persistente si ocurrió al cargar
  if (errorMessage && !fundingSource) {
    return (
      <DashboardLayout>
        <Notification type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      </DashboardLayout>
    )
  }

  if (!fundingSource) {
    // Si fundingSource sigue siendo null después de cargar y sin error, algo raro pasó
    return (
      <DashboardLayout>
        <p>No se pudo cargar la fuente de fondos.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Editar Fuente de Fondos: {fundingSource?.name}
        </h1>
        {/* Pasar el mensaje de error de submit al formulario */}
        {errorMessage && <Notification type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-4">
          <FundingSourceForm
            initialData={fundingSource} // Pasar los datos iniciales
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            // errorMessage={errorMessage} // El mensaje de error se muestra arriba
            onCancel={() => navigate(Pathnames.funding.list)}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EditFundingSourcePage
