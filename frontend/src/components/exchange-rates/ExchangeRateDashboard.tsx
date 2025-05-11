import React, { useState, useEffect } from 'react';
import exchangeRateService, { ExchangeRatesMap } from '../../services/exchange-rate.service';
import ExchangeRateCard from './ExchangeRateCard';
import Button from '../common/Button';
import { Notification } from '../common';
import { LoadingSpinner } from '../common';

const ExchangeRateDashboard: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRatesMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar tasas al montar el componente
  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ratesData = await exchangeRateService.getExchangeRates();
      setRates(ratesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tasas de cambio');
      console.error('Error al cargar tasas de cambio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await exchangeRateService.refreshExchangeRates();
      setSuccessMessage(response.message || 'Tasas actualizadas exitosamente');
      
      // Recargar las tasas actualizadas
      await loadExchangeRates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar tasas de cambio');
      console.error('Error al actualizar tasas de cambio:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Limpia mensajes después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando tasas de cambio..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tasas de Cambio
        </h1>
        <Button
          variant="primary"
          onClick={handleRefreshRates}
          isLoading={isRefreshing}
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar Tasas'}
        </Button>
      </div>

      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {successMessage && (
        <Notification
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {Object.keys(rates).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No hay tasas de cambio disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(rates).map(([pairKey, rateDetail]) => (
            <ExchangeRateCard
              key={pairKey}
              pairKey={pairKey}
              rateDetail={rateDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExchangeRateDashboard; 