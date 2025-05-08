// Este script es para pruebas de desarrollo y no forma parte del servidor principal.
import dotenv from 'dotenv';
// Ajusta la ruta a tu .env si es necesario
dotenv.config({ path: '../.env' }); // Asumiendo .env en la carpeta backend/

// Importar la función generalizada
import { getRatesFromCriptoYa } from '../services/ExchangeRateService';

// Lista de pares fiat a probar contra USDT
const fiatCurrenciesToTest = ['VES', 'COP', 'MXN', 'BRL', 'USD'];
const cryptoCoin = 'USDT';
const volume = 1; // Volumen de prueba

async function testAllFiatRates() {
  console.log(`Probando la obtención de tasas ${cryptoCoin}/* desde CriptoYa...`);
  console.log('==================================================');

  for (const fiat of fiatCurrenciesToTest) {
    try {
      console.log(`\nObteniendo tasa para ${cryptoCoin}/${fiat}...`);
      const rates = await getRatesFromCriptoYa(cryptoCoin, fiat, volume);
      console.log(`Tasas obtenidas de CriptoYa para ${cryptoCoin}/${fiat}:`);
      console.dir(rates, { depth: 2 }); // Mostrar con un poco de profundidad, pero no todo

      // Ejemplo: Extraer y mostrar tasa de Binance P2P si existe
      if (rates && rates.binancep2p) {
          console.log(` -> Binance P2P | Ask: ${rates.binancep2p.ask} | Bid: ${rates.binancep2p.bid}`);
      } else {
          console.log(` -> No se encontró tasa para Binance P2P en la respuesta.`);
      }

    } catch (error: any) {
      console.error(`Error durante la prueba de ${cryptoCoin}/${fiat}: ${error.message}\n`);
    }
    console.log('--------------------------------------------------');
    // Esperar un poco entre llamadas para no saturar la API (si es necesario)
    // await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 segundos
  }
  console.log('==================================================');
  console.log('Prueba de tasas completada.');
}

// Ejecutar la prueba
testAllFiatRates(); 