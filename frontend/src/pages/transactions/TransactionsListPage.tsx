import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, LoadingSpinner, Notification, Table, Column } from '../../components/common';
import transactionService from '../../services/transaction.service';
import { Transaction } from '../../types/transaction.types';
// import { IUser } from '../../types/user.types'; // Eliminada esta importación ya que no se usa directamente aquí
import Pathnames from '../../router/pathnames';
import { toast } from 'react-toastify';
import { format } from 'date-fns'; // Para formatear fechas
import { es } from 'date-fns/locale'; // Para formato de fecha en español

// Helper para obtener un texto descriptivo de la transacción para la tabla
const getTransactionDescription = (transaction: Transaction): string => {
  switch (transaction.type) {
    case 'DECLARACION_OPERADOR_INICIO_DIA':
      if (transaction.capitalDeclaration && transaction.capitalDeclaration.length > 0) {
        const decl = transaction.capitalDeclaration[0];
        return `Declaración: ${decl.declaredBalance.toFixed(2)} ${decl.currency} (Fuente ID: ${decl.fundingSourceId.slice(-6)})`;
      }
      return 'Declaración de Operador';
    case 'AJUSTE_ADMIN_CAPITAL':
      return 'Ajuste de Capital (Admin)';
    case 'DECLARACION_SALDO_INICIAL_CAPITAL':
        return 'Declaración Saldo Inicial Capital';
    // Añadir más casos a medida que se implementen otros tipos
    default:
      return transaction.notes || transaction.type;
  }
};

const TransactionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Puede ser configurable

  const fetchTransactions = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await transactionService.getAllTransactions(page, limit);
      setTransactions(response.data);
      if (response.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        setItemsPerPage(response.pagination.itemsPerPage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar transacciones';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Error fetching transactions:', err); // Asumiendo que tienes un logger global en frontend
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage, itemsPerPage);
  }, [fetchTransactions, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const columns: Column<Transaction>[] = [
    {
      Header: 'Fecha',
      accessor: (row) => format(new Date(row.transactionDate || row.createdAt), 'Pp', { locale: es }),
      headerClassName: 'w-1/6',
    },
    {
      Header: 'Tipo',
      accessor: 'type',
      headerClassName: 'w-1/6',
    },
    {
      Header: 'Descripción / Detalles',
      accessor: (row) => getTransactionDescription(row),
      headerClassName: 'w-2/6',
    },
    {
      Header: 'Operador ID', // Temporalmente el ID, idealmente sería el nombre
      accessor: 'operatorUserId',
      headerClassName: 'w-1/6',
    },
    {
      Header: 'Estado',
      accessor: 'status',
      headerClassName: 'w-1/6',
    },
  ];

  // TODO: Implementar renderRowActions para ver detalles, si es necesario

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Historial de Transacciones</h1>
          <Button 
            variant="primary"
            onClick={() => navigate(Pathnames.transactions.new || '/transactions/new')} // Fallback por si Pathnames no está completo
          >
            Nueva Transacción
          </Button>
        </div>

        {error && <Notification type="error" message={error} onClose={() => setError(null)} />}

        <Table<Transaction>
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          emptyStateMessage="No se encontraron transacciones."
          rowKey="_id" // Asumiendo que las transacciones tienen un _id
          // renderRowActions={(row) => (
          //   <Button variant="secondary" size="sm" onClick={() => navigate(`/transactions/${row._id}`)}>
          //     Ver
          //   </Button>
          // )}
        />

        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <Button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1 || isLoading}
              variant="secondary"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages} (Total: {totalItems} transacciones)
            </span>
            <Button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages || isLoading}
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsListPage;

// Asumiendo un logger global simple si no existe uno más complejo
const logger = {
    error: (...args: any[]) => console.error(...args),
    warn: (...args: any[]) => console.warn(...args),
    info: (...args: any[]) => console.info(...args),
}; 