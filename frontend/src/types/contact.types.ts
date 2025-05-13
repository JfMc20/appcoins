import { FundingSource } from "./fundingSource.types"; // Importar si se vincula con fuentes

// Interfaces para subdocumentos del frontend
export interface ContactDetail {
  type: 'email' | 'phone' | 'whatsapp' | 'telegram' | 'discord' | 'game_username' | 'other';
  value: string;
  label?: string;
  isPrimary?: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  label?: string; 
}

// Interfaz principal para Contact en el frontend
export interface Contact {
  _id: string; // En el frontend, asumimos que siempre tendremos _id después de obtenerlo
  // userId?: string; // A qué usuario del sistema pertenece este contacto (si aplica en el futuro)
  contactType: 'client' | 'provider' | 'other'; 
  name: string; 
  nickname?: string; 
  primaryEmail?: string; 
  primaryPhone?: string; 
  companyName?: string; 
  taxId?: string; 
  contactDetails?: ContactDetail[]; 
  addresses?: Address[]; 
  status: 'active' | 'inactive' | 'potential' | 'blocked';
  notes?: string;
  createdAt: string; // Usar string para fechas ISO del backend
  updatedAt: string;
  // Podríamos añadir campos calculados o relaciones si es necesario
  // relatedTransactions?: Transaction[]; // Ejemplo
}

// Tipo para la respuesta de paginación de getAllContacts
export interface PaginatedContactsResponse {
  data: Contact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Tipo para los parámetros de consulta de getAllContacts
export interface GetContactsParams {
  page?: number;
  limit?: number;
  contactType?: 'client' | 'provider' | 'other' | ''; // Vacío para "todos"
  status?: 'active' | 'inactive' | 'potential' | 'blocked' | ''; // Vacío para "todos"
  search?: string;
  // Añadir más parámetros de ordenamiento o filtros si es necesario
  // sortBy?: string;
  // sortOrder?: 'asc' | 'desc';
}


// Interfaces para operaciones CRUD
export interface CreateContactData extends Omit<Partial<Contact>, '_id' | 'createdAt' | 'updatedAt'> {
  name: string; // Hacer campos obligatorios explícitos
  contactType: 'client' | 'provider' | 'other';
}

export interface UpdateContactData extends Omit<Partial<Contact>, '_id' | 'createdAt' | 'updatedAt'> {} 

// Tipo para la respuesta de getContactById, createContact, updateContact (asumiendo que devuelven el contacto completo)
export interface ContactResponse extends Contact {}

// Tipo para la respuesta de deleteContact
export interface DeleteResponse {
    message: string;
}

// --- CRUD Data Interfaces ---

/**
 * Datos necesarios para crear un nuevo contacto.
 */
export interface ContactCreateData {
    name: string;
    nickname?: string;
    contactType: 'client' | 'provider' | 'other';
    status: 'active' | 'inactive' | 'potential' | 'blocked';
    primaryEmail?: string;
    primaryPhone?: string;
    notes?: string;
    addresses: Address[]; // Inicialmente vacío, podría expandirse
    details: ContactDetail[]; // Inicialmente vacío, podría expandirse
}

/**
 * Datos que se pueden actualizar en un contacto existente.
 * Todos los campos son opcionales.
 */
export type ContactUpdateData = Partial<ContactCreateData>;

// Re-exportar otros tipos si es necesario, o asegurarse de que están definidos arriba. 