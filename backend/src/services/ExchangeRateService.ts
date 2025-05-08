import axios from 'axios';

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
): Promise<CriptoYaApiResponse> => {
  // Convertir a minúsculas para la URL de la API
  const lowerCoin = coin.toLowerCase();
  const lowerFiat = fiat.toLowerCase();
  const url = `${CRIPTOYA_API_BASE_URL}/${lowerCoin}/${lowerFiat}/${volume}`;
  console.log(`Consultando CriptoYa: ${url}`); // Log para ver la URL consultada

  try {
    const response = await axios.get<CriptoYaApiResponse>(url);

    if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
      console.log(`Respuesta de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()} (vol ${volume}):`);
      // No imprimiremos toda la respuesta aquí para evitar spam, solo en el script de prueba.
      return response.data;
    } else {
      console.warn(`Respuesta vacía o inesperada de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()}:`, response.data);
      throw new Error(`Respuesta inesperada o vacía de la API de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()}`);
    }
  } catch (error: any) {
    console.error(`Error al obtener tasas de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()}: ${error.message}`);
    if (error.response) {
      console.error('Detalles del error de CriptoYa (Respuesta):', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error(`No se recibió respuesta de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()} (Request):`, error.request);
    } else {
      console.error(`Error inesperado al obtener ${coin.toUpperCase()}/${fiat.toUpperCase()}:`, error);
    }
    throw new Error(`No se pudieron obtener las tasas de CriptoYa para ${coin.toUpperCase()}/${fiat.toUpperCase()}.`);
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