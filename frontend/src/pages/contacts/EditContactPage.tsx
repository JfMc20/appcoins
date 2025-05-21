import type React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import ContactForm from '../../components/contacts/ContactForm'
import type { ContactUpdateData, ContactResponse, ContactFormData } from '../../types/contact.types' // ContactFormData podría necesitar ajuste o ser importada de ContactForm si se exporta desde allí
import contactService from '../../services/contact.service'
import { toast } from 'react-toastify'
import Pathnames from '../../router/pathnames'
import { Button } from '../../components/common'

const EditContactPage: React.FC = () => {
  const [initialFormData, setInitialFormData] = useState<ContactFormData | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true) // Para la carga inicial de datos
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { contactId } = useParams<{ contactId: string }>()

  useEffect(() => {
    if (!contactId) {
      toast.error('No se proporcionó un ID de contacto.')
      navigate(Pathnames.contacts.list)
      return
    }

    const fetchContact = async () => {
      setIsFetching(true)
      setError(null)
      try {
        const data: ContactResponse = await contactService.getContactById(contactId)
        // Adaptar los datos de ContactResponse a ContactFormData si es necesario.
        // Por ahora, asumimos una compatibilidad directa para los campos básicos.
        // Omitimos addresses y details por el momento, como en ContactForm.
        setInitialFormData({
          name: data.name,
          nickname: data.nickname,
          contactType: data.contactType,
          status: data.status,
          primaryEmail: data.primaryEmail,
          primaryPhone: data.primaryPhone,
          notes: data.notes,
          // No incluimos _id aquí, el formulario no lo necesita directamente en sus campos.
        })
      } catch (err: unknown) {
        console.error('Error fetching contact:', err)
        if (err instanceof Error) {
          const apiError = err.message || 'Error al cargar el contacto.'
          setError(apiError)
          toast.error(apiError)
        } else {
          setError('Error desconocido al cargar el contacto.')
          toast.error('Error desconocido al cargar el contacto.')
        }
        // Podríamos redirigir si el contacto no se encuentra (e.g., error 404)
        // navigate(Pathnames.contacts.list);
      } finally {
        setIsFetching(false)
      }
    }

    fetchContact()
  }, [contactId, navigate])

  const handleSubmit = async (data: ContactFormData) => {
    if (!contactId) return

    setIsLoading(true)
    setError(null)

    // Preparamos los datos para la actualización.
    // ContactUpdateData podría requerir todos los campos o solo los modificables.
    // Asumimos que ContactFormData es compatible con lo que espera updateContact.
    const updateData: ContactUpdateData = {
      ...data, // Esto incluye todos los campos del formulario
      // Si ContactUpdateData solo espera campos específicos, mapear aquí.
      // Por ahora, no se incluyen addresses y details.
    }

    try {
      await contactService.updateContact(contactId, updateData)
      toast.success(`Contacto "${data.name}" actualizado con éxito.`)
      navigate(Pathnames.contacts.list)
    } catch (err: unknown) {
      console.error('Error updating contact:', err)
      if (err instanceof Error) {
        const apiError = err.message || 'Error al actualizar el contacto.'
        setError(apiError)
        toast.error(apiError)
      } else {
        setError('Error desconocido al actualizar el contacto.')
        toast.error('Error desconocido al actualizar el contacto.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(Pathnames.contacts.list)
  }

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">Cargando datos del contacto...</p>
          {/* Aquí podría ir un spinner/loader más visual */}
        </div>
      </DashboardLayout>
    )
  }

  // Podríamos mostrar un error más prominente si initialFormData no se carga y no hay 'fetching'
  if (!initialFormData && !isFetching) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-red-500 dark:text-red-400">No se pudieron cargar los datos del contacto.</p>
          <Button onClick={() => navigate(Pathnames.contacts.list)} variant="primary" className="mt-4">
            Volver a la lista
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Editar Contacto</h1>
          {initialFormData && ( // Solo renderizar el formulario si tenemos datos
            <ContactForm
              onSubmit={handleSubmit}
              initialData={initialFormData}
              isLoading={isLoading}
              error={error}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EditContactPage
