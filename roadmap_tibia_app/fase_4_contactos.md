# Fase 4: Módulo de Gestión de Contactos

Este documento detalla la planificación y desarrollo del módulo de gestión de contactos (clientes y proveedores) de la aplicación.

## 1. Objetivos Principales del Módulo

*   Permitir el registro (Crear) de nuevos contactos (clientes, proveedores, u otros).
*   Visualizar (Leer) la lista de contactos existentes con su información clave.
*   Permitir la actualización (Actualizar) de la información de un contacto.
*   Permitir la desactivación o archivado (Eliminar/Archivar) de contactos que ya no están activos (en lugar de un borrado físico, para mantener la integridad histórica).
*   Facilitar la búsqueda y filtrado de contactos por diversos criterios (nombre, tipo, etiquetas, etc.).
*   Mostrar un historial de transacciones asociado a cada contacto.
*   Registrar múltiples métodos de contacto para una persona (WhatsApp, Discord, email, nombre en el juego, etc.).
*   Implementar un sistema de etiquetas personalizadas para organizar y categorizar contactos.
*   Permitir registrar notas o comentarios relevantes sobre cada contacto.

## 2. Modelo de Datos (`Contact`)

La estructura detallada de la colección `contacts` fue definida en el documento `roadmap_tibia_app/fase_1_entorno_y_db.md` (Sección 2.5).

Para los propósitos de este módulo (Fase 4), los campos más relevantes de la colección `contacts` que nos permitirán alcanzar los objetivos definidos son:

*   `_id`: Identificador único del contacto.
*   `displayName`: Nombre principal o alias para mostrar y buscar.
*   `firstName`, `lastName`: Nombres opcionales para mayor detalle.
*   `type`: Para clasificar el contacto (Cliente, Proveedor, Ambos, Otro).
*   `primaryContactMethod`: Objeto para el principal método de contacto (plataforma, identificador).
*   `additionalContactMethods`: Array de objetos para otros métodos de contacto.
*   `notes`: Campo de texto libre para anotaciones importantes sobre el contacto.
*   `tags`: Array de strings para etiquetar y categorizar contactos (ej. "VIP", "Mayorista", "TibiaPlayer", "ProveedorConfianza").
*   `status`: Para gestionar el estado del contacto (activo, inactivo, bloqueado).
*   `lastTransactionDate`, `totalTransactionsCount`, `totalVolume`: Campos que se actualizarán (o podrán calcularse) en base a las interacciones registradas en el módulo de transacciones, proveyendo un resumen rápido de la relación comercial.
*   `createdAt`, `updatedAt`: Timestamps para auditoría.

Esta estructura proporciona la flexibilidad necesaria para almacenar información detallada de los contactos y facilitar su gestión y consulta.

## 3. Funcionalidades Principales (CRUD y Otras)

Las funcionalidades clave para la gestión de contactos son:

*   **Crear Contacto:**
    *   Permitir el ingreso de todos los campos definidos en el modelo `Contact`, incluyendo `displayName`, `type`, `primaryContactMethod`, `additionalContactMethods`, `notes` y `tags` iniciales.

*   **Leer/Listar Contactos:**
    *   Mostrar una vista de lista paginada de todos los contactos.
    *   Columnas visibles en la lista deben incluir información clave como `displayName`, `type`, `primaryContactMethod` (de forma resumida), `tags` más relevantes y `status`.
    *   **Búsqueda:** Funcionalidad de búsqueda por `displayName` y también por el campo `identifier` dentro de `primaryContactMethod` y `additionalContactMethods`.
    *   **Filtros:** Opciones para filtrar la lista por `type` (Cliente, Proveedor, etc.), `status` (activo, inactivo), y por una o varias `tags`.
    *   **Ordenamiento:** Permitir ordenar la lista por columnas como `displayName`, `lastTransactionDate` (si se muestra), `createdAt`.

*   **Ver Detalles del Contacto:**
    *   Al seleccionar un contacto de la lista, mostrar una vista detallada con toda su información (`displayName`, nombres, tipo, todos los métodos de contacto, notas completas, todas las etiquetas).
    *   **Historial de Transacciones:** Incluir una sección (ej. una tabla o lista) que muestre todas las transacciones asociadas a este `contactId`, obtenidas del módulo de transacciones. Debería ser posible filtrar y ordenar este historial específico del contacto.
    *   Visualización clara de las métricas del contacto: `lastTransactionDate`, `totalTransactionsCount`, `totalVolume`.

*   **Actualizar Contacto:**
    *   Permitir la modificación de cualquier información del contacto a través de un formulario similar al de creación.

*   **Gestionar Estado del Contacto:**
    *   Proporcionar opciones para cambiar el `status` de un contacto a "inactive" o "blocked". Esto representa un archivado lógico en lugar de un borrado físico, para mantener la integridad histórica de las transacciones asociadas.

*   **Gestión de Etiquetas (`tags`):**
    *   Al crear o editar un contacto, el usuario podrá añadir etiquetas existentes o crear nuevas etiquetas escribiéndolas directamente. Un sistema de autocompletado para etiquetas existentes sería útil.
    *   (Consideración Futura): Si la gestión de etiquetas se vuelve compleja, se podría añadir una interfaz separada para administrar todas las etiquetas del sistema (crear, renombrar, eliminar etiquetas no usadas, ver cuántos contactos usan cada etiqueta).

*   **Visualización de Métricas del Contacto (derivadas de transacciones):**
    *   En la vista de detalles y opcionalmente en la lista, mostrar `lastTransactionDate`, `totalTransactionsCount`, y `totalVolume` (este último en la moneda de referencia, ej. USDT).

*   **Exportar Detalles del Contacto a PDF:**
    *   En la vista de detalles de un contacto, ofrecer un botón o opción para descargar un archivo PDF.
    *   El PDF deberá contener la información principal del contacto (nombre, tipo, métodos de contacto, notas clave) y una versión imprimible de su historial de transacciones (posiblemente con filtros básicos de fecha aplicados antes de la exportación).

## 4. Interacción con otros Módulos

El módulo de Gestión de Contactos tendrá interacciones clave con los siguientes módulos:

*   **Módulo de Transacciones (Fase 3):**
    *   **Dependencia de Contactos en Transacciones:** Al registrar una nueva transacción que involucre a un tercero (ej. compra, venta, devolución), el módulo de transacciones requerirá la selección de un `contactId` existente o, idealmente, ofrecerá una opción para la creación rápida de un nuevo contacto si este aún no existe en el sistema.
    *   **Visualización del Historial de Transacciones del Contacto:** La vista de detalles de un contacto deberá mostrar una lista/tabla de todas las transacciones asociadas a ese `contactId`. Esto implica que el backend del módulo de contactos deberá poder consultar la colección de transacciones filtrando por `contactId`.
    *   **Actualización/Cálculo de Métricas del Contacto:** Los campos informativos como `lastTransactionDate`, `totalTransactionsCount`, y `totalVolume` en el modelo `Contact` se derivarán de los datos de las transacciones. Esto se puede lograr mediante:
        *   **Cálculo dinámico (preferido inicialmente):** Cuando se solicita la información de un contacto, el backend realiza una agregación sobre la colección de transacciones para obtener estos valores actualizados.
        *   **Actualización por eventos (más complejo):** Actualizar estos campos en el documento del contacto cada vez que se crea o modifica una transacción relevante. Se puede considerar si el cálculo dinámico presenta problemas de rendimiento con muchos datos.

*   **Módulo de Usuarios (`users`):**
    *   **Autenticación y Autorización:** Todas las operaciones CRUD (Crear, Leer, Actualizar, Desactivar/Archivar) sobre los contactos estarán protegidas y requerirán que un usuario esté autenticado.
    *   **Control Basado en Roles:** Los permisos para realizar ciertas acciones sobre los contactos (ej. editar información sensible, archivar contactos, o incluso ver ciertos datos) podrían estar restringidos a roles específicos de usuario (ej. `admin` vs. `operator`).

*   **Módulo de Informes (Fase 5):**
    *   **Dimensiones de Análisis:** La información de los contactos, como su `type` (Cliente, Proveedor), `status`, y `tags`, se utilizará como criterios de filtrado, segmentación o agrupación en los informes generados por el Módulo de Informes. Esto permitirá análisis como "Ventas totales a clientes VIP" o "Volumen de compras a proveedores de X juego".

*   **Módulo de `appSettings` (Configuraciones):**
    *   Podría haber configuraciones en `appSettings` que afecten la gestión de contactos, por ejemplo, una lista predefinida de `tags` sugeridas o valores por defecto para ciertos campos al crear un nuevo contacto, aunque inicialmente se planea que las etiquetas sean de texto libre.

## 5. Endpoints de API (Backend)

A continuación, se detallan los endpoints de API propuestos para el backend que darán servicio a las funcionalidades del módulo de gestión de contactos.

*   **`POST /api/contacts`**
    *   **Descripción:** Crea un nuevo contacto.
    *   **Autenticación:** Requerida (Operador/Admin).
    *   **Cuerpo (Payload):** Objeto con los datos del contacto (`displayName`, `type`, `primaryContactMethod`, `additionalContactMethods`, `notes`, `tags`, etc.).
    *   **Respuesta Exitosa (201):** El documento del contacto recién creado.
    *   **Respuestas de Error:** 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden).

*   **`GET /api/contacts`**
    *   **Descripción:** Lista todos los contactos del usuario/organización, con opciones de filtrado, búsqueda y paginación.
    *   **Autenticación:** Requerida (Operador/Admin).
    *   **Parámetros de Query (Ejemplos):** 
        *   `search`: String para buscar en `displayName`, `firstName`, `lastName`, `primaryContactMethod.identifier`, `additionalContactMethods.identifier`.
        *   `type`: ("Cliente", "Proveedor", "Ambos", "Otro").
        *   `status`: ("active", "inactive", "blocked").
        *   `tags`: String de etiquetas separadas por coma (ej. "VIP,TibiaPlayer") para filtrar por contactos que tengan todas las etiquetas especificadas.
        *   `page`: Número de página (default 1).
        *   `limit`: Cantidad de resultados por página (default 10).
        *   `sortBy`: Campo por el cual ordenar (default `displayName`).
        *   `sortOrder`: ("asc", "desc", default `asc`).
    *   **Respuesta Exitosa (200):** Objeto con `{ data: [Array de contactos], pagination: { ... } }`.

*   **`GET /api/contacts/:id`**
    *   **Descripción:** Obtiene los detalles completos de un contacto específico por su ID.
    *   **Autenticación:** Requerida.
    *   **Respuesta Exitosa (200):** El documento del contacto. Este endpoint podría incluir campos calculados como `totalVolume`, `totalTransactionsCount`, `lastTransactionDate` (realizando una agregación sobre las transacciones si se opta por cálculo dinámico).
    *   **Respuestas de Error:** 404 (Not Found).

*   **`PUT /api/contacts/:id`**
    *   **Descripción:** Actualiza la información de un contacto existente.
    *   **Autenticación:** Requerida (Operador/Admin, con posibles restricciones de rol para ciertos campos).
    *   **Cuerpo (Payload):** Objeto con los campos del contacto a modificar.
    *   **Respuesta Exitosa (200):** El documento del contacto actualizado.
    *   **Respuestas de Error:** 400 (Bad Request), 404 (Not Found).

*   **`DELETE /api/contacts/:id`** (Alternativamente: `PUT /api/contacts/:id/status` con cuerpo `{ status: "inactive" | "blocked" }`)
    *   **Descripción:** Cambia el `status` de un contacto a "inactive" o "blocked" (archivado lógico). No realiza un borrado físico para mantener la integridad histórica.
    *   **Autenticación:** Requerida (Admin, o rol con permisos específicos).
    *   **Respuesta Exitosa (200 o 204):** Mensaje de confirmación o el contacto con el estado actualizado.

*   **`GET /api/contacts/:id/transactions`**
    *   **Descripción:** Obtiene el historial de transacciones asociadas a un contacto específico, con paginación y filtros.
    *   **Autenticación:** Requerida.
    *   **Parámetros de Query (Ejemplos):** `dateFrom`, `dateTo`, `type` (tipo de transacción, ej. "VENTA_ITEM_JUEGO"), `page`, `limit`, `sortBy`, `sortOrder`.
    *   **Respuesta Exitosa (200):** Objeto con `{ data: [Array de transacciones del contacto], pagination: { ... } }`.
    *   **Respuestas de Error:** 404 (Not Found - si el contacto no existe).

*   **`GET /api/contacts/tags`** (Opcional, para autocompletado en UI)
    *   **Descripción:** Obtiene una lista de todas las diferentes etiquetas (`tags`) que se han utilizado en la colección de contactos.
    *   **Autenticación:** Requerida.
    *   **Respuesta Exitosa (200):** Array de strings, donde cada string es una etiqueta única. Ej: `["VIP", "ProveedorConfianza", "TibiaPlayer"]`.

Estos endpoints cubren las operaciones CRUD básicas, la consulta de historial de transacciones por contacto y la gestión de etiquetas.

## 6. Componentes de UI (Frontend)

Siguiendo el enfoque de un tema oscuro, el uso de Headless UI con Tailwind CSS (o similar) y una librería de gráficos, los componentes de UI para el módulo de gestión de contactos serían:

1.  **Página de Gestión de Contactos (`ContactsPage`):**
    *   **`ContactsTable` (o `ContactsList`):**
        *   **Propósito:** Mostrar la lista paginada de contactos.
        *   **Columnas Sugeridas:** `displayName`, `type`, `primaryContactMethod` (resumido, ej. icono de plataforma + identificador), `tags` (las más relevantes), `status`, y opcionalmente métricas clave como `totalVolume` o `lastTransactionDate`.
        *   **Acciones por Fila:** Botones/menú para "Ver Detalles", "Editar Contacto", "Archivar/Cambiar Estado".
    *   **`ContactFiltersPanel`:**
        *   **Propósito:** Permitir al usuario buscar y filtrar la lista de contactos.
        *   **Controles:** Campo de búsqueda (para `displayName`, `identifier`), selectores para `type`, `status`, y un selector múltiple o campo de entrada para `tags` (con autocompletado de `GET /api/contacts/tags`).
    *   **Botón "Añadir Nuevo Contacto"**: Navega o abre el modal/formulario `ContactForm`.
    *   **Controles de Paginación.**

2.  **Formulario de Contacto (`ContactForm` - como Modal o Página Dedicada):**
    *   **Propósito:** Utilizado para crear un nuevo contacto o editar uno existente.
    *   **Campos:**
        *   `displayName` (texto, requerido).
        *   `firstName`, `lastName` (texto).
        *   `type` (selector: Cliente, Proveedor, Ambos, Otro).
        *   `status` (selector: active, inactive, blocked - visible principalmente al editar).
        *   `primaryContactMethod`: Grupo de campos con `platform` (selector: WhatsApp, Discord, Email, InGame, Otro) e `identifier` (texto). Si `platform` es "InGame", podría mostrar un selector adicional para `gameId` (poblado desde la colección `games`).
        *   `additionalContactMethods`: Una lista dinámica donde el usuario puede añadir/eliminar múltiples métodos de contacto, cada uno con `platform` e `identifier`.
        *   `tags`: Campo de entrada para etiquetas (con autocompletado/sugerencias de etiquetas existentes).
        *   `notes` (área de texto).
        *   `profileImageUrl` (campo de texto para URL, opcional).
    *   **Validación:** En todos los campos relevantes.
    *   **Botones:** "Guardar Contacto", "Cancelar".

3.  **Vista de Detalles del Contacto (`ContactDetailsPage` o `ContactDetailsView` - Modal o Sección en Página):**
    *   **Propósito:** Mostrar toda la información consolidada de un contacto específico.
    *   **Secciones:**
        *   **Información General:** `displayName`, `firstName`, `lastName`, `type`, `status`, `profileImageUrl` (si existe), y listado de todas las `tags`.
        *   **Métodos de Contacto:** Presentación clara del `primaryContactMethod` y todos los `additionalContactMethods`.
        *   **Notas:** Visualización del contenido completo del campo `notes`.
        *   **Métricas Clave:** `totalVolumeTransacted`, `totalTransactionsCount`, `lastTransactionDate`.
        *   **Historial de Transacciones:** Una tabla/lista incrustada (componente reutilizable) que muestre las transacciones asociadas a este contacto (obtenidas de `GET /api/contacts/:id/transactions`). Esta tabla debería tener su propia paginación y opciones de filtro básicas (ej. por rango de fechas, tipo de transacción).
    *   **Acciones Disponibles en la Vista:** "Editar Contacto", "Archivar/Cambiar Estado", "Exportar a PDF".

4.  **Botón/Funcionalidad de Exportación a PDF (`ContactPdfExport`):**
    *   **Propósito:** Generar un documento PDF con los detalles del contacto y su historial de transacciones.
    *   **Activación:** Desde la `ContactDetailsPage`.
    *   **Contenido del PDF:** Información principal del contacto e historial de transacciones (potencialmente con opción a definir un rango de fechas para el historial en el PDF).
    *   **Implementación:** Podría usar librerías frontend (ej. `jsPDF` con `jsPDF-AutoTable`) para generar el PDF en el cliente, o delegar a un endpoint de backend si la generación es más compleja.

5.  **Componentes Reutilizables Genéricos (ya definidos en Fase 3, pero aplicables aquí):**
    *   `ModalWrapper`, `CustomSelect/Dropdown`, `DataTable` (o un componente de tabla base), `StyledButton`, `StyledInput`, `NotificationToast`, `LoadingSpinner`, `ConfirmationDialog` (para archivar o acciones sensibles).

Estos componentes, diseñados con un tema oscuro y las tecnologías UI/UX seleccionadas, deberían proporcionar una experiencia de usuario robusta y eficiente para la gestión de contactos. 