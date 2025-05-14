import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ContactCreateData, ContactUpdateData, ContactFormData } from '../../types/contact.types'; // Asegúrate que estos tipos existen y ContactFormData se importa
import { Input, Button, Notification } from '../common'; // Necesitaremos estos componentes comunes

// Asumiendo que tenemos estas constantes definidas en alguna parte, similar a ContactsListPage
// Si no, las definiremos aquí o las importaremos.
const CONTACT_TYPES = [
    { value: 'client', label: 'Cliente' },
    { value: 'provider', label: 'Proveedor' },
    { value: 'other', label: 'Otro' },
];

const CONTACT_STATUSES = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'potential', label: 'Potencial' },
    { value: 'blocked', label: 'Bloqueado' },
];

// Usaremos una unión para los datos, ya que el ID es opcional (presente en update, ausente en create)
// type ContactFormData = Omit<ContactCreateData, 'addresses' | 'details'> & Partial<Omit<ContactUpdateData, 'addresses' | 'details'>>;
// La definición de ContactFormData se ha movido a contact.types.ts

interface ContactFormProps {
    onSubmit: SubmitHandler<ContactFormData>;
    initialData?: ContactFormData; // Para editar
    isLoading?: boolean;
    error?: string | null;
    onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
    error,
    onCancel,
}) => {
    const { register, handleSubmit, formState: { errors }, reset, setError: setFormError } = useForm<ContactFormData>({
        defaultValues: initialData || {
            name: '',
            nickname: '',
            contactType: 'client', // Valor por defecto
            status: 'active', // Valor por defecto
            primaryEmail: '',
            primaryPhone: '',
            notes: '',
        },
    });

    React.useEffect(() => {
        // Resetear el formulario si initialData cambia (útil para editar)
        reset(initialData || {
            name: '',
            nickname: '',
            contactType: 'client',
            status: 'active',
            primaryEmail: '',
            primaryPhone: '',
            notes: '',
        });
    }, [initialData, reset]);

    const handleClearError = () => {
       // Si el error viene de una prop externa (como fallo de API)
       // necesitaríamos una función para limpiarlo en el padre.
       // Por ahora, asumimos que Notification gestiona su propio cierre
       // visualmente, pero si queremos limpiar el estado `error` de la prop,
       // necesitaríamos una prop `onErrorClear` o similar.
       // Para simplificar, añadimos un onClose vacío al Notification.
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <Notification type="error" message={error} onClose={handleClearError} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Nombre (Requerido) --- */}
                <Input
                    label="Nombre Completo o Razón Social"
                    id="name"
                    {...register('name', { required: 'El nombre es obligatorio' })}
                    error={errors.name?.message}
                    placeholder="Ej: Juan Pérez S.L."
                />

                {/* --- Apodo --- */}
                <Input
                    label="Apodo / Nombre Corto"
                    id="nickname"
                    {...register('nickname')}
                    error={errors.nickname?.message}
                    placeholder="Ej: Juanito"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Tipo de Contacto (Requerido) --- */}
                <div>
                    <label htmlFor="contactType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Contacto
                    </label>
                    <select
                        id="contactType"
                        {...register('contactType', { required: 'El tipo es obligatorio' })}
                        className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${errors.contactType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white`}
                    >
                        {CONTACT_TYPES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors.contactType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactType.message}</p>}
                </div>

                {/* --- Estado (Requerido) --- */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estado
                    </label>
                    <select
                        id="status"
                        {...register('status', { required: 'El estado es obligatorio' })}
                         className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${errors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white`}
                   >
                        {CONTACT_STATUSES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>}
                 </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* --- Email Principal --- */}
                <Input
                    label="Email Principal"
                    id="primaryEmail"
                    type="email"
                    {...register('primaryEmail', {
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Dirección de email inválida'
                        }
                    })}
                    error={errors.primaryEmail?.message}
                    placeholder="ejemplo@dominio.com"
                />

                 {/* --- Teléfono Principal --- */}
                <Input
                    label="Teléfono Principal"
                    id="primaryPhone"
                    {...register('primaryPhone')}
                    error={errors.primaryPhone?.message}
                    placeholder="+34 600 123 456"
                />
            </div>

            {/* --- Notas --- */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notas Internas
                </label>
                <textarea
                    id="notes"
                    {...register('notes')}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                    placeholder="Cualquier información adicional relevante..."
                 />
            </div>


            {/* --- Botones de Acción --- */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                    {initialData ? 'Guardar Cambios' : 'Crear Contacto'}
                </Button>
            </div>
        </form>
    );
};

export default ContactForm; 