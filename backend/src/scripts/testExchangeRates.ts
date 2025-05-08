// Este script es para pruebas de desarrollo y no forma parte del servidor principal.
import dotenv from 'dotenv';
// Ajusta la ruta a tu .env si es necesario
dotenv.config({ path: '../.env' }); // Asumiendo .env en la carpeta backend/

import mongoose from 'mongoose';
import connectDB from '../config/database'; // Para conectar a la BD
import AppSettingsModel, { ISupportedFiatCurrency } from '../models/AppSettingsModel';
import { updateFiatExchangeRates, getRatesFromCriptoYa } from '../services/ExchangeRateService';

// Lista de monedas fiat a asegurar en AppSettings y probar
const fiatCurrenciesToEnsure: ISupportedFiatCurrency[] = [
  { code: 'VES', symbol: 'Bs.', name: 'Bolívar Venezolano', isActive: true, apiSource: 'CriptoYa' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', isActive: true, apiSource: 'CriptoYa' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', isActive: true, apiSource: 'CriptoYa' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', isActive: true, apiSource: 'CriptoYa' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', isActive: true, apiSource: 'CriptoYa' },
  { code: 'EUR', symbol: '€', name: 'Euro', isActive: false, apiSource: 'CriptoYa' }, // Ejemplo de una inactiva
];

const ensureAppSettings = async () => {
  console.log('Asegurando la configuración de AppSettings...');
  let settings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });
  if (!settings) {
    console.log('No se encontraron AppSettings, creando documento por defecto...');
    settings = new AppSettingsModel({
      supportedFiatCurrencies: fiatCurrenciesToEnsure,
      // Asegúrate de que defaultTransactionFees y notifications tengan valores válidos por defecto
      defaultTransactionFees: { type: 'percentage', sellRate: 0.05, buyRate: 0.05 }, // Ejemplo 5%
      notifications: { lowStockAlertsEnabled: true },
    });
    await settings.save();
    console.log('AppSettings creadas por defecto.');
  } else {
    // Opcional: actualizar/asegurar que las monedas de prueba estén presentes y con el estado correcto
    let modified = false;
    for (const fcEnsure of fiatCurrenciesToEnsure) {
      const existingFc = settings.supportedFiatCurrencies.find(fc => fc.code === fcEnsure.code);
      if (!existingFc) {
        settings.supportedFiatCurrencies.push(fcEnsure);
        modified = true;
      } else if (existingFc.isActive !== fcEnsure.isActive) {
        existingFc.isActive = fcEnsure.isActive;
        modified = true;
      }
    }
    if (modified) {
      await settings.save();
      console.log('AppSettings actualizadas con monedas fiat para la prueba.');
    }
    console.log('AppSettings encontradas y verificadas.');
  }
  return settings;
};

async function testRateUpdateService() {
  console.log('Iniciando prueba del servicio de actualización de tasas...');
  console.log('==================================================');
  await connectDB();
  await ensureAppSettings();

  console.log('\nLlamando a updateFiatExchangeRates...');
  await updateFiatExchangeRates();

  console.log('\nObteniendo AppSettings actualizadas para verificación...');
  const updatedSettings = await AppSettingsModel.findOne({ configIdentifier: 'global_settings' });
  if (updatedSettings && updatedSettings.currentExchangeRates) {
    console.log('Tasas actuales en AppSettings:');
    updatedSettings.currentExchangeRates.forEach((value, key) => {
      console.log(`${key}: Current=${value.currentRate}, Ask=${value.ask}, Bid=${value.bid}, Updated=${value.lastUpdated}`);
    });
  } else {
    console.log('No se pudieron recuperar las tasas actualizadas de AppSettings.');
  }

  console.log('==================================================');
  console.log('Prueba del servicio de actualización de tasas completada.');
  await mongoose.disconnect(); // Desconectar de la BD al final
  console.log('Desconectado de MongoDB.');
}

// Ejecutar la nueva prueba
testRateUpdateService().catch(error => {
  console.error('Error general en el script de prueba:', error);
  mongoose.disconnect().then(() => console.log('Desconectado de MongoDB tras error.'));
}); 