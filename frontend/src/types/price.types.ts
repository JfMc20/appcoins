export interface Price {
  _id?: string; // El ID de MongoDB, opcional en la creación
  entityId: string; // ID de la entidad a la que pertenece el precio (ej. GameItem, ExternalProduct)
  entityType: string; // Tipo de la entidad (ej. "GameItem", "ExternalProduct")
  priceType: string; // Tipo de precio (ej. "cost", "base_sell", "promo_sell", "purchase_cost")
  currency: string; // Código de la moneda del precio (ej. "USD", "USDT", "EUR")
  value: number; // Valor numérico del precio
  isActive: boolean; // Si el precio está actualmente activo
  validFrom?: string | Date; // Fecha desde la cual el precio es válido (puede ser string o Date)
  validTo?: string | Date; // Fecha hasta la cual el precio es válido (puede ser string o Date)
  region?: string; // Para precios específicos por región (opcional)
  notes?: string; // Notas adicionales (opcional)
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Podríamos añadir enums aquí si queremos ser más estrictos con los tipos de precio o entidad en el frontend
// export enum PriceEntityType {
//   GAME_ITEM = 'GameItem',
//   EXTERNAL_PRODUCT = 'ExternalProduct',
// }

// export enum PriceTypeValues {
//   COST = 'cost',
//   BASE_SELL = 'base_sell',
//   PROMO_SELL = 'promo_sell',
//   PURCHASE_COST = 'purchase_cost',
// } 