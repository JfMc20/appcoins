import mongoose, { Schema, Document, Types } from 'mongoose';
// import { IUser } from './UserModel';
// import { IGame } from './GameModel';

export interface ISupportedFiatCurrency {
  code: string;
  symbol: string;
  name: string;
  isActive: boolean;
  apiSource?: string;
}

const SupportedFiatCurrencySchema: Schema<ISupportedFiatCurrency> = new Schema({
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  symbol: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  apiSource: { type: String, trim: true },
}, { _id: false });


interface IDefaultTransactionFees {
  type: 'percentage' | 'fixed';
  sellRate: number; // Valor de la comisión para ventas (ej: 0.05 para 5% o un monto fijo)
  buyRate: number;  // Valor de la comisión para compras
  currency?: string; // Moneda de la comisión si es fija (ej: "USDT")
}

const DefaultTransactionFeesSchema: Schema<IDefaultTransactionFees> = new Schema({
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  sellRate: { type: Number, required: true, min: 0 },
  buyRate: { type: Number, required: true, min: 0 },
  currency: { type: String, trim: true, uppercase: true },
}, { _id: false });


interface IExchangeRateAPI {
  name: string;
  apiKey?: string; // Debería manejarse de forma segura, no almacenarse directamente si es sensible
  baseUrl?: string;
  priority?: number;
  isEnabled: boolean;
}

const ExchangeRateAPISchema: Schema<IExchangeRateAPI> = new Schema({
  name: { type: String, required: true, trim: true },
  apiKey: { type: String, trim: true }, // Considerar cifrado o gestión externa
  baseUrl: { type: String, trim: true },
  priority: { type: Number, min: 0 },
  isEnabled: { type: Boolean, default: true },
}, { _id: false });


interface INotificationsSettings {
  lowStockAlertsEnabled: boolean;
  adminEmailForAlerts?: string;
}

const NotificationsSettingsSchema: Schema<INotificationsSettings> = new Schema({
  lowStockAlertsEnabled: { type: Boolean, default: true },
  adminEmailForAlerts: { type: String, trim: true, lowercase: true }, // Podría tener validación de email
}, { _id: false });


interface IBusinessInfo {
  name?: string;
  contactEmail?: string;
}

const BusinessInfoSchema: Schema<IBusinessInfo> = new Schema({
  name: { type: String, trim: true },
  contactEmail: { type: String, trim: true, lowercase: true },
}, { _id: false });

// Nuevo Sub-esquema para el detalle de una tasa de cambio actual
export interface ICurrentRateDetail {
  currentRate?: number;   // Tasa más reciente (ask o bid según estrategia)
  previousRate?: number; // Tasa anterior
  ask?: number;          // Tasa Ask (para referencia, si se almacena)
  bid?: number;          // Tasa Bid (para referencia, si se almacena)
  change?: number;      // Diferencia numérica (currentRate - previousRate)
  changePercent?: number; // Cambio porcentual
  lastUpdated?: Date;   // Fecha de currentRate
  source?: string;       // Fuente (ej: \'CriptoYa - Binance P2P\')
}

const CurrentRateDetailSchema: Schema<ICurrentRateDetail> = new Schema({
  currentRate: { type: Number },
  previousRate: { type: Number },
  ask: { type: Number },
  bid: { type: Number },
  change: { type: Number },
  changePercent: { type: Number },
  lastUpdated: { type: Date },
  source: { type: String, trim: true },
}, { _id: false });

export interface IAppSettings extends Document {
  configIdentifier: string; // ej: "global_settings"
  defaultReferenceCurrency: string;
  supportedFiatCurrencies: ISupportedFiatCurrency[];
  activeGameIds?: Types.ObjectId[]; // Referencias a Game
  defaultTransactionFees: IDefaultTransactionFees;
  exchangeRateAPIs?: IExchangeRateAPI[];
  currentExchangeRates?: Map<string, ICurrentRateDetail>; // Mapa para "USDT_VES" -> DetalleDeTasa
  notifications: INotificationsSettings;
  businessInfo?: IBusinessInfo;
  lastModifiedBy?: Types.ObjectId; // Referencia a User
  // createdAt y updatedAt son añadidos automáticamente por timestamps: true
}

const AppSettingsSchema: Schema<IAppSettings> = new Schema(
  {
    configIdentifier: {
      type: String,
      required: true,
      unique: true,
      default: 'global_settings',
      index: true,
    },
    defaultReferenceCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: 'USDT',
    },
    supportedFiatCurrencies: [SupportedFiatCurrencySchema],
    activeGameIds: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
    defaultTransactionFees: {
      type: DefaultTransactionFeesSchema,
      required: true,
    },
    exchangeRateAPIs: [ExchangeRateAPISchema],
    currentExchangeRates: {
      type: Map,
      of: CurrentRateDetailSchema,
      default: {},
    },
    notifications: {
      type: NotificationsSettingsSchema,
      required: true,
    },
    businessInfo: BusinessInfoSchema,
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const AppSettingsModel = mongoose.model<IAppSettings>(
  'AppSetting', // Mongoose pluralizará a 'appsettings'
  AppSettingsSchema
);

export default AppSettingsModel; 