import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { Button, Input, Notification } from '../../components/common'; // Suponiendo que Input también está en common
import { useAuth } from '../../contexts/AuthContext';
import fundingSourceService from '../../services/fundingSource.service';
import transactionService from '../../services/transaction.service';
import { FundingSource } from '../../types/fundingSource.types';
import { CreateTransactionData, TransactionType, CapitalDeclarationEntry } from '../../types/transaction.types';
import { toast } from 'react-toastify';
import Pathnames from '../../router/pathnames';

const NewTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Para obtener el operatorUserId si es necesario directamente, o info del usuario

  // Estados del formulario
  const transactionTypeFixed: TransactionType = 'DECLARACION_OPERADOR_INICIO_DIA';
  const [fundingSourceId, setFundingSourceId] = useState<string>('');
  const [declaredBalance, setDeclaredBalance] = useState<string>(''); // Usar string para el input, convertir a número al enviar
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]); // Fecha actual por defecto YYYY-MM-DD
  const [notes, setNotes] = useState<string>('');
  
  // Estados para datos y UI
  const [operatorFundingSources, setOperatorFundingSources] = useState<FundingSource[]>([]);
  const [selectedFundingSource, setSelectedFundingSource] = useState<FundingSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSources, setIsFetchingSources] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar fuentes de fondos activas del operador
  useEffect(() => {
    const fetchSources = async () => {
      setIsFetchingSources(true);
      try {
        const sources = await fundingSourceService.getActiveFundingSources();
        setOperatorFundingSources(sources);
        if (sources.length > 0) {
          // Opcional: seleccionar la primera fuente por defecto
          // setFundingSourceId(sources[0]._id);
          // setSelectedFundingSource(sources[0]); 
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al cargar las fuentes de fondos activas.');
        setError('No se pudieron cargar las fuentes de fondos.');
      }
      setIsFetchingSources(false);
    };

    fetchSources();
  }, []);

  // Efecto para actualizar la moneda cuando cambia la fuente seleccionada
 useEffect(() => {
    if (fundingSourceId) {
      const source = operatorFundingSources.find(s => s._id === fundingSourceId);
      setSelectedFundingSource(source || null);
    } else {
      setSelectedFundingSource(null);
    }
  }, [fundingSourceId, operatorFundingSources]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast.error('Usuario no autenticado.');
      return;
    }
    if (!fundingSourceId || !selectedFundingSource) {
      toast.error('Por favor, selecciona una fuente de fondos.');
      return;
    }
    if (declaredBalance === '' || isNaN(parseFloat(declaredBalance))) {
      toast.error('Por favor, ingresa un saldo declarado válido.');
      return;
    }

    setIsLoading(true);

    const capitalDeclaration: CapitalDeclarationEntry[] = [
      {
        fundingSourceId: selectedFundingSource._id!,
        declaredBalance: parseFloat(declaredBalance),
        currency: selectedFundingSource.currency, // Moneda de la fuente seleccionada
        // previousBalance se calculará y guardará en el backend
      },
    ];

    const transactionData: CreateTransactionData = {
      type: transactionTypeFixed,
      transactionDate: new Date(transactionDate), // Convertir string a Date
      capitalDeclaration: capitalDeclaration,
      notes: notes.trim() || undefined, // Enviar undefined si está vacío
      status: 'completed', // Como se define en el backend para este tipo
    };

    try {
      await transactionService.createTransaction(transactionData);
      toast.success('Declaración de inicio de día creada con éxito.');
      navigate(Pathnames.transactions.history); // O a donde sea apropiado
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      const apiError = err.response?.data?.message || 'Error al crear la transacción.';
      setError(apiError);
      toast.error(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingSources) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 text-center">
          <p>Cargando fuentes de fondos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Nueva Declaración de Inicio de Día
          </h1>
          
          {error && <Notification type="error" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fundingSourceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuente de Fondos
              </label>
              <select
                id="fundingSourceId"
                name="fundingSourceId"
                value={fundingSourceId}
                onChange={(e) => setFundingSourceId(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              >
                <option value="" disabled>Selecciona una fuente...</option>
                {operatorFundingSources.map(source => (
                  <option key={source._id} value={source._id!}>
                    {source.name} ({source.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="declaredBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Saldo Declarado {selectedFundingSource ? `(${selectedFundingSource.currency})` : ''}
              </label>
              <Input
                type="number"
                id="declaredBalance"
                name="declaredBalance"
                value={declaredBalance}
                onChange={(e) => setDeclaredBalance(e.target.value)}
                placeholder="0.00"
                required
                step="any" // Permite decimales
                disabled={!selectedFundingSource} // Deshabilitar si no hay fuente seleccionada
              />
            </div>

            <div>
              <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Transacción
              </label>
              <Input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas (Opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="Notas adicionales sobre la declaración..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate(Pathnames.transactions.history || Pathnames.home)} // Navegar atrás
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || isFetchingSources || !selectedFundingSource}>
                Crear Declaración
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewTransactionPage; 