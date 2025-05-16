import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import TransactionModel, { ITransaction, ICapitalDeclarationEntry } from '../models/TransactionModel';
import FundingSourceModel, { IFundingSource } from '../models/FundingSourceModel';
import { logger } from '../utils/logger';
import { IUser } from '../models/UserModel'; // <--- CORREGIDO: Usar IUser
import { TransactionService } from '../services/transaction.service'; // +++ AÑADIR IMPORTACIÓN
import { AppError } from '../utils/errorHandler'; // +++ CORREGIR RUTA IMPORTACIÓN

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
    itemDetails, // +++ AÑADIR itemDetails
    paymentDetails, // +++ AÑADIR paymentDetails
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

    let savedTransaction: ITransaction | undefined;

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

      const txToCreate = { ...newTransactionData }; // Copiar para no modificar el original si no es necesario
      savedTransaction = await TransactionModel.create(txToCreate);

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

      savedTransaction = await TransactionModel.create(newTransactionData);

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

        savedTransaction = await TransactionModel.create(newTransactionData);

    // +++ NUEVA LÓGICA PARA TRANSACCIONES DE GAMEITEM USANDO EL SERVICIO +++
    } else if (type === 'COMPRA_ITEM_JUEGO') {
      if (!itemDetails || !paymentDetails) {
        throw new AppError('Para COMPRA_ITEM_JUEGO se requieren itemDetails y paymentDetails.', 400);
      }
      const contactIdToPass = contactId && (typeof contactId === 'object' && '_id' in contactId) ? (contactId as any)._id.toString() : contactId;
      savedTransaction = await TransactionService.processGameItemPurchase({
        operatorUserId: user.id,
        transactionDate: currentTransactionDate,
        itemDetails,
        paymentDetails,
        contactId: contactIdToPass,
        notes,
        status: status || 'completed',
      });
    } else if (type === 'VENTA_ITEM_JUEGO') {
      if (!itemDetails || !paymentDetails) {
        throw new AppError('Para VENTA_ITEM_JUEGO se requieren itemDetails y paymentDetails.', 400);
      }
      const contactIdToPass = contactId && (typeof contactId === 'object' && '_id' in contactId) ? (contactId as any)._id.toString() : contactId;
      savedTransaction = await TransactionService.processGameItemSale({
        operatorUserId: user.id,
        transactionDate: currentTransactionDate,
        itemDetails,
        paymentDetails,
        contactId: contactIdToPass,
        notes,
        status: status || 'completed',
      });
    // --- FIN DE NUEVA LÓGICA ---
    } else {
      const knownTypes = (TransactionModel.schema.path('type') as any).options.enum; // <--- CORREGIDO
      if (!knownTypes.includes(type)) {
        res.status(400).json({ message: `Tipo de transacción desconocido: ${type}` });
        return;
      }
      logger.info(`Procesando tipo de transacción general no cubierto por servicio: ${type}`);
      // Para otros tipos, asegurar que no se envíe capitalDeclaration si no aplica.
      const typesUsingCapitalDeclaration = ['DECLARACION_SALDO_INICIAL_CAPITAL', 'DECLARACION_OPERADOR_INICIO_DIA', 'AJUSTE_ADMIN_CAPITAL'];
      if (capitalDeclaration && !typesUsingCapitalDeclaration.includes(type)) { // <--- CORREGIDO
          delete newTransactionData.capitalDeclaration;
      }
      // Eliminar itemDetails y paymentDetails si no son relevantes para el tipo de transacción no cubierto por el servicio
      // Esta es una suposición, se necesitaría una lógica más específica por tipo si estos campos fueran usados por otros tipos.
      if (type !== 'COMPRA_PRODUCTO_EXTERNO' && type !== 'VENTA_PRODUCTO_EXTERNO') { // Ejemplo, ajustar según necesidad
          delete newTransactionData.itemDetails;
          delete newTransactionData.paymentDetails;
      }

      // La lógica genérica de actualización de paymentSource se elimina de aquí,
      // ya que los tipos que implican pagos complejos deben ser manejados por el servicio
      // o tener su propio bloque 'else if'.

      savedTransaction = await TransactionModel.create(newTransactionData);
    }

    if (!savedTransaction) {
      // Esto no debería ocurrir si todos los flujos asignan a savedTransaction o retornan/tiran error.
      logger.error(`Transacción tipo [${type}] no resultó en un documento guardado.`);
      throw new AppError('No se pudo procesar la transacción.', 500);
    }

    logger.info(`Transacción [${type}] procesada con ID: ${savedTransaction._id} por usuario [${user.id}]`);
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

// Obtener todas las transacciones con paginación
export const getAllTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user as IUser;
  logger.info(`Usuario [${user?.id} (${user?.role})] solicitando lista de transacciones.`);

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20; // Ajustar el límite por defecto según necesidad
    const skip = (page - 1) * limit;

    // Filtro base: Por ahora, un admin ve todas, un operador solo las suyas.
    // Esto se puede refinar más adelante con filtros más complejos.
    const queryFilter = user.role === 'admin' ? {} : { operatorUserId: user.id };

    const transactions = await TransactionModel.find(queryFilter)
      .sort({ transactionDate: -1, createdAt: -1 }) // Priorizar transactionDate, luego createdAt
      // .populate('operatorUserId', 'username email') // Ejemplo de populate, lo añadiremos si es necesario
      // .populate('contactId', 'name nickname') // Ejemplo
      // .populate('capitalDeclaration.fundingSourceId', 'name currency') // Ejemplo
      // .populate('paymentDetails.fundingSourceId', 'name currency') // Ejemplo
      // .populate('itemDetails.itemId', 'name') // Ejemplo
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() para obtener objetos JS planos, puede ser más rápido si no se necesitan métodos de Mongoose

    const totalItems = await TransactionModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
    logger.info(`Lista de transacciones enviada al usuario [${user?.id}]. Página: ${page}, Límite: ${limit}, Total: ${totalItems}`);

  } catch (error: any) {
    logger.error(`Error al obtener lista de transacciones para usuario [${user?.id}]:`, error);
    next(error);
  }
};

// Aquí podrían ir otras funciones como getTransactionById, updateTransaction, etc.
// export const getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => { ... } 