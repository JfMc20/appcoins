import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    id: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
}

/**
 * Componente para la barra de filtros con búsqueda y filtros adicionales
 */
const FilterBar: React.FC<FilterBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder = "Buscar...",
  filters = [] 
}) => {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              id="search"
              className="focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {filters.map((filter) => (
          <div key={filter.id} className="w-full md:w-48">
            <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {filter.label}
            </label>
            <select
              id={filter.id}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar; 