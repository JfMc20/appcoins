# Estado del Proyecto AppCoins

Este documento proporciona una visión general del estado actual del proyecto AppCoins, detallando lo que ya está implementado y lo que falta por desarrollar según el roadmap original.

## Visión General

AppCoins es una aplicación para facilitar el monitoreo y la administración de compra, venta y reventa de monedas/ítems de múltiples juegos y productos externos con gestión de stock. La aplicación utiliza:

- **Backend**: Node.js, Express, TypeScript y MongoDB
- **Frontend**: React, TypeScript y Tailwind CSS
- **Autenticación**: Sistema basado en JWT con roles (admin/operator)
- **Tasas de cambio**: Integración con APIs externas para obtener tasas de monedas fiat

## Estado por Fases

### Fase 1: Configuración del Entorno y Diseño de Base de Datos

#### ✅ Implementado:
- Estructura del proyecto backend con Node.js, Express y TypeScript
- Estructura del proyecto frontend con React y TypeScript
- Conexión a MongoDB configurada
- Esquema base para usuarios (UserModel)
- Sistema de autenticación con JWT
- Gestión de roles (admin/operador)
- Sistema de usuarios con un usuario de prueba (test@test.com)
- Estructura básica de archivos y carpetas (siguiendo las prácticas recomendadas)
- Implementación de interfaces TypeScript para todos los modelos principales (AppSettings, Contact, ExternalProduct, FundingSource, GameItem, Game, Transaction, User).

#### ✅ Recientemente completado:
- Implementación completa de los modelos:
  - GameModel (mejorado)
  - FundingSourceModel (mejorado)
  - TransactionModel (mejorado con validaciones y métodos)
- Servicios frontend para conectar con APIs:
  - game.service.ts
  - fundingSource.service.ts 
  - transaction.service.ts

#### ❌ Pendiente:
- Interfaz de administración para gestionar tasas de cambio
- Actualización manual de tasas desde la interfaz
- Gestión de precios para GameItems
- Gestión de precios para ExternalProducts
- Estrategias de precios avanzadas

### Fase 2: Módulo de Gestión de Precios y Tasas de Cambio

#### ✅ Implementado:
- Integración con API externa (CriptoYa) para tasas de cambio fiat
- Actualización automática de tasas mediante cron job
- Almacenamiento de tasas en AppSettingsModel
- Endpoint para obtener las tasas actuales (`GET /api/settings/exchange-rates`)
- Endpoint para refrescar manualmente las tasas (`POST /api/settings/exchange-rates/refresh`)
- Estructura para configurar monedas soportadas en `AppSettingsModel`
- Frontend: Página de visualización de Tasas de Cambio (`ExchangeRatePage.tsx` y `ExchangeRateDashboard.tsx`) que muestra las tasas actuales y permite la actualización manual.

#### ❌ Pendiente:
- **Backend**: Ajustar autenticación de rutas (`/api/settings/exchange-rates` y `/api/settings/exchange-rates/refresh`) para usar JWT + rol de admin.
- **Frontend**: Asegurar que `ExchangeRatePage.tsx` esté accesible desde el menú de admin.
- **Frontend**: Interfaz de administración en `ExchangeRatePage.tsx` o similar para:
    - Gestionar `supportedFiatCurrencies` (listar, activar/desactivar).
    - (Opcional Avanzado) CRUD completo para `supportedFiatCurrencies`.
    - Visualizar `exchangeRateAPIs` configuradas.
    - (Opcional Avanzado) Gestionar `exchangeRateAPIs`.
- Gestión de precios para GameItems (definición de precios, estrategias básicas).
- Gestión de precios para ExternalProducts (definición de precios, estrategias básicas).
- Estrategias de precios avanzadas (márgenes dinámicos, etc.).

### Fase 3: Módulo de Transacciones

#### ✅ Implementado:
- Modelo completo de transacciones (`TransactionModel`)
- Endpoint para **creación** de transacciones (`POST /api/transactions`)
- Endpoint para **lectura** de transacciones (`GET /api/transactions` con paginación y filtro básico por rol)
- Endpoints CRUD completos para Fuentes de Fondos (`/api/funding-sources`)

#### ❌ Pendiente:
- Endpoints para actualizar y eliminar transacciones (`PUT`, `DELETE /api/transactions/:id`)
- Lógica completa para diferentes tipos de transacciones:
  - Compra/venta de ítems de juego
  - Compra/venta de productos externos
  - Ajustes de stock
  - Declaraciones de saldo
- Cálculo de comisiones y ganancias
- Actualización automática de stock en transacciones
- Vinculación completa con contactos y fuentes de fondos (en formularios y lógica de negocio)
- Interfaz de usuario para el registro y gestión de transacciones
    - [x] Listado de transacciones con filtros (implementado listado básico con paginación, filtros avanzados pendientes)
    - [ ] Formularios para los diferentes tipos de transacciones (solo `DECLARACION_OPERADOR_INICIO_DIA` implementado).
    - [ ] **Vinculación Rápida de Contactos**: En el formulario de creación de transacciones, permitir seleccionar/buscar un contacto existente para asociarlo rápidamente.
    - [ ] Vista de detalle de una transacción.
    - [ ] Posibilidad de editar/eliminar (si la lógica de negocio lo permite).

### Fase 4: Módulo de Gestión de Contactos

#### ✅ Implementado:
- Modelo completo para contactos (`ContactModel.ts`)
- Backend: Rutas (`contactRoutes.ts`) para CRUD básico con protección.
- Backend: Controlador (`contactController.ts`) con lógica CRUD (validaciones, filtros, paginación, búsqueda, manejo de errores).
- Frontend: Tipos (`contact.types.ts`).
- Frontend: Servicio (`contact.service.ts` - funciones CRUD).
- Frontend: Página de Listado (`ContactsListPage.tsx` - Tabla, filtros, paginación, búsqueda, botón eliminar funcional).
- Frontend: Componente Formulario (`ContactForm.tsx` - reutilizable).
- Frontend: Página de Creación (`CreateContactPage.tsx`).
- Frontend: Rutas y Navegación para contactos.

#### 🚧 En Progreso / Parcialmente Implementado:
- Vinculación de contactos con transacciones (Backend podría estar listo, Frontend para mostrar historial pendiente).
- Historial de transacciones por contacto (UI pendiente).

#### ❌ Pendiente:
- Frontend: Página de Edición (`EditContactPage.tsx`).
- Frontend: Manejo de Direcciones y Detalles Adicionales en UI (si aplica según diseño final de `ContactForm`).
- Frontend: Vista de Detalle de Contacto (Opcional, o parte de la página de edición).
- Interfaz de usuario para gestión de contactos (refiriéndose a la finalización de todos los componentes visuales y flujos).

### Fase 5: Módulo de Informes

#### ❌ Pendiente:
- Generación de informes diarios
- Informes personalizados (por juego, producto, contacto, fechas)
- Informes de stock
- Estadísticas y métricas de rendimiento
- Exportación de informes en diferentes formatos
- Interfaz de usuario para visualización de informes

### Fase 6: Interfaz de Usuario (Frontend)

#### ✅ Implementado:
- Estructura básica de la aplicación React
- Sistema de autenticación en el frontend
- Pantallas de login y registro
- Manejo de rutas protegidas
- Tema claro/oscuro
- Componentes base reutilizables (incluyendo un nuevo componente `Table` genérico)
- **Frontend**: Panel de administración de juegos (`/admin/games` ahora `GameManagementPage.tsx`) con funcionalidad completa para:
  - Listar juegos activos/inactivos y archivados (con filtrado desde el backend).
  - Crear nuevos juegos.
  - Editar juegos existentes.
  - Archivar juegos activos/inactivos.
  - Restaurar juegos archivados.
  - Eliminar permanentemente juegos archivados.
  - Se eliminó el archivo duplicado `GamesManagementPage.tsx`.
- **Frontend**: Panel de administración de ítems de juego (accesible desde cada juego, ej. `/admin/games/:gameId/items`) con funcionalidad completa para:
    - Listar ítems de juego con filtros (por nombre/código, tipo, estado).
    - Crear nuevos ítems de juego.
    - Editar ítems de juego existentes (actualmente el cambio de estado y la actualización de stock son acciones directas en la tabla; el formulario de edición completo para todos los campos está pendiente de un botón/modal específico).
    - Cambiar estado de los ítems (activo, inactivo, archivado) directamente desde la tabla.
    - Actualizar stock de ítems (si aplica) directamente desde la tabla.
    - Eliminar permanentemente ítems de juego con confirmación.
- **Frontend**: Interfaz para Fuentes de Fondos (`/funding-sources`) con funcionalidad **completa** para listar, crear, editar, archivar/restaurar y eliminar permanentemente fuentes.
- **Frontend**: Implementadas herramientas de diagnóstico para administradores (accesibles mediante combinación de teclas y URLs seguras, requieren rol de admin):
  - Depurador de Autenticación (`LoginDebugger.tsx`).
  - Inspector/Modificador de Roles de Usuario (`UserRoleDebug.tsx`, `FixUserAdmin.tsx`).
- **Frontend**: Página de Historial de Transacciones (`TransactionsListPage.tsx`) con listado paginado de transacciones consumiendo el endpoint del backend.

#### ❌ Pendiente:
- Dashboard principal con visión general del negocio
- Interfaz para gestión de productos (*si aplica, revisar si "juegos" cubre esto*)
- Interfaz para gestión de transacciones (completar formularios para todos los tipos, vista de detalle, edición/eliminación)
- Interfaz para gestión de contactos
- Interfaz para visualización de informes
- Vistas responsivas completas para dispositivos móviles
- Integración completa con todos los endpoints del backend

### Fase 7: Gestión de Usuarios y Operadores

#### ✅ Implementado:
- Modelo básico de usuario (UserModel)
- Autenticación con JWT
- Roles de administrador y operador
- **Backend**: Endpoints CRUD completos para la gestión de usuarios por administradores (`/api/admin/users`).
- **Frontend**: Panel de administración de usuarios con funcionalidad **completa** para listar, crear, editar y eliminar usuarios/operadores (incluye asignación a admin y modales de confirmación).

#### ❌ Pendiente:
- Asignación de permisos específicos (más allá de admin/operador).
- Seguimiento de actividad de operadores.
- Estadísticas de rendimiento por operador.
- Investigar cómo calcular las ganancias del operador. Esto debe ser mostrado en el dashboard del admin.

## Interfaces Propuestas

### 1. Interfaces para Juegos (GameModel)
- **Lista de Juegos (GamesList)**: Tabla con filtros, buscador y acciones rápidas
- **Detalle de Juego (GameDetail)**: Información completa, métricas y transacciones relacionadas. Incluye la lista de ítems configurados para el juego.
- **Formulario de Juego (GameForm)**: Creación/edición de juegos con validaciones

### 1.1. Interfaces para Ítems de Juego (GameItemModel)
- **Lista de Ítems de Juego (GameItemsList)**: Tabla dentro de la vista de un juego específico (`GameItemsPage.tsx`), con filtros por tipo/estado, búsqueda y acciones (cambiar estado, actualizar stock, eliminar permanentemente).
- **Formulario de Ítem de Juego (GameItemForm)**: Para creación y edición de ítems de juego, con todos sus campos y validaciones.

### 2. Interfaces para Fuentes de Fondos (FundingSourceModel)
- **Dashboard de Fuentes (FundingDashboard)**: Resumen de saldos y distribución de capital
- **Lista de Fuentes (FundingSourcesList)**: Filtros por tipo/moneda e indicadores visuales
- **Detalle de Fuente (FundingSourceDetail)**: Información específica según tipo y transacciones
- **Formulario por Tipo (FundingSourceForm)**: Campos dinámicos según tipo seleccionado

### 3. Interfaces para Transacciones (TransactionModel)
- **Dashboard de Transacciones (TransactionDashboard)**: Resumen y métricas
- **Buscador Avanzado (TransactionSearch)**: Filtros complejos y exportación
- **Vista de Transacción (TransactionDetail)**: Información completa y relacionadas
- **Formularios por Tipo (TransactionForms)**: Asistentes específicos según tipo
- **Panel de Análisis (TransactionAnalytics)**: Análisis de rentabilidad y tendencias

### 4. Interfaces para Gestión de Usuarios
- **Panel de Administración de Usuarios (UserAdminPanel)**: Lista de usuarios con filtros
- **Formulario de Creación de Operador (OperatorForm)**: Creación y asignación de permisos
- **Perfil de Usuario (UserProfile)**: Vista y edición de información personal
- **Monitor de Actividad (ActivityMonitor)**: Seguimiento de acciones de operadores

## Prioridades Recomendadas

Basado en el estado actual, se recomienda el siguiente orden de prioridad para el desarrollo:

1.  **¡COMPLETADO!** (Gestión Usuarios Frontend)
2.  **¡COMPLETADO!** (Interfaz de Juegos Frontend - CRUD de Juegos)
3.  **¡COMPLETADO!** (Interfaz de Ítems de Juego Frontend - CRUD de Ítems de Juego)
4.  **¡COMPLETADO!** (Interfaz de Fuentes de Fondos Frontend - CRUD)
5.  **Transacciones Básicas (Fase 3 parcial)**: Completar la lógica e interfaces para registro de transacciones.
6.  **Gestión de Contactos (Fase 4)**: Implementar el CRUD e interfaces para contactos.
7.  **Precios y Estrategias (Fase 2)**: Completar la gestión de precios y tasas.
8.  **Transacciones Avanzadas (Fase 3 completo)**: Finalizar todas las funcionalidades de transacciones.
9.  **Informes Básicos (Fase 5 parcial)**: Implementar informes fundamentales para el negocio.
10. **Interfaz Completa (Fase 6 completo)**: Finalizar todas las pantallas y mejoras de UX.
11. **Informes Avanzados (Fase 5 completo)**: Implementar informes personalizados y avanzados.

## Próximos Pasos Inmediatos

1.  **¡HECHO!** (Documentación inicial)
2.  **¡HECHO!** (Implementar interfaz de gestión de Juegos - CRUD de Juegos)
3.  **¡HECHO!** (Implementar interfaz de gestión de Ítems de Juego - CRUD de Ítems)
4.  **¡HECHO!** (Implementar la interfaz frontend para fuentes de fondos - CRUD).
5.  Desarrollar sistema de gestión de contactos completo (Backend y Frontend).

*   **[Fase 4: Gestión de Contactos](frontend/src/pages/contacts/ContactsListPage.tsx)**
    *   **Backend:**
        *   [x] Modelo (`ContactModel.ts`)
        *   [x] Rutas (`contactRoutes.ts` - CRUD básico con protección)
        *   [x] Controlador (`contactController.ts` - Lógica CRUD con validaciones, filtros, paginación, búsqueda y manejo de errores)
    *   **Frontend:**
        *   [x] Tipos (`contact.types.ts` - Interfaces para Contact, CRUD data, etc.)
        *   [x] Servicio (`contact.service.ts` - Funciones getAll, getById, create, update, delete)
        *   [x] Página de Listado (`ContactsListPage.tsx` - Tabla, filtros, paginación, búsqueda, botón eliminar funcional)
        *   [x] Componente Formulario (`ContactForm.tsx` - Reutilizable para crear/editar)
        *   [x] Página de Creación (`CreateContactPage.tsx` - Usa ContactForm, llama al servicio)
        *   [x] Página de Edición (`EditContactPage.tsx` - Implementada funcionalidad básica de edición)
        *   [x] Rutas y Navegación (Router, `Pathnames`, SidePanel) - Añadidas rutas y enlace para crear/listar/editar
        *   [ ] **Mejoras Pendientes en Formulario de Contacto (`ContactForm.tsx` y páginas asociadas):**
            *   [ ] **Campo descriptivo para "Tipo de Contacto: Otro"**: Implementar lógica para que al seleccionar "Otro" como tipo de contacto, aparezca un campo de texto adicional para especificar la descripción de dicho tipo.
            *   [ ] **Etiqueta/Vinculación a Juego**: Añadir un campo para seleccionar o ingresar uno o más juegos existentes, permitiendo vincular el contacto a servicios específicos.
        *   [ ] Manejo de Direcciones y Detalles Adicionales (UI y Lógica) - Pendiente (esto se refiere a las secciones `addresses` y `details` del modelo)
        *   [ ] Vista de Detalle (Opcional) - Pendiente
*   **Fase 5: Gestión de Transacciones**
    *   ...
*   **Fase 6: Dashboard y Reportes**
    *   ...
*   **Fase 7: Autenticación y Autorización Avanzada**
    *   ...
*   **Fase 8: Configuración de Aplicación**
    *   ...
*   **Fase 9: Pruebas y Despliegue**
    *   ... 