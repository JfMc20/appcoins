import React, { useEffect, useState, useCallback } from 'react';
import { settingsService } from '../../services/settings.service';
import { AppSettings, SupportedCurrency } from '../../types/appSettings.types';
import { LoadingSpinner, Notification } from '../../components/common';
import { DashboardLayout } from '../../components/layout';

const AppSettingsPage: React.FC = () => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAppSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const data = await settingsService.getAppSettings();
      setAppSettings(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la configuración de la aplicación.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppSettings();
  }, [fetchAppSettings]);

  const handleCurrencyToggle = async (currencyCode: string, isActive: boolean) => {
    if (!appSettings) return;

    const updatedCurrencies = appSettings.supportedFiatCurrencies.map(c =>
      c.code === currencyCode ? { ...c, isActive } : c
    );

    // Optimistic update (opcional, pero mejora la UX)
    // setAppSettings(prev => prev ? { ...prev, supportedFiatCurrencies: updatedCurrencies } : null);

    setIsLoading(true); // Podrías tener un loader más granular por fila/item
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedSettings = await settingsService.updateSupportedCurrencies(updatedCurrencies);
      console.log('Data received in AppSettingsPage before setAppSettings:', updatedSettings);
      setAppSettings(updatedSettings);
      setSuccessMessage('Monedas soportadas actualizadas correctamente.');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar las monedas soportadas.');
      // Revert optimistic update if failed (si se implementó)
      // fetchAppSettings(); // o revertir manualmente al estado anterior
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !appSettings) {
    return (
      <DashboardLayout>
        <div className="p-4"><LoadingSpinner message="Cargando configuración..."/></div>
      </DashboardLayout>
    );
  }

  if (error && !appSettings) {
    return (
      <DashboardLayout>
        <div className="p-4"><Notification type="error" message={error} onClose={fetchAppSettings} /></div>
      </DashboardLayout>
    );
  }

  if (!appSettings) {
    return (
      <DashboardLayout>
        <div className="p-4">No se encontró la configuración de la aplicación.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Ajustes de la Aplicación
        </h1>

        {/* Mensajes de estado global para la página */}
        {error && !successMessage && 
          <Notification type="error" message={error} onClose={() => setError(null)} />
        }
        {successMessage && 
          <Notification type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        }
        
        <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Monedas Fiat Soportadas
          </h2>
          {/* Mostrar "Actualizando..." solo si no es la carga inicial y appSettings ya existe */}
          {isLoading && appSettings && <p className="text-sm text-gray-500 dark:text-gray-400">Actualizando...</p>}
          <div className="space-y-4">
            {/* Comprobación más robusta */}
            {appSettings && appSettings.supportedFiatCurrencies && appSettings.supportedFiatCurrencies.length > 0 ? (
              appSettings.supportedFiatCurrencies.map(currency => (
                <div key={currency.code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-white">{currency.name} ({currency.code})</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Símbolo: {currency.symbol}</span>
                  </div>
                  <label htmlFor={`currency-${currency.code}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id={`currency-${currency.code}`} 
                        className="sr-only" 
                        checked={currency.isActive}
                        onChange={(e) => handleCurrencyToggle(currency.code, e.target.checked)}
                        disabled={isLoading} // Deshabilitar mientras se guarda
                      />
                      <div className={`block w-10 h-6 rounded-full ${currency.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${currency.isActive ? 'transform translate-x-full' : ''}`}></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {currency.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </label>
                </div>
              ))
            ) : (
              // Mostrar mensaje adecuado si no hay monedas o si appSettings aún no se ha cargado y no hay error
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading ? 'Cargando monedas...' : 'No hay monedas fiat configuradas o la configuración aún no se ha cargado.'}
              </p>
            )}
          </div>
        </section>

        {/* Aquí se podrían añadir más secciones para otras configuraciones de AppSettings en el futuro */}
        {/* Ejemplo:
        <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Comisiones por Transacción
          </h2>
          <p>Default Sell Rate: {appSettings.defaultTransactionFees.sellRate} ({appSettings.defaultTransactionFees.type})</p>
          // ... más detalles y formulario para editar
        </section>
        */}
      </div>
    </DashboardLayout>
  );
};

export default AppSettingsPage; 