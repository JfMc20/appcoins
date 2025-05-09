import React, { useState, FormEvent } from 'react';
import { CreateGameData, Game } from '../../types/game.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface GameFormProps {
  onSubmit: (data: CreateGameData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  initialData?: Game; // Para edición futura
  title?: string;
}

/**
 * Componente para el formulario de creación/edición de juegos
 */
const GameForm: React.FC<GameFormProps> = ({ 
  onSubmit, 
  isLoading, 
  onCancel,
  initialData,
  title = 'Crear Nuevo Juego' 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [shortName, setShortName] = useState(initialData?.shortName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(initialData?.status || 'active');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const gameData: CreateGameData = {
      name,
      shortName,
      description,
      status
    };
    await onSubmit(gameData);
  };

  return (
    <Card className="mb-8 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Juego"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Input
          label="Nombre Corto (Código)"
          id="shortName"
          type="text"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          required
        />

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            className="shadow-sm focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

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
            {initialData ? 'Actualizar Juego' : 'Crear Juego'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GameForm; 