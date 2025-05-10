import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const TransactionHistoryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Historial de Transacciones</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-300">
            Aquí se mostrará el historial de transacciones.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionHistoryPage; 