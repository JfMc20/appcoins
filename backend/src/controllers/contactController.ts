import { Request, Response, NextFunction } from 'express';
import ContactModel, { IContact } from '../models/ContactModel';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Controlador para crear un nuevo contacto
export const createContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, contactType, primaryEmail, primaryPhone, ...otherData } = req.body;

    // Validación básica (ejemplos)
    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'El nombre del contacto es obligatorio.' });
      return;
    }
    if (!contactType || !['client', 'provider', 'other'].includes(contactType)) {
       res.status(400).json({ message: 'El tipo de contacto (client, provider, other) es obligatorio y debe ser válido.' });
       return;
    }
    // TODO: Añadir más validaciones para email, phone, contactDetails, addresses, etc.

    // Opcional: Verificar duplicados (ej. por email principal si debe ser único)
    // if (primaryEmail) {
    //   const existingContact = await ContactModel.findOne({ primaryEmail });
    //   if (existingContact) {
    //      res.status(409).json({ message: `Conflicto: Ya existe un contacto con el email ${primaryEmail}` });
    //      return;
    //   }
    // }

    const newContactData: Partial<IContact> = {
        name: name.trim(),
        contactType,
        primaryEmail: primaryEmail?.trim().toLowerCase(),
        primaryPhone: primaryPhone?.trim(),
        status: otherData.status || 'active', // Usar status del body o 'active' por defecto
        ...otherData // Añadir resto de datos validados
    };

    // Opcional: Asociar con el usuario que lo crea si es necesario
    // if (req.user) {
    //   newContactData.userId = req.user.id;
    // }

    logger.info('Creando nuevo contacto con datos:', newContactData);
    const contact = new ContactModel(newContactData);
    const savedContact = await contact.save(); // Mongoose ejecutará validaciones del esquema aquí
    logger.info(`Contacto creado con ID: ${savedContact._id}`);
    res.status(201).json(savedContact);

  } catch (error: any) {
    logger.error('Error al crear contacto:', error);
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación al crear el contacto.', details: error.errors });
    // Error de índice único duplicado (si se configuran en el modelo)
    } else if (error.code === 11000) {
         res.status(409).json({ message: 'Conflicto: Ya existe un contacto con un valor único similar (ej. email o teléfono).', details: error.keyValue });
    } else {
      // Otros errores inesperados
      next(new Error('Ocurrió un error inesperado al crear el contacto.'));
    }
  }
};

// Controlador para obtener todos los contactos (con posible paginación/filtros)
export const getAllContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // --- Filtrado (Ejemplos) ---
    const { contactType, status, search } = req.query;
    const query: mongoose.FilterQuery<IContact> = {};

    // if (req.user) { // TODO: Verificar propiedad si aplica
    //   query.userId = req.user.id;
    // }

    if (contactType && typeof contactType === 'string') {
      query.contactType = contactType;
    }
    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i'); // Búsqueda case-insensitive
      query.$or = [ // Buscar en varios campos
        { name: searchRegex },
        { nickname: searchRegex },
        { primaryEmail: searchRegex },
        { companyName: searchRegex },
        // Podríamos añadir búsqueda en contactDetails.value si es necesario
        // { 'contactDetails.value': searchRegex } // Puede ser menos performante
      ];
    }

    // --- Paginación (Ejemplo básico) ---
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20; // Límite por defecto de 20
    const skip = (page - 1) * limit;

    logger.debug('Obteniendo contactos con query:', query, `Página: ${page}, Límite: ${limit}`);

    const contacts = await ContactModel.find(query)
                                       .sort({ createdAt: -1 }) // Ordenar por más recientes por defecto
                                       .skip(skip)
                                       .limit(limit);

    // Opcional: Obtener el conteo total para la paginación en el frontend
    const totalContacts = await ContactModel.countDocuments(query);

    res.status(200).json({
        data: contacts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalContacts / limit),
            totalItems: totalContacts,
            itemsPerPage: limit
        }
    });

  } catch (error) {
    logger.error('Error al obtener contactos:', error);
    next(new Error('Ocurrió un error inesperado al obtener los contactos.'));
  }
};

// Controlador para obtener un contacto por ID
export const getContactById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
       res.status(400).json({ message: 'ID de contacto inválido.' });
       return;
    }

    const query: mongoose.FilterQuery<IContact> = { _id: id };
    // if (req.user) { // TODO: Verificar propiedad si aplica
    //   query.userId = req.user.id;
    // }

    logger.debug(`Obteniendo contacto con ID: ${id}`);
    const contact = await ContactModel.findOne(query);

    if (!contact) {
      // Usar next con un error específico o enviar respuesta directamente
      // next(new Error(`Contacto con ID ${id} no encontrado.`)); // Esto usaría el globalErrorHandler
      res.status(404).json({ message: 'Contacto no encontrado.' }); // Respuesta directa
      return;
    }

    // if (!contact) { // Verificación de propiedad (si query incluyó userId)
    //    res.status(404).json({ message: 'Contacto no encontrado o no tienes permiso para verlo.' });
    //    return;
    // }

    res.status(200).json(contact);
  } catch (error) {
    logger.error(`Error al obtener contacto por ID ${req.params.id}:`, error);
    next(new Error('Ocurrió un error inesperado al obtener el contacto.'));
  }
};

// Controlador para actualizar un contacto por ID
export const updateContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
       res.status(400).json({ message: 'ID de contacto inválido.' });
       return;
    }

    // Validar/Sanitizar 'updates' aquí antes de usarlos
    // Ejemplo: asegurar que no se intenten actualizar campos protegidos como _id, createdAt
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    // delete updates.userId; // Si userId no debe cambiarse

    // TODO: Añadir validaciones más específicas para los campos permitidos en 'updates'

    const query: mongoose.FilterQuery<IContact> = { _id: id };
    // if (req.user) { // TODO: Verificar propiedad si aplica
    //   query.userId = req.user.id;
    // }

    logger.info(`Actualizando contacto con ID: ${id}...`, updates);
    // Usar findOneAndUpdate para aplicar la query de propiedad si es necesario
    const updatedContact = await ContactModel.findOneAndUpdate(
        query,
        updates,
        { new: true, runValidators: true } // new:true devuelve el doc actualizado, runValidators:true asegura validaciones del schema
    );

    if (!updatedContact) {
      // Si no se encontró o no se tuvo permiso (si query incluyó userId)
      res.status(404).json({ message: 'Contacto no encontrado o no tienes permiso para actualizarlo.' });
      return;
    }

    logger.info(`Contacto ${id} actualizado.`);
    res.status(200).json(updatedContact);

  } catch (error: any) {
    logger.error(`Error al actualizar contacto ${req.params.id}:`, error);
     if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Error de validación al actualizar', details: error.errors });
    } else if (error.code === 11000) {
         res.status(409).json({ message: 'Conflicto: El valor único (ej. email) ya está en uso por otro contacto.', details: error.keyValue });
    } else {
      next(new Error('Ocurrió un error inesperado al actualizar el contacto.'));
    }
  }
};

// Controlador para eliminar un contacto por ID
export const deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
       res.status(400).json({ message: 'ID de contacto inválido.' });
       return;
    }

    const query: mongoose.FilterQuery<IContact> = { _id: id };
    // if (req.user && req.user.role !== 'admin') { // Ejemplo: Solo admin puede borrar O propietario
    //   query.userId = req.user.id;
    // }

    logger.info(`Intentando eliminar contacto con ID: ${id}...`);
    // Usar findOneAndDelete para aplicar la query de propiedad/rol si es necesario
    const deletedContact = await ContactModel.findOneAndDelete(query);

    if (!deletedContact) {
      // Si no se encontró o no se tuvo permiso
      res.status(404).json({ message: 'Contacto no encontrado o no tienes permiso para eliminarlo.' });
      return;
    }

    logger.info(`Contacto ${id} eliminado.`);
    res.status(200).json({ message: 'Contacto eliminado exitosamente.' }); // Respuesta con mensaje

  } catch (error) {
    logger.error(`Error al eliminar contacto ${req.params.id}:`, error);
    next(new Error('Ocurrió un error inesperado al eliminar el contacto.'));
  }
}; 