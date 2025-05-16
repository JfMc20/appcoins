// Definición para las monedas fiat soportadas, usada en el frontend.
export interface SupportedCurrency {
  code: string; // Ej: "VES", "COP"
  symbol: string; // Ej: "Bs.", "$"
  name: string; // Ej: "Bolívar Venezolano", "Peso Colombiano"
  isActive: boolean;
  apiSource?: string; // De dónde se obtiene la tasa (ej: "CriptoYa")
}

// Detalle de una tasa de cambio actual para mostrar en el frontend
export interface CurrentRateDetail {
  currentRate?: number;
  previousRate?: number;
  ask?: number;
  bid?: number;
  change?: number;
  changePercent?: number;
  lastUpdated?: string | Date; // Se puede recibir como string y convertir a Date si es necesario
  source?: string;
}

// Comisiones por defecto para transacciones
export interface DefaultTransactionFees {
  type: 'percentage' | 'fixed';
  sellRate: number;
  buyRate: number;
  currency?: string; // Moneda si la comisión es fija
}

// Configuración de APIs externas para tasas de cambio
export interface ExchangeRateAPI {
  name: string;
  apiKey?: string; // Considerar si se debe exponer al frontend
  baseUrl?: string;
  priority?: number;
  isEnabled: boolean;
}

// Configuración de notificaciones
export interface NotificationsSettings {
  lowStockAlertsEnabled: boolean;
  adminEmailForAlerts?: string;
}

// Información del negocio
export interface BusinessInfo {
  name?: string;
  contactEmail?: string;
}

// Interfaz principal para AppSettings en el frontend
export interface AppSettings {
  _id?: string; // El ID de MongoDB
  configIdentifier: string;
  defaultReferenceCurrency: string;
  supportedFiatCurrencies: SupportedCurrency[];
  activeGameIds?: string[]; // IDs de juegos, se reciben como string
  defaultTransactionFees: DefaultTransactionFees;
  exchangeRateAPIs?: ExchangeRateAPI[];
  currentExchangeRates?: Record<string, CurrentRateDetail>; // Usar Record para el mapa
  notifications: NotificationsSettings;
  businessInfo?: BusinessInfo;
  lastModifiedBy?: string; // ID del usuario, se recibe como string
  createdAt?: string | Date;
  updatedAt?: string | Date;
} 