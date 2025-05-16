import React, { useState, useEffect, FormEvent, useCallback } from 'react';
// Price ya no se usa directamente para initialData si PriceFormData es suficiente
// import { Price } from '../../types/price.types'; 
import { PriceFormData as ExternalPriceFormData } from '../../types/price.types'; // Renombrar para evitar colisión
import { Input, Button } from '../common';

// Eliminar la definición local de PriceFormData
/*
export interface PriceFormData {
  priceType: string;
  currency: string;
  value: number | string; 
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  region?: string;
  notes?: string;
}
*/

// Interfaz local para el estado del formulario, donde 'value' puede ser string
interface PriceFormState extends Omit<ExternalPriceFormData, 'value'> {
  value: string; // Permitir string para el input
}

interface PriceFormProps {
  initialData?: ExternalPriceFormData | null; 
  onSubmit: (data: ExternalPriceFormData) => Promise<void>; // onSubmit espera el tipo externo con value: number
  onCancel: () => void;
  isLoading?: boolean;
}

const PriceForm: React.FC<PriceFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => {

  const getInitialFormState = useCallback((): PriceFormState => {
    const defaults: PriceFormState = {
      _id: undefined,
      priceType: '',
      currency: 'USDT',
      value: '', // value es string aquí
      isActive: true,
      validFrom: '',
      validTo: '',
      region: '',
      notes: ''
    };
    if (initialData) {
      return {
        _id: initialData._id,
        priceType: initialData.priceType || '',
        currency: initialData.currency || 'USDT',
        value: typeof initialData.value === 'number' ? String(initialData.value) : '', // Convertir número a string
        isActive: typeof initialData.isActive === 'boolean' ? initialData.isActive : true,
        validFrom: initialData.validFrom || '',
        validTo: initialData.validTo || '',
        region: initialData.region || '',
        notes: initialData.notes || ''
      };
    }
    return defaults;
  }, [initialData]); // Dependencia de useCallback

  const [formState, setFormState] = useState<PriceFormState>(getInitialFormState);

  useEffect(() => {
    setFormState(getInitialFormState());
  }, [getInitialFormState]); // Usar la función memoizada como dependencia

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormState(prev => ({ ...prev, [name]: checked }));
    } else {
      // Para todos los demás inputs (incluido 'value'), el valor es string
      setFormState(prev => ({ ...prev, [name]: value })); 
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valueAsNumber = parseFloat(formState.value); 
    const dataToSubmit: ExternalPriceFormData = {
        ...formState,
        value: isNaN(valueAsNumber) ? 0 : valueAsNumber, // Convertir a número
    };
    onSubmit(dataToSubmit); // Enviar datos con value como number
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label htmlFor="priceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Precio</label>
        <Input
          type="text"
          name="priceType"
          id="priceType"
          value={formState.priceType}
          onChange={handleChange}
          placeholder="Ej: costo, venta_base, oferta"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
          <Input
            type="number"
            name="value"
            id="value"
            value={formState.value} // Es string aquí, el input lo maneja
            onChange={handleChange}
            placeholder="0.00"
            step="any"
            required
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Moneda</label>
          <Input
            type="text"
            name="currency"
            id="currency"
            value={formState.currency}
            onChange={handleChange}
            placeholder="Ej: USDT, USD, EUR"
            required
            className="uppercase"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Válido Desde (Opcional)</label>
            <Input
            type="date"
            name="validFrom"
            id="validFrom"
            value={formState.validFrom || ''}
            onChange={handleChange}
            />
        </div>
        <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Válido Hasta (Opcional)</label>
            <Input
            type="date"
            name="validTo"
            id="validTo"
            value={formState.validTo || ''}
            onChange={handleChange}
            />
        </div>
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Región (Opcional)</label>
        <Input
          type="text"
          name="region"
          id="region"
          value={formState.region || ''}
          onChange={handleChange}
          placeholder="Ej: LATAM, EU"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas (Opcional)</label>
        <textarea
          name="notes"
          id="notes"
          value={formState.notes || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Notas adicionales sobre este precio..."
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formState.isActive ?? true} 
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-600"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          Precio Activo
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {initialData ? 'Actualizar Precio' : 'Guardar Precio'}
        </Button>
      </div>
    </form>
  );
};

export default PriceForm; 