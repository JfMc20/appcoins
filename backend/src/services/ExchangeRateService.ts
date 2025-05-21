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
    // Aumentar el timeout para evitar problemas de conexión
    const response = await axios.get<CriptoYaApiResponse>(url, {
      timeout: 10000 // 10 segundos de timeout
    });

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
    return;
  }

  // --- Nueva lógica: Verificar si la API de CriptoYa está habilitada ---
  const criptoYaApiConfig = appSettings.exchangeRateAPIs?.find(api => api.name === 'CriptoYa');
  
  if (!criptoYaApiConfig || !criptoYaApiConfig.isEnabled) {
    logger.warn('La API de CriptoYa no está configurada o no está habilitada en AppSettings. No se actualizarán las tasas desde esta fuente.');
    // Si no hay APIs habilitadas o CriptoYa no está, no continuamos con la obtención de tasas.
    // Podemos optar por no modificar las tasas existentes o limpiarlas si es necesario, 
    // pero por ahora, simplemente no intentaremos obtener nuevas tasas si la fuente principal está deshabilitada.
    return; // Salir de la función si la fuente principal no está activa
  }
  // --- Fin de la nueva lógica ---

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

  // Crear un array de promesas para obtener todas las tasas en paralelo
  const ratePromises = activeFiatCurrencies.map(fiatCurrency =>
    getRatesFromCriptoYa(DEFAULT_CRYPTO_COIN, fiatCurrency.code)
      .then(criptoYaData => ({ // Envolver el resultado con la moneda para referencia posterior
        fiatCurrency,
        criptoYaData,
        pairKey: `${DEFAULT_CRYPTO_COIN}_${fiatCurrency.code}` // Pre-calcular pairKey para logging si es necesario
      }))
      .catch(error => { // Capturar errores individuales para que Promise.all no falle por completo
        logger.error(`Error al obtener tasa para ${fiatCurrency.code} durante la paralelización:`, error);
        return { fiatCurrency, criptoYaData: null, pairKey: `${DEFAULT_CRYPTO_COIN}_${fiatCurrency.code}` }; // Devolver null para que el resto siga
      })
  );

  // Esperar a que todas las promesas se resuelvan
  const settledRates = await Promise.all(ratePromises);

  for (const result of settledRates) {
    const { fiatCurrency, criptoYaData, pairKey } = result;
    // pairKey ya fue calculado y usado en el logging de error individual si lo hubo.
    // Lo recalculamos aquí por claridad o lo usamos directamente si se pasó.
    // const pairKey = `${DEFAULT_CRYPTO_COIN}_${fiatCurrency.code}`; // Ya está en result.pairKey

    logger.debug(`Procesando par: ${pairKey}`);

    if (criptoYaData && criptoYaData[PREFERRED_EXCHANGE]) {
      const preferredRateData = criptoYaData[PREFERRED_EXCHANGE];
      const newAsk = preferredRateData.ask;
      const newBid = preferredRateData.bid;
      const newCurrentRate = newAsk; // Usaremos ASK como la 'currentRate' por defecto

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
      // El error ya se logueó en el .catch de la promesa individual si criptoYaData es null debido a un error.
      // Si criptoYaData no es null pero falta PREFERRED_EXCHANGE, logueamos aquí.
      if (criptoYaData) { // Solo loguear si no fue un error capturado antes
        logger.warn(`No se encontró la tasa de ${PREFERRED_EXCHANGE} para ${pairKey} en CriptoYa, o hubo un error al obtenerla (datos recibidos):`, criptoYaData);
      }
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

/**
 * Obtiene una tasa de conversión entre dos monedas utilizando las tasas almacenadas en AppSettings.
 * @param fromCurrency Código de la moneda de origen (ej: 'ARS').
 * @param toCurrency Código de la moneda de destino (ej: 'COP').
 * @param appSettings El documento de configuración de la aplicación que contiene las tasas actuales.
 * @returns La tasa de conversión (cuánto de toCurrency obtienes por 1 unidad de fromCurrency), o null si no se puede convertir.
 */
export const getConversionRate = (
  fromCurrency: string,
  toCurrency: string,
  appSettings: IAppSettings | null // Permitir null para manejar el caso donde no se cargan las settings
): number | null => {
  if (!appSettings || !appSettings.currentExchangeRates) {
    logger.error('AppSettings o currentExchangeRates no disponibles para getConversionRate.');
    return null;
  }

  const refCurrency = appSettings.defaultReferenceCurrency.toUpperCase();
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) {
    return 1.0;
  }

  const rates = appSettings.currentExchangeRates;

  // Caso 1: Convertir DESDE la moneda de referencia HACIA otra moneda
  // Ej: USDT -> ARS. Necesitamos la tasa USDT_ARS (cuántos ARS por 1 USDT)
  if (from === refCurrency) {
    const pairKey = `${refCurrency}_${to}`;
    const rateDetail = rates.get(pairKey);
    if (rateDetail && typeof rateDetail.currentRate === 'number') {
      logger.debug(`Tasa directa encontrada para ${pairKey}: ${rateDetail.currentRate}`);
      return rateDetail.currentRate;
    }
    logger.warn(`No se encontró tasa directa para ${pairKey}`);
    return null;
  }

  // Caso 2: Convertir DESDE otra moneda HACIA la moneda de referencia
  // Ej: ARS -> USDT. Necesitamos la tasa USDT_ARS y luego invertirla (1 / (USDT_ARS))
  if (to === refCurrency) {
    const pairKey = `${refCurrency}_${from}`;
    const rateDetail = rates.get(pairKey);
    if (rateDetail && typeof rateDetail.currentRate === 'number' && rateDetail.currentRate !== 0) {
      logger.debug(`Tasa inversa para ${from}_${refCurrency} (basada en ${pairKey}): ${1 / rateDetail.currentRate}`);
      return 1 / rateDetail.currentRate;
    }
    logger.warn(`No se encontró tasa directa para ${pairKey} para conversión inversa, o tasa es cero.`);
    return null;
  }

  // Caso 3: Conversión cruzada a través de la moneda de referencia
  // Ej: ARS -> COP (ARS -> USDT -> COP)
  // Tasa ARS->USDT = 1 / (tasa USDT_ARS)
  // Tasa USDT->COP = tasa USDT_COP
  // Tasa ARS->COP = (1 / tasa USDT_ARS) * tasa USDT_COP
  const rateFromToRefKey = `${refCurrency}_${from}`; // Tasa para convertir 'from' a la referencia (ej. USDT_ARS)
  const rateRefToToKey = `${refCurrency}_${to}`;   // Tasa para convertir la referencia a 'to' (ej. USDT_COP)

  const rateDetailFromToRef = rates.get(rateFromToRefKey);
  const rateDetailRefToTo = rates.get(rateRefToToKey);

  if (rateDetailFromToRef && typeof rateDetailFromToRef.currentRate === 'number' && rateDetailFromToRef.currentRate !== 0 &&
      rateDetailRefToTo && typeof rateDetailRefToTo.currentRate === 'number') {
    const rateFromToRef = 1 / rateDetailFromToRef.currentRate; // ej. ARS por 1 USDT
    const rateRefToTo = rateDetailRefToTo.currentRate;         // ej. COP por 1 USDT
    const crossRate = rateFromToRef * rateRefToTo;
    logger.debug(`Tasa cruzada para ${from}->${to} vía ${refCurrency}: ${crossRate} ( ${from}->${refCurrency}=${rateFromToRef}, ${refCurrency}->${to}=${rateRefToTo} )`);
    return crossRate;
  }
  
  logger.warn(`No se pudieron encontrar tasas para conversión cruzada ${from} -> ${to} vía ${refCurrency}. Faltan: ${!rateDetailFromToRef ? rateFromToRefKey : ''} ${!rateDetailRefToTo ? rateRefToToKey : ''}`);
  return null;
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