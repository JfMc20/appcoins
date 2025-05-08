import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import TransactionModel, { ITransaction, ICapitalDeclarationEntry } from '../models/TransactionModel';
import FundingSourceModel, { IFundingSource } from '../models/FundingSourceModel';
import { logger } from '../utils/logger';
import { IUser } from '../models/UserModel'; // <--- CORREGIDO: Usar IUser

// Helper para obtener el inicio y fin de un día
const getStartAndEndOfDay = (date: Date): { startOfDay: Date; endOfDay: Date } => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user as IUser; // <--- CORREGIDO: Tipar con IUser

  if (!user) {
    res.status(401).json({ message: 'No autorizado, usuario no encontrado en la request.' });
    return;
  }

  const {
    type,
    transactionDate, // El cliente podría enviarla, o la tomamos del servidor
    capitalDeclaration, // Array de { fundingSourceId, declaredBalance, currency }
    // ... otros campos comunes de la transacción como notes, contactId, etc.
    notes,
    contactId,
    status, // Podría venir del cliente o definirse aquí.
  } = req.body as ITransaction;

  const currentTransactionDate = transactionDate ? new Date(transactionDate) : new Date();

  try {
    logger.info(`Usuario [${user.id} (${user.role})] intentando crear transacción tipo [${type}]`);

    let newTransactionData: Partial<ITransaction> = {
      ...req.body,
      operatorUserId: user.id,
      transactionDate: currentTransactionDate,
      status: status || 'completed', // Default a completed si no se especifica
    };

    // Lógica específica por tipo de transacción
    if (type === 'DECLARACION_OPERADOR_INICIO_DIA') {
      if (user.role !== 'operator' && user.role !== 'admin') {
        logger.warn(`Usuario [${user.id}] con rol [${user.role}] intentó crear DECLARACION_OPERADOR_INICIO_DIA sin permisos.`);
        res.status(403).json({ message: 'No tienes permiso para realizar este tipo de transacción.' });
        return;
      }

      if (!capitalDeclaration || capitalDeclaration.length !== 1) {
        res.status(400).json({ message: 'DECLARACION_OPERADOR_INICIO_DIA requiere exactamente una entrada en capitalDeclaration.' });
        return;
      }

      const declarationEntry = capitalDeclaration[0];
      if (!declarationEntry.fundingSourceId || typeof declarationEntry.declaredBalance !== 'number') {
        res.status(400).json({ message: 'Datos de la declaración de capital incompletos o inválidos.' });
        return;
      }
      
      const { startOfDay, endOfDay } = getStartAndEndOfDay(currentTransactionDate);

      const existingDeclaration = await TransactionModel.findOne({
        operatorUserId: user.id,
        type: 'DECLARACION_OPERADOR_INICIO_DIA',
        'capitalDeclaration.0.fundingSourceId': declarationEntry.fundingSourceId, // Asumimos que es la primera y única
        transactionDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (existingDeclaration) {
        logger.warn(`Usuario [${user.id}] intentó crear una DECLARACION_OPERADOR_INICIO_DIA duplicada para la fuente [${declarationEntry.fundingSourceId}] en fecha [${currentTransactionDate.toISOString().slice(0,10)}].`);
        res.status(409).json({ message: 'Ya existe una declaración de inicio de día para esta fuente de fondos y operador en esta fecha.' });
        return;
      }
      
      // Proceder a actualizar la fuente de fondos
      const fundingSourceToUpdate = await FundingSourceModel.findById(declarationEntry.fundingSourceId);
      if (!fundingSourceToUpdate) {
        res.status(404).json({ message: `Fuente de fondos con ID [${declarationEntry.fundingSourceId}] no encontrada.` });
        return;
      }
      if (fundingSourceToUpdate.userId.toString() !== user.id && user.role !== 'admin') {
         // Un operador solo puede declarar sobre sus propias fuentes, un admin podría hacerlo si se define así.
         // Por ahora, un operador solo sobre las suyas.
        logger.warn(`Operador [${user.id}] intentó declarar saldo en fuente [${declarationEntry.fundingSourceId}] que no le pertenece.`);
        res.status(403).json({ message: 'No tienes permiso para declarar saldo en esta fuente de fondos.' });
        return;
      }

      const previousBalance = fundingSourceToUpdate.currentBalance;
      fundingSourceToUpdate.currentBalance = declarationEntry.declaredBalance;
      // Aquí podríamos también actualizar fundingSourceToUpdate.lastTransactionDate si es relevante
      await fundingSourceToUpdate.save();
      logger.info(`Saldo de FundingSource [${fundingSourceToUpdate.id}] actualizado a ${fundingSourceToUpdate.currentBalance} (antes: ${previousBalance}) por DECLARACION_OPERADOR_INICIO_DIA.`);
      
      // Aseguramos que la transacción guarde el previousBalance
      newTransactionData.capitalDeclaration = [{
        ...declarationEntry,
        previousBalance: previousBalance,
        currency: fundingSourceToUpdate.currency, // Asegurar la moneda de la fuente
      }];
      // Otros campos como paymentDetails no aplicarían directamente aquí

    } else if (type === 'AJUSTE_ADMIN_CAPITAL') {
      if (user.role !== 'admin') {
        logger.warn(`Usuario [${user.id}] con rol [${user.role}] intentó crear AJUSTE_ADMIN_CAPITAL sin ser admin.`);
        res.status(403).json({ message: 'Solo los administradores pueden realizar ajustes de capital.' });
        return;
      }

      if (!capitalDeclaration || capitalDeclaration.length === 0) {
        res.status(400).json({ message: 'AJUSTE_ADMIN_CAPITAL requiere al menos una entrada en capitalDeclaration.' });
        return;
      }

      const updatedCapitalDeclarations: ICapitalDeclarationEntry[] = [];

      for (const entry of capitalDeclaration) {
        if (!entry.fundingSourceId || typeof entry.declaredBalance !== 'number') {
          res.status(400).json({ message: `Datos de la declaración de capital incompletos o inválidos para la fuente ${entry.fundingSourceId}.` });
          // Podríamos optar por continuar con las otras o fallar todo. Aquí fallamos todo.
          return;
        }
        const fundingSourceToUpdate = await FundingSourceModel.findById(entry.fundingSourceId);
        if (!fundingSourceToUpdate) {
          res.status(404).json({ message: `Fuente de fondos con ID [${entry.fundingSourceId}] no encontrada.` });
          return; 
        }
        // Para AJUSTE_ADMIN_CAPITAL, el admin puede ajustar cualquier fuente.
        // No hay chequeo de fundingSourceToUpdate.userId === user.id aquí.

        const previousBalance = fundingSourceToUpdate.currentBalance;
        fundingSourceToUpdate.currentBalance = entry.declaredBalance;
        await fundingSourceToUpdate.save();
        logger.info(`Saldo de FundingSource [${fundingSourceToUpdate.id}] actualizado a ${fundingSourceToUpdate.currentBalance} (antes: ${previousBalance}) por AJUSTE_ADMIN_CAPITAL.`);
        
        updatedCapitalDeclarations.push({
          ...entry,
          previousBalance: previousBalance,
          currency: fundingSourceToUpdate.currency, // Asegurar la moneda de la fuente
        });
      }
      newTransactionData.capitalDeclaration = updatedCapitalDeclarations;
      // Otros campos como paymentDetails no aplicarían directamente aquí

    } else if (type === 'DECLARACION_SALDO_INICIAL_CAPITAL') {
        // Lógica similar a AJUSTE_ADMIN_CAPITAL, pero podría tener diferentes permisos o usos.
        // Por ahora, asumimos que solo admin puede hacerlo y es similar a un ajuste.
        if (user.role !== 'admin') {
            logger.warn(`Usuario [${user.id}] con rol [${user.role}] intentó crear DECLARACION_SALDO_INICIAL_CAPITAL sin ser admin.`);
            res.status(403).json({ message: 'Solo los administradores pueden realizar este tipo de declaración.' });
            return;
        }
        if (!capitalDeclaration || capitalDeclaration.length === 0) {
            res.status(400).json({ message: 'DECLARACION_SALDO_INICIAL_CAPITAL requiere al menos una entrada.' });
            return;
        }
        const updatedEntries: ICapitalDeclarationEntry[] = [];
        for (const entry of capitalDeclaration) {
            const fs = await FundingSourceModel.findById(entry.fundingSourceId);
            if (!fs) {
                 res.status(404).json({ message: `Fuente ${entry.fundingSourceId} no encontrada.`});
                 return;
            }
            const prevBalance = fs.currentBalance;
            fs.currentBalance = entry.declaredBalance;
            await fs.save();
            updatedEntries.push({ ...entry, previousBalance: prevBalance, currency: fs.currency });
        }
        newTransactionData.capitalDeclaration = updatedEntries;

    } else {
      // Manejo para otros tipos de transacciones (COMPRA, VENTA, etc.)
      // Esta lógica se desarrollará en futuras fases.
      // Por ahora, si no es un tipo de declaración de capital, podríamos no hacer nada específico aquí
      // o verificar si es un tipo conocido y si no, error.
      const knownTypes = (TransactionModel.schema.path('type') as any).options.enum; // <--- CORREGIDO
      if (!knownTypes.includes(type)) {
        res.status(400).json({ message: `Tipo de transacción desconocido: ${type}` });
        return;
      }
      logger.info(`Procesando tipo de transacción general: ${type}`);
      // Para otros tipos, asegurar que no se envíe capitalDeclaration si no aplica.
      const typesUsingCapitalDeclaration = ['DECLARACION_SALDO_INICIAL_CAPITAL', 'DECLARACION_OPERADOR_INICIO_DIA', 'AJUSTE_ADMIN_CAPITAL'];
      if (capitalDeclaration && !typesUsingCapitalDeclaration.includes(type)) { // <--- CORREGIDO
          delete newTransactionData.capitalDeclaration;
      }

      // Aquí iría la lógica para paymentDetails, itemDetails, profitDetails, etc.
      // Por ejemplo, si hay paymentDetails, actualizar la fundingSource correspondiente (aumentar o disminuir saldo)
      // Esta parte es compleja y depende mucho del 'type'.
      // Ejemplo muy básico para un paymentDetails genérico (necesita mucha más lógica):
      if (newTransactionData.paymentDetails && newTransactionData.paymentDetails.fundingSourceId && typeof newTransactionData.paymentDetails.amount === 'number') {
          const paymentSource = await FundingSourceModel.findById(newTransactionData.paymentDetails.fundingSourceId);
          if (!paymentSource) {
              res.status(404).json({ message: `Fuente de fondos del pago ${newTransactionData.paymentDetails.fundingSourceId} no encontrada.`});
              return;
          }
          // Asumimos que 'amount' en paymentDetails es el cambio neto. 
          // Positivo si es ingreso a la fuente, negativo si es egreso.
          // Se necesita una lógica más clara sobre si 'amount' es siempre positivo y el 'type' define el flujo.
          // Por simplicidad aquí, asumimos que 'amount' puede ser negativo.
          paymentSource.currentBalance += newTransactionData.paymentDetails.amount; 
          await paymentSource.save();
          logger.info(`Saldo de FundingSource [${paymentSource.id}] actualizado a ${paymentSource.currentBalance} por transacción tipo [${type}].`);
          newTransactionData.paymentDetails.fundingSourceBalanceBefore = paymentSource.currentBalance - newTransactionData.paymentDetails.amount;
          newTransactionData.paymentDetails.fundingSourceBalanceAfter = paymentSource.currentBalance;
      }

    }

    const savedTransaction = await TransactionModel.create(newTransactionData);
    logger.info(`Transacción [${type}] creada con ID: ${savedTransaction._id} por usuario [${user.id}]`);
    res.status(201).json(savedTransaction);

  } catch (error: any) {
    logger.error(`Error al crear transacción tipo [${type}] por usuario [${user.id}]:`, error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación al crear la transacción.', details: error.errors });
    } else if (error.code === 11000) { // Errores de índice único (si aplica)
      res.status(409).json({ message: 'Error de conflicto al crear la transacción.', details: error.keyValue });
    } else {
      next(error); // Pasar a middleware de error genérico
    }
  }
};

// Aquí podrían ir otras funciones como getTransactionById, getAllTransactions, updateTransaction, etc.
// export const getAllTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => { ... }
// export const getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => { ... } 