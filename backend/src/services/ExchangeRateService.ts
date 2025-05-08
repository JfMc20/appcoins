import axios from 'axios';
import AppSettingsModel, { IAppSettings, ICurrentRateDetail } from '../models/AppSettingsModel'; // Importar el modelo y las interfaces
import { logger } from '../utils/logger'; // Importar el logger

// Interfaz refinada para la respuesta de un exchange específico dentro de CriptoYa
interface CriptoYaExchangeData {
  ask: number;
  totalAsk: number;
  bid: number;
  totalBid: number;
  time: number;
}

// Interfaz refinada para la respuesta completa de CriptoYa (mapea nombre de exchange a datos)
interface CriptoYaApiResponse {
  [exchangeName: string]: CriptoYaExchangeData;
}

const CRIPTOYA_API_BASE_URL = 'https://criptoya.com/api';
const DEFAULT_CRYPTO_COIN = 'USDT'; // Moneda base para las tasas fiat
const PREFERRED_EXCHANGE = 'binancep2p';

/**
 * Obtiene las tasas de cambio para un par Cripto/Fiat específico desde CriptoYa.
 * @param coin La criptomoneda (ej: 'usdt').
 * @param fiat La moneda fiat (ej: 'ves', 'cop', 'usd').
 * @param volume El volumen para la consulta (requerido por la API, ej: 1).
 * @returns Un objeto mapeando nombres de exchange a sus datos de tasas.
 * @throws Error si la petición falla o la respuesta no es la esperada.
 */
export const getRatesFromCriptoYa = async (
  coin: string,
  fiat: string,
  volume: number = 1
): Promise<CriptoYaApiResponse | null> => {
  // Convertir a minúsculas para la URL de la API
  const lowerCoin = coin.toLowerCase();
  const lowerFiat = fiat.toLowerCase();
  const url = `${CRIPTOYA_API_BASE_URL}/${lowerCoin}/${lowerFiat}/${volume}`;
  logger.debug(`Consultando CriptoYa: ${url}`); // Usar debug para la URL

  try {
    const response = await axios.get<CriptoYaApiResponse>(url);

    if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
      logger.debug(`Respuesta de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()} (vol ${volume}) obtenida.`); // Usar debug
      return response.data;
    } else {
      logger.warn(`Respuesta vacía o inesperada de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()}:`, response.data);
      return null;
    }
  } catch (error: any) {
    logger.error(`Error al obtener tasas de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()}: ${error.message}`);
    if (error.response) {
      logger.debug('Detalles del error de CriptoYa (Respuesta):', error.response.data);
      logger.debug('Status:', error.response.status);
    } else if (error.request) {
      logger.debug(`No se recibió respuesta de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()} (Request):`, error.request);
    } else {
      logger.error(`Error inesperado al obtener ${coin.toUpperCase()}/${fiat.toUpperCase()}:`, error);
    }
    return null;
  }
};

/**
 * Actualiza las tasas de cambio fiat en AppSettings desde CriptoYa, usando Binance P2P como preferido.
 */
export const updateFiatExchangeRates = async (): Promise<void> => {
  logger.info('Iniciando actualización de tasas de cambio fiat...');
  let appSettings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });

  if (!appSettings) {
    logger.error('Configuración global (AppSettings) no encontrada. No se pueden actualizar las tasas.');
    // Opcionalmente, crear configuraciones por defecto si no existen:
    // appSettings = new AppSettingsModel({ defaultTransactionFees: { type: 'percentage', sellRate: 0, buyRate: 0 }, notifications: {lowStockAlertsEnabled: true} });
    // console.log('Creando AppSettings por defecto...');
    return;
  }

  if (!appSettings.supportedFiatCurrencies || appSettings.supportedFiatCurrencies.length === 0) {
    logger.warn('No hay monedas fiat soportadas configuradas en AppSettings. No se actualizarán tasas.');
    return;
  }

  const activeFiatCurrencies = appSettings.supportedFiatCurrencies.filter(fc => fc.isActive);
  if (activeFiatCurrencies.length === 0) {
    logger.info('No hay monedas fiat activas para actualizar.');
    return;
  }

  let ratesUpdatedCount = 0;
  if (!appSettings.currentExchangeRates) {
    appSettings.currentExchangeRates = new Map<string, ICurrentRateDetail>();
  }

  for (const fiatCurrency of activeFiatCurrencies) {
    const pairKey = `${DEFAULT_CRYPTO_COIN}_${fiatCurrency.code}`;
    logger.debug(`Procesando par: ${pairKey}`);

    const criptoYaData = await getRatesFromCriptoYa(DEFAULT_CRYPTO_COIN, fiatCurrency.code);

    if (criptoYaData && criptoYaData[PREFERRED_EXCHANGE]) {
      const preferredRateData = criptoYaData[PREFERRED_EXCHANGE];
      const newAsk = preferredRateData.ask;
      const newBid = preferredRateData.bid;
      // Usaremos ASK como la 'currentRate' por defecto
      const newCurrentRate = newAsk;

      const existingRateDetail = appSettings.currentExchangeRates.get(pairKey);
      const previousRate = existingRateDetail?.currentRate;

      let change: number | undefined = undefined;
      let changePercent: number | undefined = undefined;

      if (previousRate && newCurrentRate) {
        change = newCurrentRate - previousRate;
        if (previousRate !== 0) { // Evitar división por cero
            changePercent = (change / previousRate) * 100;
        }
      }
      
      const rateDetail: ICurrentRateDetail = {
        currentRate: newCurrentRate,
        previousRate: previousRate,
        ask: newAsk,
        bid: newBid,
        change: change,
        changePercent: changePercent,
        lastUpdated: new Date(),
        source: `CriptoYa - ${PREFERRED_EXCHANGE}`,
      };

      appSettings.currentExchangeRates.set(pairKey, rateDetail);
      logger.info(`Tasa para ${pairKey} actualizada: current=${newCurrentRate.toFixed(4)}, ask=${newAsk.toFixed(4)}, bid=${newBid.toFixed(4)}`);
      ratesUpdatedCount++;
    } else {
      logger.warn(`No se encontró la tasa de ${PREFERRED_EXCHANGE} para ${pairKey} en CriptoYa, o hubo un error al obtenerla.`);
    }
  }

  if (ratesUpdatedCount > 0) {
    try {
      await appSettings.save();
      logger.success(`${ratesUpdatedCount} tasas de cambio fiat actualizadas exitosamente en AppSettings.`);
    } catch (error) {
      logger.error('Error al guardar AppSettings con las nuevas tasas:', error);
    }
  } else {
    logger.info('No se actualizaron nuevas tasas en esta ejecución.');
  }
};

// Podríamos añadir más funciones aquí para otros pares o para la lógica de actualización
// y almacenamiento de tasas en appSettings más adelante.

// Ejemplo de cómo podrías querer estructurar el servicio:
// class ExchangeRateService {
//   private criptoyaBaseUrl = 'https://criptoya.com/api';

//   async getRate(coin: string, fiat: string, volume: number = 1): Promise<any> {
//     const url = `${this.criptoyaBaseUrl}/${coin.toLowerCase()}/${fiat.toLowerCase()}/${volume}`;
//     // ... lógica de axios ...
//   }

//   async updateStoredRates() {
//     // 1. Obtener monedas activas y APIs configuradas de appSettings
//     // 2. Iterar y llamar a this.getRate o funciones específicas
//     // 3. Aplicar estrategia de selección (bid, ask, avg)
//     // 4. Actualizar appSettings.currentExchangeRates
//   }

//   getStoredConversionRate(fromCurrency: string, toCurrency: string): number | null {
//     // Lógica para obtener la tasa almacenada
//     return null;
//   }
// }
// export default new ExchangeRateService(); 