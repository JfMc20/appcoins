import React from 'react';
import { ExchangeRateDetail } from '../../services/exchange-rate.service';
import exchangeRateService from '../../services/exchange-rate.service';
import Card from '../common/Card';

interface ExchangeRateCardProps {
  pairKey: string;
  rateDetail: ExchangeRateDetail;
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ pairKey, rateDetail }) => {
  // Separar las monedas del par (ej: "USDT_VES" -> ["USDT", "VES"])
  const [baseCurrency, targetCurrency] = pairKey.split('_');
  
  // Determinar color basado en el cambio
  const getChangeColor = () => {
    if (!rateDetail.change) return 'text-gray-500';
    return rateDetail.change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {baseCurrency} / {targetCurrency}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Actualizado: {exchangeRateService.formatLastUpdated(rateDetail.lastUpdated)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasa actual</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {exchangeRateService.formatRate(rateDetail.currentRate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cambio</p>
            <div className={`text-sm font-medium ${getChangeColor()}`}>
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
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {exchangeRateService.formatRate(rateDetail.ask)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bid (Compra)</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
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