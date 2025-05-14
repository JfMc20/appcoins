import React from 'react';
import { LoadingSpinner } from './LoadingSpinner'; // Asumiendo que tienes este componente

export interface Column<T> {
  Header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string; // Para estilos adicionales por columna
  headerClassName?: string; // Para estilos adicionales por cabecera de columna
}

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  renderRowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey?: keyof T | ((row: T) => string | number); // Para la key de la fila, por defecto usa índice
}

const Table = <T extends object> ({
  columns,
  data,
  isLoading = false,
  emptyStateMessage = 'No hay datos para mostrar.',
  renderRowActions,
  onRowClick,
  rowKey,
}: TableProps<T>) => {

  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) {
      return typeof rowKey === 'function' ? rowKey(row) : row[rowKey] as string | number;
    }
    return index; // Fallback al índice si no se provee rowKey
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.headerClassName || ''}`}
              >
                {column.Header}
              </th>
            ))}
            {renderRowActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr 
              key={getRowKey(row, rowIndex)}
              className={`${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => {
                const value = typeof column.accessor === 'function'
                  ? column.accessor(row)
                  : row[column.accessor as keyof T];
                return (
                  <td 
                    key={colIndex} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${column.className || ''}`}
                  >
                    {value as React.ReactNode}
                  </td>
                );
              })}
              {renderRowActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {renderRowActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Table }; 