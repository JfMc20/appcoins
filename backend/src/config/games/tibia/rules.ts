import { TIBIA_CONSTANTS } from './constants';

export const validateTibiaCoinsAmount = (amount: number): boolean => {
  return amount % TIBIA_CONSTANTS.CURRENCY_MULTIPLIER === 0;
};

export const validateTibiaCoinsTransaction = (amount: number): { isValid: boolean; message?: string } => {
  // Validar que sea un número válido
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      message: 'La cantidad debe ser un número positivo'
    };
  }

  // Validar cantidad mínima
  if (amount < TIBIA_CONSTANTS.MIN_TRANSACTION_AMOUNT) {
    return {
      isValid: false,
      message: `La cantidad mínima de Tibia Coins es ${TIBIA_CONSTANTS.MIN_TRANSACTION_AMOUNT}`
    };
  }

  // Validar cantidad máxima
  if (amount > TIBIA_CONSTANTS.MAX_TRANSACTION_AMOUNT) {
    return {
      isValid: false,
      message: `La cantidad máxima de Tibia Coins es ${TIBIA_CONSTANTS.MAX_TRANSACTION_AMOUNT}`
    };
  }

  // Validar múltiplo de 25
  if (!validateTibiaCoinsAmount(amount)) {
    const remainder = amount % TIBIA_CONSTANTS.CURRENCY_MULTIPLIER;
    const nextValidAmount = Math.ceil(amount / TIBIA_CONSTANTS.CURRENCY_MULTIPLIER) * TIBIA_CONSTANTS.CURRENCY_MULTIPLIER;
    const prevValidAmount = Math.floor(amount / TIBIA_CONSTANTS.CURRENCY_MULTIPLIER) * TIBIA_CONSTANTS.CURRENCY_MULTIPLIER;

    return {
      isValid: false,
      message: `La cantidad debe ser múltiplo de ${TIBIA_CONSTANTS.CURRENCY_MULTIPLIER}. ` +
               `Cantidad actual: ${amount} TC. ` +
               `Sugerencias: ${prevValidAmount} TC o ${nextValidAmount} TC`
    };
  }

  return { isValid: true };
};

// Función para obtener el siguiente múltiplo válido de 25
export const getNextValidTibiaCoinsAmount = (amount: number): number => {
  return Math.ceil(amount / TIBIA_CONSTANTS.CURRENCY_MULTIPLIER) * TIBIA_CONSTANTS.CURRENCY_MULTIPLIER;
};

// Función para obtener el múltiplo anterior válido de 25
export const getPreviousValidTibiaCoinsAmount = (amount: number): number => {
  return Math.floor(amount / TIBIA_CONSTANTS.CURRENCY_MULTIPLIER) * TIBIA_CONSTANTS.CURRENCY_MULTIPLIER;
}; 