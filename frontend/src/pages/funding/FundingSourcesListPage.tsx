import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { FundingSource } from '../../types/fundingSource.types';
import fundingSourceService from '../../services/fundingSource.service';
import { LoadingSpinner, Notification, Button } from '../../components/common';
import Pathnames from '../../router/pathnames';
import { toast } from 'react-toastify';

const FundingSourcesListPage: React.FC = () => {
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  const fetchFundingSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let sources;
      if (showArchived) {
        sources = await fundingSourceService.getArchivedFundingSources();
      } else {
        sources = await fundingSourceService.getActiveFundingSources();
      }
      setFundingSources(sources);
    } catch (err: any) {
      console.error('Error fetching funding sources:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar las fuentes de fondos');
      setFundingSources([]);
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchFundingSources();
  }, [fetchFundingSources]);

  const handleCreateNew = () => {
    navigate(Pathnames.funding.new);
  };

  const handleEdit = (id: string) => {
    navigate(Pathnames.funding.edit.replace(':id', id));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea archivar esta fuente de fondos?')) {
      try {
        await fundingSourceService.deleteFundingSource(id);
        toast.success('Fuente archivada correctamente.');
        fetchFundingSources();
      } catch (err: any) {
        console.error('Error archivando fuente de fondos:', err);
        const apiError = err.response?.data?.message || err.message || 'Error al archivar la fuente de fondos.';
        setError(apiError);
        toast.error(apiError);
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea ELIMINAR PERMANENTEMENTE esta fuente de fondos? Esta acción no se puede deshacer.')) {
      try {
        await fundingSourceService.permanentlyDeleteFundingSourceById(id);
        toast.success('Fuente eliminada permanentemente.');
        fetchFundingSources(); // Actualizar la lista
      } catch (err: any) {
        console.error('Error eliminando permanentemente la fuente de fondos:', err);
        const apiError = err.response?.data?.message || err.message || 'Error al eliminar permanentemente la fuente de fondos.';
        setError(apiError);
        toast.error(apiError);
      }
    }
  };

  const toggleShowArchived = () => {
    setShowArchived(!showArchived);
  };

  const columns = [
    { Header: 'Nombre', accessor: 'name' },
    { Header: 'Tipo', accessor: 'type', Cell: ({ value }: { value: string }) => fundingSourceService.getFundingSourceTypeDisplay(value) },
    { Header: 'Moneda', accessor: 'currency' },
    { Header: 'Saldo Actual', accessor: 'currentBalance', Cell: ({ value }: { value: number }) => value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A' },
    { Header: 'Estado', accessor: 'status', Cell: ({ value }: { value: string }) => fundingSourceService.getFundingSourceStatusDisplay(value) },
    {
      Header: 'Acciones',
      accessor: '_id',
      Cell: ({ value: id, row }: { value:string, row: { original: FundingSource } }) => (
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleEdit(String(id))} className="p-2">
            Editar
          </Button>
          {!showArchived && row.original.status !== 'archived' && (
            <Button variant="danger" onClick={() => handleDelete(String(id))} className="p-2">
              Archivar
            </Button>
          )}
          {showArchived && row.original.status === 'archived' && (
            <Button variant="outline" onClick={() => console.log('Desarchivar ID:', String(id))} className="p-2">
              Restaurar
            </Button>
          )}
          {showArchived && row.original.status === 'archived' && (
            <Button variant="danger" onClick={() => handlePermanentDelete(String(id))} className="p-2 ml-2">
              Eliminar Definitivamente
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {showArchived ? 'Fuentes de Fondos Archivadas' : 'Fuentes de Fondos Activas'}
          </h1>
          <div className="flex space-x-2">
            <Button onClick={toggleShowArchived} variant="outline">
              {showArchived ? <>Ver Activas</> : <>Ver Archivadas</>}
            </Button>
            <Button onClick={handleCreateNew} variant="primary">
              Nueva Fuente
            </Button>
          </div>
        </div>
        
        {error && <Notification type="error" message={error} onClose={() => setError(null)} />}
        
        {isLoading ? (
          <LoadingSpinner message="Cargando fuentes de fondos..." />
        ) : (
          <>
            {fundingSources.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
                No se encontraron fuentes de fondos {showArchived ? 'archivadas' : 'activas'}.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.Header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {column.Header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {fundingSources.map((source) => (
                      <tr key={source._id}>
                        {columns.map((column) => {
                          let content: React.ReactNode;
                          const accessor = column.accessor;

                          if (column.Cell) {
                            // Si column.Cell está definido, llamarlo con el valor apropiado y tipado.
                            if (accessor === 'type' || accessor === 'status') {
                              content = (column.Cell as (props: { value: string; row: { original: FundingSource } }) => React.ReactNode)(
                                { value: source[accessor], row: { original: source } }
                              );
                            } else if (accessor === 'currentBalance') {
                              content = (column.Cell as (props: { value: number; row: { original: FundingSource } }) => React.ReactNode)(
                                { value: source[accessor], row: { original: source } }
                              );
                            } else if (accessor === '_id') {
                              // Aseguramos que _id es un string para la Cell, aunque sea opcional en el tipo.
                              // Las acciones usualmente no tienen sentido sin un ID.
                              // Si source._id pudiera ser undefined aquí y eso es un estado válido para mostrar,
                              // la Cell de Acciones debería manejarlo o no mostrar nada.
                              content = (column.Cell as (props: { value: string; row: { original: FundingSource } }) => React.ReactNode)(
                                { value: source._id || '', row: { original: source } } // Pasamos string vacío si _id es undefined
                              );
                            } else {
                              // Fallback para una columna inesperada con Cell. Esto no debería ocurrir con la configuración actual.
                              const unexpectedRawValue = source[accessor as keyof FundingSource];
                              content = String(unexpectedRawValue != null ? unexpectedRawValue : '');
                            }
                          } else {
                            // No hay column.Cell. Obtener el valor crudo y formatear si es necesario.
                            const rawValue = source[accessor as keyof Omit<FundingSource, '_id'>];

                            if (rawValue instanceof Date) {
                              content = rawValue.toLocaleDateString(); // Formatear Fecha a string
                            } else if (typeof rawValue === 'boolean') {
                              content = rawValue ? 'Sí' : 'No'; // Ejemplo para booleanos
                            } else if (typeof rawValue === 'object' && rawValue !== null) {
                              content = JSON.stringify(rawValue); // Para otros objetos
                            } else if (rawValue === undefined || rawValue === null) {
                              content = ''; // O 'N/A' para valores nulos/indefinidos
                            } else {
                              content = rawValue; // string, number
                            }
                          }
                          
                          return (
                            <td
                              key={`${source._id}-${column.Header}`}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                            >
                              {content}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FundingSourcesListPage; 