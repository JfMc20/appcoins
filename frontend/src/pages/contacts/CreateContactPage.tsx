import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import ContactForm from '../../components/contacts/ContactForm';
import { ContactCreateData } from '../../types/contact.types';
import contactService from '../../services/contact.service';
import { toast } from 'react-toastify';
import Pathnames from '../../router/pathnames'; // Asumimos que existe y tiene contacts.list

const CreateContactPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (data: Omit<ContactCreateData, 'addresses' | 'details'>) => {
        setIsLoading(true);
        setError(null);

        // Asegurarnos de que los campos opcionales vacíos se envíen como null o undefined
        // si el backend lo requiere, o simplemente omitirlos.
        // Aquí los dejamos como strings vacíos si no se rellenan.
        const createData: ContactCreateData = {
            ...data,
            addresses: [], // Placeholder, implementaríamos esto después
            details: [], // Placeholder
        };

        try {
            await contactService.createContact(createData);
            toast.success(`Contacto "${data.name}" creado con éxito.`);
            // Usar Pathnames.contacts.list cuando esté definido
            navigate('/contacts'); // Redirigir a la lista después de crear
        } catch (err: any) {
            console.error("Error creating contact:", err);
            const apiError = err.response?.data?.message || 'Error al crear el contacto.';
            setError(apiError);
            toast.error(apiError);
            setIsLoading(false);
        }
        // No ponemos setIsLoading(false) en el success porque ya hemos navegado
    };

    const handleCancel = () => {
        // Usar Pathnames.contacts.list cuando esté definido
        navigate('/contacts');
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        Crear Nuevo Contacto
                    </h1>
                    <ContactForm
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        error={error}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateContactPage; 