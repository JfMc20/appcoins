import React, { useState, useEffect, FormEvent } from 'react';
import { Price } from '../../types/price.types';
import { Input, Button } from '../common'; // Corregido: ../common

export interface PriceFormData {
  priceType: string;
  currency: string;
  value: number | string; // El input de número puede devolver string
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  region?: string;
  notes?: string;
}

interface PriceFormProps {
  initialData?: Price | null;
  onSubmit: (data: PriceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  // Podríamos pasar monedas o tipos de precio predefinidos como props si fuera necesario
}

const PriceForm: React.FC<PriceFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => {
  const [formData, setFormData] = useState<PriceFormData>(() => {
    const defaults: PriceFormData = {
      priceType: '',
      currency: 'USDT', // Podría venir de AppSettings
      value: '',
      isActive: true,
      validFrom: '',
      validTo: '',
      region: '',
      notes: ''
    };
    if (initialData) {
      return {
        priceType: initialData.priceType,
        currency: initialData.currency,
        value: initialData.value,
        isActive: initialData.isActive,
        validFrom: initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : '',
        validTo: initialData.validTo ? new Date(initialData.validTo).toISOString().split('T')[0] : '',
        region: initialData.region || '',
        notes: initialData.notes || ''
      };
    }
    return defaults;
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        priceType: initialData.priceType,
        currency: initialData.currency,
        value: initialData.value,
        isActive: initialData.isActive,
        validFrom: initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : '',
        validTo: initialData.validTo ? new Date(initialData.validTo).toISOString().split('T')[0] : '',
        region: initialData.region || '',
        notes: initialData.notes || ''
      });
    } else {
      // Reset a valores por defecto si no hay initialData (ej. al cambiar de editar a crear)
      setFormData({
        priceType: '',
        currency: 'USDT', 
        value: '',
        isActive: true,
        validFrom: '',
        validTo: '',
        region: '',
        notes: ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const dataToSubmit: PriceFormData = {
        ...formData,
        value: parseFloat(formData.value as string) // Asegurar que el valor sea numérico
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label htmlFor="priceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Precio</label>
        <Input
          type="text"
          name="priceType"
          id="priceType"
          value={formData.priceType}
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
            value={formData.value}
            onChange={handleChange}
            placeholder="0.00"
            step="any" // Permite decimales
            required
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Moneda</label>
          <Input
            type="text"
            name="currency"
            id="currency"
            value={formData.currency}
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
            value={formData.validFrom}
            onChange={handleChange}
            />
        </div>
        <div>
            <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Válido Hasta (Opcional)</label>
            <Input
            type="date"
            name="validTo"
            id="validTo"
            value={formData.validTo}
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
          value={formData.region}
          onChange={handleChange}
          placeholder="Ej: LATAM, EU"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas (Opcional)</label>
        <textarea
          name="notes"
          id="notes"
          value={formData.notes}
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
          checked={formData.isActive}
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