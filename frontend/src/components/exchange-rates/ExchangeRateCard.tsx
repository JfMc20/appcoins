import React from 'react';
import { ExchangeRateDetail } from '../../services/exchange-rate.service';
import exchangeRateService from '../../services/exchange-rate.service';
import Card from '../common/Card';

interface ExchangeRateCardProps {
  pairKey: string;
  rateDetail: ExchangeRateDetail;
  onStatusChange: (pairKey: string, isEnabled: boolean) => void;
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ pairKey, rateDetail, onStatusChange }) => {
  // Separar las monedas del par (ej: "USDT_VES" -> ["USDT", "VES"])
  const [baseCurrency, targetCurrency] = pairKey.split('_');
  
  // Determinar color basado en el cambio
  const getChangeColor = () => {
    if (!rateDetail.change) return 'text-gray-500';
    return rateDetail.change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onStatusChange(pairKey, event.target.checked);
  };

  return (
    <Card className={`bg-gray-50 dark:bg-gray-800 border shadow-md ${rateDetail.isEnabled ? 'border-green-500 dark:border-green-700' : 'border-red-500 dark:border-red-700 opacity-60'}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${rateDetail.isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'}`}>
            {baseCurrency} / {targetCurrency}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Actualizado: {exchangeRateService.formatLastUpdated(rateDetail.lastUpdated)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <label htmlFor={`toggle-${pairKey}`} className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id={`toggle-${pairKey}`}
                className="sr-only"
                checked={rateDetail.isEnabled}
                onChange={handleToggleChange}
                aria-label={`Habilitar o deshabilitar tasa ${pairKey}`}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${rateDetail.isEnabled ? 'translate-x-full bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
              {rateDetail.isEnabled ? 'Habilitado' : 'Deshabilitado'}
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasa actual</p>
            <p className={`text-2xl font-bold ${rateDetail.isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'}`}>
              {exchangeRateService.formatRate(rateDetail.currentRate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cambio</p>
            <div className={`text-sm font-medium ${getChangeColor()} ${!rateDetail.isEnabled && 'text-gray-500 dark:text-gray-600'}`}>
              {rateDetail.change && 
                <>
                  {rateDetail.change >= 0 ? '↑' : '↓'} {exchangeRateService.formatRate(Math.abs(rateDetail.change))}
                  <span className="ml-1">
                    ({exchangeRateService.formatChangePercent(rateDetail.changePercent)})
                  </span>
                </>
              }
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ask (Venta)</p>
            <p className={`text-lg font-semibold ${rateDetail.isEnabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-600'}`}>
              {exchangeRateService.formatRate(rateDetail.ask)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bid (Compra)</p>
            <p className={`text-lg font-semibold ${rateDetail.isEnabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-600'}`}>
              {exchangeRateService.formatRate(rateDetail.bid)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fuente: {rateDetail.source || 'Desconocida'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ExchangeRateCard; 