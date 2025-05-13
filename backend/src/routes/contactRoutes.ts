import express from 'express';
import * as contactController from '../controllers/contactController';
import { protectWithJwt } from '../middleware/authMiddleware';

const router = express.Router();

// === Rutas de Contactos ===

// Aplicar protección JWT a todas las rutas de contactos
router.use(protectWithJwt);

// POST /api/contacts - Crear un nuevo contacto
router.post('/', contactController.createContact);

// GET /api/contacts - Obtener todos los contactos (potencialmente con filtros)
router.get('/', contactController.getAllContacts);

// GET /api/contacts/:id - Obtener un contacto por ID
router.get('/:id', contactController.getContactById);

// PUT /api/contacts/:id - Actualizar un contacto por ID
router.put('/:id', contactController.updateContact);

// DELETE /api/contacts/:id - Eliminar un contacto por ID
// La lógica de si solo admin puede borrar está ahora en el controlador
router.delete('/:id', contactController.deleteContact);

// TODO: Añadir rutas adicionales si son necesarias (ej. búsqueda, por tipo, etc.)

export default router; 