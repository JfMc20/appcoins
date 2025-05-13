import { Request, Response, NextFunction } from 'express';
import FundingSourceModel, { IFundingSource } from '../models/FundingSourceModel';
import TransactionModel from '../models/TransactionModel';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
// import { IUser } from '../models/UserModel'; // No necesitamos IUser aquí si usamos req.user

/**
 * Crea una nueva fuente de fondos.
 * Asigna la fuente al usuario autenticado (req.user.id).
 */
export const createFundingSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }
  
  const { name, currency, type, typeSpecificDetails, currentBalance, notes, status } = req.body;
  // Log para verificar el valor y tipo de currentBalance recibido (ahora sí debería funcionar)
  logger.info(`[createFundingSource] Recibido - currentBalance: ${currentBalance}, typeof: ${typeof currentBalance}`);
  
  const userId = req.user.id; // <<< Obtener userId del usuario autenticado
  const operatorUserId = req.user.id; // El operador que crea la fuente es el mismo usuario

  try {
    logger.info(`Usuario [${userId}] creando nueva fuente de fondos: ${name} (${currency})`);

    const newFundingSource = new FundingSourceModel({
      userId: userId, // <<< Usar ID de usuario autenticado
      name,
      currency: currency?.toUpperCase(),
      type,
      currentBalance: Number(currentBalance) || 0,
      typeSpecificDetails: typeSpecificDetails || {},
      notes,
      status: status || 'active',
    });

    const savedFundingSource = await newFundingSource.save();
    logger.info(`Fuente de fondos creada con ID: ${savedFundingSource._id} por usuario ${userId}`);

    // Si hay un saldo inicial, crear la transacción correspondiente
    if (currentBalance && Number(currentBalance) > 0) {
      const balanceValue = Number(currentBalance);
      logger.info(`Registrando saldo inicial de ${balanceValue} ${currency} para la fuente ${savedFundingSource._id}`);
      const initialBalanceTransaction = new TransactionModel({
        transactionDate: new Date(),
        type: 'DECLARACION_SALDO_INICIAL_CAPITAL',
        operatorUserId: operatorUserId, // <<< Usar ID de usuario autenticado
        capitalDeclaration: [
          {
            fundingSourceId: savedFundingSource._id,
            declaredBalance: balanceValue,
            currency: savedFundingSource.currency,
          },
        ],
        paymentDetails: {
            fundingSourceId: savedFundingSource._id,
            amount: balanceValue,
            currency: savedFundingSource.currency,
            valueInReferenceCurrency: {
                amount: balanceValue,
                currency: savedFundingSource.currency,
            }
        },
        status: 'completed',
        notes: `Declaración de saldo inicial para la nueva fuente de fondos: ${name}`,
      });
      await initialBalanceTransaction.save();
      logger.info(`Transacción de saldo inicial creada con ID: ${initialBalanceTransaction._id} para la fuente ${savedFundingSource._id}`);
    }

    res.status(201).json(savedFundingSource);

  } catch (error: any) {
    logger.error(`Error al crear fuente de fondos por usuario ${userId}:`, error.message);
    if (error.code === 11000) {
      res.status(409).json({ message: 'Conflicto. Ya existe una fuente de fondos con un valor único similar (ej. nombre para este usuario).', details: error.keyValue });
      return;
    }
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación', details: error.errors });
      return;
    }
    next(error);
  }
};

/**
 * Obtiene las fuentes de fondos del usuario autenticado (o todas si es admin).
 */
export const getAllFundingSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const { status, currency, type } = req.query; // Filtros desde query params
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;

  const query: any = {};
  
  // Por defecto, filtrar por el usuario autenticado
  // TODO: Permitir que un admin vea todas si no se pasa userId explícito o si se añade un flag all=true
  query.userId = authenticatedUserId; 

  // Aplicar filtros adicionales
  if (status) query.status = status;
  if (currency) query.currency = String(currency).toUpperCase();
  if (type) query.type = type;

  try {
    logger.debug(`Usuario [${authenticatedUserId}] obteniendo fuentes de fondos con query:`, query);
    // No populamos userId aquí porque ya lo filtramos y tenemos el ID
    const fundingSources = await FundingSourceModel.find(query); 
    
    res.status(200).json(fundingSources);
  } catch (error) {
    logger.error(`Error al obtener fuentes de fondos para usuario ${authenticatedUserId}:`, error);
    next(error);
  }
};

/**
 * Obtiene solo las fuentes de fondos activas del usuario autenticado.
 */
export const getActiveFundingSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const authenticatedUserId = req.user.id;

  const query: any = {
    userId: authenticatedUserId,
    status: 'active' // Filtrar siempre por activas
  };

  try {
    logger.debug(`Usuario [${authenticatedUserId}] obteniendo fuentes de fondos activas con query:`, query);
    const fundingSources = await FundingSourceModel.find(query);
    res.status(200).json(fundingSources);
  } catch (error) {
    logger.error(`Error al obtener fuentes de fondos activas para usuario ${authenticatedUserId}:`, error);
    next(error);
  }
};

/**
 * Obtiene las fuentes de fondos del usuario autenticado filtradas por tipo.
 */
export const getFundingSourcesByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const { type } = req.params; // Obtener tipo desde URL params
  const authenticatedUserId = req.user.id;

  const query: any = {
    userId: authenticatedUserId,
    type: type // Filtrar por tipo
  };

  // Opcionalmente, podríamos añadir más filtros desde req.query si fuera necesario
  // if (req.query.status) query.status = req.query.status;

  try {
    logger.debug(`Usuario [${authenticatedUserId}] obteniendo fuentes de fondos tipo [${type}] con query:`, query);
    const fundingSources = await FundingSourceModel.find(query);
    res.status(200).json(fundingSources);
  } catch (error) {
    logger.error(`Error al obtener fuentes de fondos tipo [${type}] para usuario ${authenticatedUserId}:`, error);
    next(error);
  }
};

/**
 * Obtiene las fuentes de fondos del usuario autenticado filtradas por moneda.
 */
export const getFundingSourcesByCurrency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const { currency } = req.params; // Obtener moneda desde URL params
  const authenticatedUserId = req.user.id;

  const query: any = {
    userId: authenticatedUserId,
    currency: String(currency).toUpperCase() // Filtrar por moneda (asegurar mayúsculas)
  };

  // Opcionalmente, añadir más filtros desde req.query
  // if (req.query.status) query.status = req.query.status;

  try {
    logger.debug(`Usuario [${authenticatedUserId}] obteniendo fuentes de fondos moneda [${currency.toUpperCase()}] con query:`, query);
    const fundingSources = await FundingSourceModel.find(query);
    res.status(200).json(fundingSources);
  } catch (error) {
    logger.error(`Error al obtener fuentes de fondos moneda [${currency.toUpperCase()}] para usuario ${authenticatedUserId}:`, error);
    next(error);
  }
};

/**
 * Obtiene una fuente de fondos específica por ID.
 * Verifica que la fuente pertenezca al usuario autenticado (o si el usuario es admin).
 */
export const getFundingSourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const { id } = req.params;
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
     res.status(400).json({ message: 'ID de fuente de fondos inválido.' });
     return;
  }

  try {
    const fundingSource = await FundingSourceModel.findById(id);

    if (!fundingSource) {
      res.status(404).json({ message: 'Fuente de fondos no encontrada.' });
      return;
    }

    // Verificar propiedad (o si es admin)
    if (fundingSource.userId.toString() !== authenticatedUserId && userRole !== 'admin') {
      logger.warn(`Usuario [${authenticatedUserId}] intentó acceder a fuente [${id}] que no le pertenece.`);
      res.status(403).json({ message: 'Acceso prohibido. No tienes permiso para ver esta fuente de fondos.' });
      return;
    }

    logger.debug(`Usuario [${authenticatedUserId}] obtuvo fuente de fondos [${id}]`);
    res.status(200).json(fundingSource);

  } catch (error) {
    logger.error(`Error al obtener fuente de fondos [${id}] para usuario [${authenticatedUserId}]:`, error);
    next(error);
  }
};

/**
 * Actualiza una fuente de fondos existente.
 * No permite modificar directamente currentBalance.
 * Verifica propiedad o rol de admin.
 */
export const updateFundingSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const { id } = req.params;
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;
  const updates = req.body; // Campos a actualizar

  // Campos que NO permitiremos actualizar directamente a través de este endpoint
  const forbiddenUpdates = ['userId', 'currentBalance', 'createdAt', 'updatedAt', '_id'];
  for (const key of forbiddenUpdates) {
    if (updates.hasOwnProperty(key)) {
      delete updates[key]; // Eliminar campos prohibidos del objeto de actualización
      logger.warn(`Usuario [${authenticatedUserId}] intentó actualizar campo prohibido [${key}] en fuente [${id}].`);
    }
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de fuente de fondos inválido.' });
    return;
  }

  try {
    const fundingSource = await FundingSourceModel.findById(id);

    if (!fundingSource) {
      res.status(404).json({ message: 'Fuente de fondos no encontrada.' });
      return;
    }

    // Verificar propiedad (o si es admin)
    if (fundingSource.userId.toString() !== authenticatedUserId && userRole !== 'admin') {
      logger.warn(`Usuario [${authenticatedUserId}] intentó actualizar fuente [${id}] que no le pertenece.`);
      res.status(403).json({ message: 'Acceso prohibido. No tienes permiso para modificar esta fuente de fondos.' });
      return;
    }

    // Aplicar actualizaciones
    Object.assign(fundingSource, updates);

    // Si se actualiza typeSpecificDetails, asegurar que se maneje correctamente (Mongoose debería hacerlo)

    const updatedFundingSource = await fundingSource.save(); // save() dispara validaciones y middleware pre-save si hubiera

    logger.info(`Usuario [${authenticatedUserId}] actualizó fuente de fondos [${id}]`);
    res.status(200).json(updatedFundingSource);

  } catch (error: any) {
    logger.error(`Error al actualizar fuente de fondos [${id}] por usuario [${authenticatedUserId}]:`, error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación al actualizar', details: error.errors });
      return;
    }
    if (error.code === 11000) { // Podría haber conflicto si se cambia 'name' a uno ya existente para ese user
      res.status(409).json({ message: 'Conflicto. El nombre ya está en uso por otra fuente tuya.', details: error.keyValue });
      return;
    }
    next(error);
  }
};

/**
 * Marca una fuente de fondos como 'archived'.
 * Verifica propiedad o rol de admin.
 */
export const archiveFundingSource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const { id } = req.params;
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID de fuente de fondos inválido.' });
    return;
  }

  try {
    const fundingSource = await FundingSourceModel.findById(id);

    if (!fundingSource) {
      res.status(404).json({ message: 'Fuente de fondos no encontrada.' });
      return;
    }

    // Verificar propiedad (o si es admin)
    if (fundingSource.userId.toString() !== authenticatedUserId && userRole !== 'admin') {
      logger.warn(`Usuario [${authenticatedUserId}] intentó archivar fuente [${id}] que no le pertenece.`);
      res.status(403).json({ message: 'Acceso prohibido. No tienes permiso para archivar esta fuente de fondos.' });
      return;
    }
    
    // Verificar si ya está archivada para evitar trabajo innecesario
    if (fundingSource.status === 'archived') {
      res.status(200).json(fundingSource); // Ya está archivada, devolver estado actual
      return;
    }

    // Marcar como archivada
    fundingSource.status = 'archived';
    fundingSource.isOperating = false; // También marcar como no operativa
    
    const updatedFundingSource = await fundingSource.save();

    logger.info(`Usuario [${authenticatedUserId}] archivó fuente de fondos [${id}]`);
    // Devolver el objeto actualizado podría ser útil para el frontend
    res.status(200).json(updatedFundingSource); 

  } catch (error: any) {
    logger.error(`Error al archivar fuente de fondos [${id}] por usuario [${authenticatedUserId}]:`, error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación al archivar', details: error.errors });
      return;
    }
    next(error);
  }
}; 