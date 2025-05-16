import React, { useState, useEffect, useCallback } from 'react';
import { Price } from '../../types/price.types';
import { priceService, GetPricesQueryParams } from '../../services/price.service';
import { LoadingSpinner, Notification, Button } from '../common';
import PriceForm, { PriceFormData } from '../pricing/PriceForm';

interface ItemPriceManagerProps {
  gameItemId: string;
  gameItemName: string;
  // entityType será "GameItem" implícitamente por ahora
  onClose: () => void; // Para cerrar el modal o la sección
}

const ItemPriceManager: React.FC<ItemPriceManagerProps> = ({ 
  gameItemId, 
  gameItemName, 
  onClose 
}) => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);

  const entityType = "GameItem"; // Fijo para este contexto

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams: GetPricesQueryParams = { 
        entityId: gameItemId, 
        entityType 
      };
      const fetchedPrices = await priceService.getPrices(queryParams);
      setPrices(fetchedPrices);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los precios.');
    } finally {
      setIsLoading(false);
    }
  }, [gameItemId, entityType]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handlePriceFormSubmit = async (formData: PriceFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const pricePayload: Partial<Price> = {
      ...formData,
      value: Number(formData.value),
      validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
      validTo: formData.validTo ? new Date(formData.validTo) : undefined,
    };

    try {
      if (editingPrice && editingPrice._id) {
        const { entityId, entityType, ...updateData } = pricePayload;
        await priceService.updatePrice(editingPrice._id, updateData as Omit<Price, '_id' | 'createdAt' | 'updatedAt' | 'entityId' | 'entityType'>);
        setSuccessMessage('Precio actualizado exitosamente.');
      } else {
        const createData = { ...pricePayload, entityId: gameItemId, entityType };
        await priceService.createPrice(createData as Omit<Price, '_id' | 'createdAt' | 'updatedAt'>);
        setSuccessMessage('Precio creado exitosamente.');
      }
      setShowPriceForm(false);
      setEditingPrice(null);
      fetchPrices();
    } catch (err: any) {
      setError(err.message || (editingPrice ? 'Error al actualizar el precio.' : 'Error al crear el precio.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este precio?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await priceService.deletePrice(priceId);
      setSuccessMessage('Precio eliminado exitosamente.');
      fetchPrices(); // Recargar precios
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el precio.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPriceForm = (price?: Price) => {
    setEditingPrice(price || null);
    setShowPriceForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  if (isLoading && prices.length === 0) {
    return <LoadingSpinner message="Cargando precios..." />;
  }

  // TODO: Implementar la UI para mostrar precios y el PriceForm
  return (
    <div className="p-1 md:p-4 max-h-[80vh] overflow-y-auto">
      {!showPriceForm && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold">Precios para: {gameItemName}</h3>
            <Button onClick={() => openPriceForm()} variant="primary" size="sm">
              Añadir Nuevo Precio
            </Button>
          </div>
          {error && <Notification type="error" message={error} onClose={() => setError(null)} />}
          {successMessage && <Notification type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
          {isLoading && prices.length > 0 && <p className="text-sm text-gray-500">Actualizando lista de precios...</p>}
        </>
      )}

      {showPriceForm ? (
        <PriceForm 
          initialData={editingPrice}
          onSubmit={handlePriceFormSubmit}
          onCancel={() => {
            setShowPriceForm(false);
            setEditingPrice(null);
            setError(null); // Limpiar errores al cancelar el formulario
          }}
          isLoading={isLoading}
        />
      ) : prices.length === 0 && !isLoading ? (
        <p className="text-center text-gray-500 py-8">No hay precios configurados para este ítem.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {prices.map(price => (
            <div key={price._id} className="p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {price.priceType} ({price.currency.toUpperCase()})
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{price.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span 
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${price.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {price.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex space-x-2 mt-1">
                  <Button onClick={() => openPriceForm(price)} variant="secondary" size="sm">Editar</Button>
                  <Button onClick={() => handleDeletePrice(price._id!)} variant="danger" size="sm" disabled={isLoading}>Eliminar</Button>
                </div>
              </div>
              {(price.validFrom || price.validTo) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Validez: {price.validFrom ? new Date(price.validFrom).toLocaleDateString() : 'N/A'} - {price.validTo ? new Date(price.validTo).toLocaleDateString() : 'N/A'}
                </p>
              )}
              {price.region && <p className="text-xs text-gray-500 dark:text-gray-400">Región: {price.region}</p>}
              {price.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Notas: {price.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemPriceManager; 