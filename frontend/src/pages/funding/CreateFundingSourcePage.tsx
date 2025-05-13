import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import FundingSourceForm from '../../components/funding/FundingSourceForm';
import { CreateFundingSourceData, UpdateFundingSourceData } from '../../types/fundingSource.types';
import fundingSourceService from '../../services/fundingSource.service';
import Pathnames from '../../router/pathnames';
import { toast } from 'react-toastify'; // Para notificaciones de éxito/error

const CreateFundingSourcePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: CreateFundingSourceData | UpdateFundingSourceData) => {
    if ('currentBalance' in data) {
      const createData = data as CreateFundingSourceData;
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        await fundingSourceService.createFundingSource(createData);
        toast.success('Fuente de fondos creada exitosamente!');
        navigate(Pathnames.funding.list); // Redirigir a la lista
      } catch (err: any) {
        console.error('Error creating funding source:', err);
        const apiError = err.response?.data?.message || err.message || 'Error al crear la fuente de fondos.';
        setErrorMessage(apiError);
        toast.error(apiError);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('Se intentó actualizar una fuente desde la página de creación');
      setErrorMessage('Operación no válida en esta página.');
      toast.error('Operación no válida.');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Crear Nueva Fuente de Fondos
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <FundingSourceForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            errorMessage={errorMessage}
            onCancel={() => navigate(Pathnames.funding.list)} // Botón para volver a la lista
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateFundingSourcePage; 