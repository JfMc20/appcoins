import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NewTransactionPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Nueva Transacción</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Formulario para crear una nueva transacción.
          </p>
          
          {/* Formulario se implementará aquí */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Transacción
              </label>
              <select className="form-select w-full rounded-md border-gray-300 shadow-sm">
                <option>Seleccionar...</option>
                <option>Venta</option>
                <option>Compra</option>
                <option>Transferencia</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto
              </label>
              <input 
                type="number" 
                className="form-input w-full rounded-md border-gray-300 shadow-sm" 
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewTransactionPage; 