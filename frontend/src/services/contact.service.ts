import api from './api';
import {
  Contact,
  PaginatedContactsResponse,
  GetContactsParams,
  CreateContactData,
  UpdateContactData,
  ContactResponse, // Asumiendo que getById, create, update devuelven un Contacto
  DeleteResponse
} from '../types/contact.types';

const CONTACTS_PATH = '/contacts';

// Obtener todos los contactos con filtros y paginación
const getAllContacts = (params?: GetContactsParams): Promise<PaginatedContactsResponse> => {
  // Limpiar parámetros vacíos para no enviar queries como ?search=
  const cleanedParams: Record<string, any> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        cleanedParams[key] = value;
      }
    });
  }
  return api.get<PaginatedContactsResponse>(CONTACTS_PATH, { params: cleanedParams })
    .then(response => response.data);
};

// Obtener un contacto por ID
const getContactById = (id: string): Promise<ContactResponse> => {
  return api.get<ContactResponse>(`${CONTACTS_PATH}/${id}`)
    .then(response => response.data);
};

// Crear un nuevo contacto
const createContact = (data: CreateContactData): Promise<ContactResponse> => {
  return api.post<ContactResponse>(CONTACTS_PATH, data)
    .then(response => response.data);
};

// Actualizar un contacto existente
const updateContact = (id: string, data: UpdateContactData): Promise<ContactResponse> => {
  return api.put<ContactResponse>(`${CONTACTS_PATH}/${id}`, data)
    .then(response => response.data);
};

// Eliminar un contacto
const deleteContact = (id: string): Promise<DeleteResponse> => {
  return api.delete<DeleteResponse>(`${CONTACTS_PATH}/${id}`)
    .then(response => response.data);
};

const contactService = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};

export default contactService; 