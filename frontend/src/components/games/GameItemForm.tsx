import React, { useState, FormEvent } from 'react';
import { CreateGameItemData, GameItem } from '../../types/game.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface GameItemFormProps {
  onSubmit: (data: CreateGameItemData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  gameId: string;
  initialData?: GameItem; // Para edición futura
  title?: string;
}

/**
 * Componente para el formulario de creación/edición de ítems de juegos
 */
const GameItemForm: React.FC<GameItemFormProps> = ({ 
  onSubmit, 
  isLoading, 
  onCancel,
  gameId,
  initialData,
  title = 'Crear Nuevo Ítem' 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [itemCode, setItemCode] = useState(initialData?.itemCode || '');
  const [type, setType] = useState<'currency' | 'item' | 'service' | 'other'>(initialData?.type || 'item');
  const [description, setDescription] = useState(initialData?.description || '');
  const [managesStock, setManagesStock] = useState(initialData?.managesStock || false);
  const [currentStock, setCurrentStock] = useState<number | undefined>(initialData?.currentStock);
  const [isTradable, setIsTradable] = useState(initialData?.isTradable !== undefined ? initialData.isTradable : true);
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(initialData?.status || 'active');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const itemData: CreateGameItemData = {
      gameId,
      name,
      itemCode,
      type,
      description,
      managesStock,
      currentStock: managesStock ? currentStock || 0 : undefined,
      isTradable,
      status: status as 'active' | 'inactive' | 'archived'
    };
    await onSubmit(itemData);
  };

  return (
    <Card className="mb-8 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Ítem"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Input
          label="Código del Ítem"
          id="itemCode"
          type="text"
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Ítem
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'currency' | 'item' | 'service' | 'other')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="currency">Moneda</option>
            <option value="item">Ítem</option>
            <option value="service">Servicio</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            rows={2}
            className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex space-x-6">
          <div className="flex items-center">
            <input
              id="managesStock"
              type="checkbox"
              checked={managesStock}
              onChange={(e) => setManagesStock(e.target.checked)}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label htmlFor="managesStock" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Gestiona Stock
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="isTradable"
              type="checkbox"
              checked={isTradable}
              onChange={(e) => setIsTradable(e.target.checked)}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label htmlFor="isTradable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Comercializable
            </label>
          </div>
        </div>

        {managesStock && (
          <Input
            label="Stock Inicial"
            id="currentStock"
            type="number"
            value={currentStock !== undefined ? currentStock.toString() : ''}
            onChange={(e) => setCurrentStock(e.target.value ? parseInt(e.target.value) : undefined)}
            min={0}
            required={managesStock}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'archived')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {initialData ? 'Actualizar Ítem' : 'Crear Ítem'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GameItemForm; 