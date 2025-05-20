import React, { useState, useEffect, useCallback } from 'react';
import { GameItem } from '../../types/game.types';
import { Price, PriceFormData } from '../../types/price.types';
import { priceService } from '../../services/price.service';
import PriceForm from '../pricing/PriceForm';
import Button from '../common/Button';
import { PlusCircle, Edit3, Trash2, List } from 'lucide-react';

interface ItemPriceManagerProps {
  gameItem: GameItem | null;
  onClose: () => void;
}

const ItemPriceManager: React.FC<ItemPriceManagerProps> = ({ gameItem, onClose }) => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [selectedPriceData, setSelectedPriceData] = useState<PriceFormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPriceForm, setShowPriceForm] = useState<boolean>(false);

  const fetchPrices = useCallback(async () => {
    if (!gameItem) {
      setPrices([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPrices = await priceService.getPrices({ entityId: gameItem._id, entityType: 'GameItem' });
      setPrices(fetchedPrices);
    } catch (err: any) {
      console.error('Error fetching prices:', err);
      setError(err.message || 'Error al cargar los precios.');
    } finally {
      setIsLoading(false);
    }
  }, [gameItem]);

  useEffect(() => {
    if (gameItem) {
      fetchPrices();
    }
  }, [fetchPrices, gameItem]);

  const handleAddNewPrice = () => {
    setSelectedPriceData(null);
    setShowPriceForm(true);
  };

  const handleEditPrice = (price: Price) => {
    setSelectedPriceData({
      _id: price._id,
      currency: price.currency,
      value: price.value,
      priceType: price.priceType,
      isActive: price.isActive,
      validFrom: price.validFrom ? (typeof price.validFrom === 'string' ? price.validFrom.split('T')[0] : new Date(price.validFrom).toISOString().split('T')[0]) : undefined,
      validTo: price.validTo ? (typeof price.validTo === 'string' ? price.validTo.split('T')[0] : new Date(price.validTo).toISOString().split('T')[0]) : undefined,
      region: price.region,
      notes: price.notes,
    });
    setShowPriceForm(true);
  };

  const handleDeletePrice = async (priceId: string | undefined) => {
    if (!priceId) {
      setError("ID de precio inválido para eliminar.");
      return;
    }
    if (!window.confirm('¿Estás seguro de que quieres eliminar este precio?')) {
      return;
    }
    setIsLoading(true);
    try {
      await priceService.deletePrice(priceId);
      fetchPrices();
    } catch (err: any) {
      console.error('Error deleting price:', err);
      setError(err.message || 'Error al eliminar el precio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formDataFromForm: PriceFormData) => {
    if (!gameItem) return;
    setIsLoading(true);
    setError(null);
    const pricePayload: Omit<Price, '_id' | 'createdAt' | 'updatedAt'> = {
      entityId: gameItem._id,
      entityType: 'GameItem',
      priceType: formDataFromForm.priceType,
      currency: formDataFromForm.currency,
      value: formDataFromForm.value,
      isActive: formDataFromForm.isActive === undefined ? true : formDataFromForm.isActive,
      validFrom: formDataFromForm.validFrom || undefined,
      validTo: formDataFromForm.validTo || undefined,
      region: formDataFromForm.region || undefined,
      notes: formDataFromForm.notes || undefined,
    };
    try {
      if (formDataFromForm._id) {
        await priceService.updatePrice(formDataFromForm._id, pricePayload);
      } else {
        await priceService.createPrice(pricePayload);
      }
      fetchPrices();
      setShowPriceForm(false);
      setSelectedPriceData(null);
    } catch (err: any) {
      console.error('Error submitting price form:', err);
      setError(err.message || 'Error al guardar el precio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowPriceForm(false);
    setSelectedPriceData(null);
    setError(null);
  };

  if (!gameItem && !showPriceForm) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Administrador de Precios</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Por favor, selecciona un artículo de la lista para ver y gestionar sus precios.</p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">Cerrar</Button>
        </div>
      </div>
    );
  }
  
  let titleText = gameItem ? `Precios para: ${gameItem.name}` : 'Precios de Artículo';
  let descriptionText = "";
  if (showPriceForm) {
    titleText = selectedPriceData?._id ? 'Editar Precio Existente' : 'Añadir Nuevo Precio';
    descriptionText = selectedPriceData?._id 
      ? "Modifica los campos necesarios y guarda los cambios."
      : "Completa los siguientes campos para registrar un nuevo precio para este artículo.";
  } else if (gameItem) {
    descriptionText = "Aquí puedes ver, añadir, editar o eliminar los precios asociados a este artículo.";
  }

  return (
    <div className="p-1 sm:p-2 flex flex-col max-h-[80vh]">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 text-center sm:text-left">{titleText}</h2>
      {descriptionText && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center sm:text-left">{descriptionText}</p>}

      {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-3 rounded-md my-3 text-sm">{error}</p>}

      {showPriceForm ? (
        <div className="overflow-y-auto flex-grow">
          <PriceForm
            initialData={selectedPriceData}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="flex-grow flex flex-col">
          <div className="mb-4 flex justify-end">
            <Button onClick={handleAddNewPrice} variant="primary" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Precio
            </Button>
          </div>

          {isLoading && <p className="text-center py-4 text-gray-500 dark:text-gray-300">Cargando precios...</p>}
          
          {!isLoading && prices.length === 0 && (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 py-8">
              <List className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-xl font-semibold mb-1">No hay precios configurados</p>
              <p className="text-sm">Aún no has añadido ningún precio para <strong className="font-medium">{gameItem?.name || 'este artículo'}</strong>.</p>
              <p className="text-sm mt-1">¡Usa el botón <strong className="font-medium">"Añadir Nuevo Precio"</strong> para empezar!</p>
            </div>
          )}

          {!isLoading && prices.length > 0 && (
            <div className="overflow-x-auto flex-grow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Moneda</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {prices.map((price) => (
                    <tr key={price._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{price.currency}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{price.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{price.priceType}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button onClick={() => handleEditPrice(price)} variant="outline" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDeletePrice(price._id)} variant="danger" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pt-4 mt-auto flex justify-end border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose} variant="outline">Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPriceManager; 