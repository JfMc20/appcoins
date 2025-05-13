import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { FundingSource } from '../../types/fundingSource.types';
import fundingSourceService from '../../services/fundingSource.service';
import { LoadingSpinner, Notification, Button } from '../../components/common';
import Pathnames from '../../router/pathnames';
import { toast } from 'react-toastify';

const FundingSourcesListPage: React.FC = () => {
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFundingSources = async () => {
      setLoading(true);
      setError(null);
      try {
        // Por ahora, obtenemos las activas. Podríamos añadir filtros más adelante.
        const sources = await fundingSourceService.getActiveFundingSources();
        setFundingSources(sources);
      } catch (err: any) {
        console.error('Error fetching funding sources:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar las fuentes de fondos');
      } finally {
        setLoading(false);
      }
    };

    fetchFundingSources();
  }, []);

  // Renombrar handler y cambiar mensajes de 'archivar' a 'eliminar'
  const handleDelete = async (id: string, name: string) => {
    // Confirmación simple (se puede mejorar con un modal)
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la fuente "${name}"?`)) {
      return;
    }

    setError(null);
    try {
      // La función del servicio sigue siendo deleteFundingSource, pero la acción lógica es "eliminar" para el usuario
      await fundingSourceService.deleteFundingSource(id); 
      toast.success(`Fuente "${name}" eliminada correctamente.`);
      // Actualizar el estado local filtrando la fuente eliminada
      setFundingSources(prevSources => prevSources.filter(source => source._id !== id));
    } catch (err: any) {
      console.error('Error deleting funding source:', err);
      const apiError = err.response?.data?.message || err.message || 'Error al eliminar la fuente de fondos.';
      setError(apiError);
      toast.error(apiError);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Fuentes de Fondos
          </h1>
          <Button 
            variant="primary"
            onClick={() => navigate(Pathnames.funding.new)}
          >
            Nueva Fuente
          </Button>
        </div>
        
        {loading && <LoadingSpinner message="Cargando fuentes de fondos..." />}
        
        {error && <Notification type="error" message={error} onClose={() => setError(null)} />}
        
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Aquí irá la tabla o lista de fuentes de fondos */}
            {fundingSources.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Moneda</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Saldo Actual</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {fundingSources.map((source) => {
                    // Log para depurar el valor y tipo de currentBalance
                    console.log('[FundingSourcesListPage] Source for table - Name:', source.name, 'Balance:', source.currentBalance, 'Type:', typeof source.currentBalance);
                    return (
                      <tr key={source._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{source.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{source.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{source.currency}</td>
                        {/* Añadir verificación de tipo antes de llamar a toFixed */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">
                          {typeof source.currentBalance === 'number' ? source.currentBalance.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            source.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            source.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' // archived
                          }`}>
                            {source.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Botón Editar */}
                          <button 
                            onClick={() => navigate(Pathnames.funding.edit.replace(':id', String(source._id)))}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3"
                          >
                            Editar
                          </button>
                          {/* Botón Eliminar (antes Archivar) */}
                          <button 
                            // Llamar al nuevo handler handleDelete
                            onClick={() => source._id && handleDelete(source._id, source.name)} 
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                            disabled={!source._id} // Deshabilitar si no hay ID (poco probable)
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-gray-500 dark:text-gray-400">No se encontraron fuentes de fondos activas.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FundingSourcesListPage; 