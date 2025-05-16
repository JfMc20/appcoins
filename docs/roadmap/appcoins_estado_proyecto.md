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
// Esta fase está mayormente completa en cuanto a su alcance original.
// Los ítems restantes se han movido o detallado en fases posteriores.

### Fase 2: Módulo de Gestión de Precios y Tasas de Cambio

#### ✅ Implementado:
- Integración con API externa (CriptoYa) para tasas de cambio fiat
- Actualización automática de tasas mediante cron job
- Almacenamiento de tasas en AppSettingsModel
- Endpoint para obtener las tasas actuales (`GET /api/settings/exchange-rates`)
- Endpoint para refrescar manualmente las tasas (`POST /api/settings/exchange-rates/refresh`)
- Estructura para configurar monedas soportadas en `AppSettingsModel`
- Frontend: Página de visualización de Tasas de Cambio (`ExchangeRatePage.tsx` y `ExchangeRateDashboard.tsx`) que muestra las tasas actuales y permite la actualización manual.
- Backend: Rutas (`/api/settings/exchange-rates` y `/api/settings/exchange-rates/refresh`) usan JWT + rol de admin.
- Backend: Nuevos endpoints para gestión de AppSettings (`GET /api/settings/admin/appsettings`, `PUT /api/settings/admin/supported-currencies`) con protección de admin.
- Frontend: Servicio (`settings.service.ts`) para interactuar con los nuevos endpoints de AppSettings.
- Frontend: Tipos (`appSettings.types.ts`) definidos.
- Frontend: Página de Administración `AppSettingsPage.tsx` para gestionar monedas fiat soportadas (listar, activar/desactivar).
- Frontend: Enlace a `AppSettingsPage.tsx` añadido al `SidePanel.tsx` para administradores.
- Frontend: Ruta para `AppSettingsPage.tsx` configurada en `AppRouter.tsx`.
- **Backend y Frontend**: Gestión de precios para `GameItems`:
  - Decisión de diseño: Precios gestionados en un `PriceModel` separado y no como subdocumento de `GameItemModel`.
  - **Backend**:
    - Creación de `src/models/PriceModel.ts` (con `IPrice` y `PriceSchema`).
    - Creación del controlador `src/controllers/priceController.ts` (con funciones CRUD).
    - Creación de rutas `src/routes/priceRoutes.ts` (protegidas para administradores) y registro en `app.ts`.
  - **Frontend**:
    - Creación de `src/types/price.types.ts` (con interfaz `Price` y `PriceFormData`).
    - Creación del servicio `src/services/price.service.ts`.
    - Integración de un modal de gestión de precios en `src/pages/admin/games/GameItemsPage.tsx`.
    - Desarrollo del componente `src/components/games/ItemPriceManager.tsx` para la lógica de visualización, creación, edición y eliminación de precios.
    - Desarrollo del componente `src/components/pricing/PriceForm.tsx` para el formulario de precios.
    - Refinamiento de la interfaz de usuario y experiencia de usuario del `ItemPriceManager.tsx` para mayor intuitividad y claridad.

#### ❌ Pendiente:
- **Frontend**: Interfaz de administración en `AppSettingsPage.tsx` (o una nueva página si se prefiere) para:
    - Visualizar las `exchangeRateAPIs` configuradas en `AppSettings`.
    - (Opcional Avanzado) CRUD completo para `supportedFiatCurrencies` (actualmente solo activar/desactivar, faltaría añadir/editar/eliminar).
    - (Opcional Avanzado) Permitir la gestión (CRUD) de `exchangeRateAPIs` (nombre, API key, URL base, prioridad, estado).
- **Backend y Frontend**: Gestión de precios para `ExternalProducts` (similar a GameItems).
- **Backend y Frontend**: Estrategias de precios avanzadas (ej. márgenes de ganancia configurables por defecto o por tipo de producto/juego, precios dinámicos basados en tasas de cambio o costos, etc.).

### Fase 3: Módulo de Transacciones

#### ✅ Implementado:
- Modelo completo de transacciones (`TransactionModel`)
- Endpoint para **creación** de transacciones (`POST /api/transactions`) para el tipo `DECLARACION_OPERADOR_INICIO_DIA`.
- Endpoint para **lectura** de transacciones (`GET /api/transactions` con paginación y filtro básico por rol)
- Endpoints CRUD completos para Fuentes de Fondos (`/api/funding-sources`) [Pertenece más a Fase de Fuentes de Fondos pero relacionado con transacciones]
- Frontend: Página de Historial de Transacciones (`TransactionsListPage.tsx`) con listado paginado.
- Frontend: Formulario y lógica para `DECLARACION_OPERADOR_INICIO_DIA` en `NewTransactionPage.tsx`.

#### ❌ Pendiente:
- **Backend**: Endpoints para actualizar y eliminar transacciones (`PUT`, `DELETE /api/transactions/:id`), considerando restricciones de negocio.
- **Backend**: Lógica completa para diferentes tipos de transacciones en el endpoint de creación (`POST /api/transactions`):
  - Compra/venta de ítems de juego (actualización de stock, cálculo de ganancias/pérdidas).
  - Compra/venta de productos externos.
  - Ajustes de stock (manuales).
  - Gastos e Ingresos varios.
  - Transferencias entre fuentes de fondos.
- **Backend**: Cálculo de comisiones y ganancias/pérdidas en transacciones relevantes.
- **Frontend**: Interfaz de usuario para el registro y gestión de transacciones:
    - Formularios específicos y usables para los diferentes tipos de transacciones (compra, venta, gasto, ingreso, transferencia).
    - Diseñar formularios con alta intuitividad, mostrando solo campos relevantes y guiando al usuario.
    - Filtrar ítems de juego por juego seleccionado en el formulario de transacción.
    - Permitir la selección de moneda para el precio unitario en transacciones de compra/venta.
    - Ajustar el cálculo y la entrada del monto de pago cuando la moneda del precio unitario y la moneda de la fuente de fondos difieran.
    - Implementar lógica de validación/ayuda para cantidades de ítems específicos (ej. Tibia Coins en múltiplos de 25) en el formulario de transacciones.
    - Almacenar `contactId` en transacciones de compra/venta para permitir análisis futuros de actividad por contacto (ej. balances, clientes frecuentes).
    - Considerar la captura de datos suficientes durante las transacciones (ej. precio unitario, ítem, contacto) para facilitar futuras funcionalidades de autocompletado en la creación de nuevas transacciones.
    - (Considerar para después) Opción para crear un nuevo contacto directamente desde el formulario de transacción (usando un modal).
    - Vinculación completa con contactos y fuentes de fondos en los formularios.
    - Vista de detalle de una transacción.
    - Posibilidad de editar/eliminar transacciones (si la lógica de negocio lo permite y con las debidas confirmaciones/auditoría).
    - Mejoras en filtros y búsqueda en el listado de transacciones.

### Fase 4: Módulo de Gestión de Contactos

#### ✅ Implementado:
- Modelo completo para contactos (`ContactModel.ts`)
- Backend: Rutas (`contactRoutes.ts`) para CRUD completo con protección, filtros, paginación y búsqueda.
- Backend: Controlador (`contactController.ts`) con lógica CRUD.
- Frontend: Tipos (`contact.types.ts`).
- Frontend: Servicio (`contact.service.ts` - funciones CRUD).
- Frontend: Página de Listado (`ContactsListPage.tsx` - Tabla, filtros, paginación, búsqueda, botón eliminar funcional).
- Frontend: Componente Formulario (`ContactForm.tsx` - reutilizable).
- Frontend: Página de Creación (`CreateContactPage.tsx`).
- Frontend: Página de Edición (`EditContactPage.tsx` - funcionalidad básica).
- Frontend: Rutas y Navegación para contactos.

#### 🚧 En Progreso / Parcialmente Implementado:
- **Frontend**: Mejoras en `ContactForm.tsx` y páginas asociadas:
    - [ ] Campo descriptivo para "Tipo de Contacto: Otro".
    - [ ] Etiqueta/Vinculación a Juego.
- **Frontend**: Manejo de Direcciones y Detalles Adicionales (UI y Lógica para `addresses` y `details` del modelo).
- **Frontend**: Vinculación de contactos con transacciones (mostrar historial de transacciones por contacto).

#### ❌ Pendiente:
- Frontend: Vista de Detalle de Contacto (puede ser parte de la página de edición o una separada).

### Fase 5: Módulo de Informes

#### ❌ Pendiente:
- **Backend y Frontend**: Generación de informes diarios (resumen de actividad, saldos).
- **Backend y Frontend**: Informes personalizados (filtrados por juego, producto, contacto, fechas).
- **Backend y Frontend**: Informes de stock (valoración, movimientos).
- **Backend y Frontend**: Estadísticas y métricas de rendimiento (ganancias, costos, etc.).
- **Backend y Frontend**: Exportación de informes (CSV, PDF).
- **Frontend**: Interfaz de usuario para visualización interactiva de informes y dashboards.

### Fase 6: Interfaz de Usuario (Frontend) - Generalidades y Mejoras UX

#### ✅ Implementado:
- Estructura básica de la aplicación React (Vite, TypeScript).
- Sistema de autenticación en el frontend (hooks, contexto).
- Pantallas de login y registro.
- Manejo de rutas protegidas (`ProtectedRoute`, `AppRouter.tsx`).
- Tema claro/oscuro.
- Componentes base reutilizables (Button, Card, Input, Modal, Notification, LoadingSpinner, Table, etc.).
- **Frontend**: Panel de administración de juegos (`GameManagementPage.tsx`) con CRUD completo.
- **Frontend**: Panel de administración de ítems de juego (`GameItemsPage.tsx`) con CRUD completo.
- **Frontend**: Interfaz para Fuentes de Fondos (`FundingSourcesListPage.tsx`, `CreateFundingSourcePage.tsx`, `EditFundingSourcePage.tsx`) con CRUD completo.
- **Frontend**: Implementadas herramientas de diagnóstico para administradores.

#### ❌ Pendiente:
- **Frontend**: Dashboard principal (`HomePage.tsx`) con visión general del negocio y KPIs.
- **Frontend**: Mejoras de UX en todos los módulos (consistencia, feedback al usuario, manejo de errores más granular).
- **Frontend**: Vistas responsivas completas y optimizadas para dispositivos móviles.
- **Frontend**: Pruebas de usabilidad y recolección de feedback.
- **Frontend**: Internacionalización (i18n) si se planea soportar múltiples idiomas.

### Fase 7: Gestión de Usuarios y Operadores

#### ✅ Implementado:
- Modelo básico de usuario (UserModel) con roles y estado.
- Autenticación con JWT.
- Roles de administrador y operador.
- **Backend**: Endpoints CRUD completos para la gestión de usuarios por administradores (`/api/admin/users`).
- **Frontend**: Panel de administración de usuarios (`UserManagementPage.tsx`) con funcionalidad completa (CRUD, asignación a admin).

#### ❌ Pendiente:
- **Backend y Frontend**: Asignación de permisos más específicos si es necesario (más allá de admin/operador).
- **Backend y Frontend**: Seguimiento de actividad detallada de operadores (logs de acciones importantes).
- **Backend y Frontend**: Estadísticas de rendimiento por operador.
- **Backend y Frontend**: Cálculo y visualización de ganancias/comisiones por operador (requiere definir lógica de negocio).

## Interfaces Propuestas (Visión General de Componentes Mayores)

Esta sección sirve como un recordatorio de los componentes/vistas principales planeados. Su implementación se detalla en las fases.

- **Juegos y sus Ítems**:
  - `GameManagementPage` (Lista de Juegos, Formulario de Juego)
  - `GameItemsPage` (Lista de Ítems de un Juego, Formulario de Ítem)
- **Fuentes de Fondos**:
  - `FundingSourcesListPage` (Lista de Fuentes, Formulario de Fuente)
- **Transacciones**:
  - `TransactionsListPage` (Historial/Buscador)
  - `NewTransactionPage` (Formularios por Tipo)
  - `TransactionDetailPage` (Vista de Detalle)
- **Contactos**:
  - `ContactsListPage` (Lista de Contactos, Formulario de Contacto)
- **Usuarios (Admin)**:
  - `UserManagementPage` (Lista de Usuarios, Formulario de Usuario)
- **Configuración (Admin)**:
  - `ExchangeRatePage` (Dashboard de Tasas)
  - `AppSettingsPage` (Gestión de Monedas Soportadas, APIs de Tasas, etc.)
- **Informes (Admin)**:
  - Vistas dedicadas para diferentes tipos de informes.
- **Dashboard Principal**:
  - `HomePage`

## Prioridades Generales Recomendadas (Revisar y Ajustar Periódicamente)

1.  **Funcionalidad Central de Transacciones (Fase 3)**: Completar todos los tipos de transacciones, cálculos de ganancias/pérdidas, y la vinculación con stock, fuentes y contactos. Es el núcleo del sistema.
2.  **Configuración Esencial (Fase 2)**:
    - Finalizar la gestión de `exchangeRateAPIs` en `AppSettingsPage.tsx`.
    - Implementar la gestión básica de precios para `GameItems` y `ExternalProducts`.
3.  **Informes Clave (Fase 5)**: Implementar los informes más críticos para la toma de decisiones (diarios, ganancias, stock).
4.  **Mejoras UX y Dashboard Principal (Fase 6)**: Hacer la aplicación más usable y proporcionar una vista general útil.
5.  **Funcionalidades Avanzadas de Operadores (Fase 7)**: Seguimiento de actividad, rendimiento.
6.  **Estrategias de Precios Avanzadas (Fase 2)**.
7.  **Informes Avanzados y Personalizados (Fase 5)**.

## Próximos Pasos Inmediatos (Tareas Concretas a Corto Plazo)

Esta sección se actualizará con las tareas más inmediatas del backlog, extrayéndolas de las fases pendientes.

1.  **Fase 2: Gestión de Precios y Tasas de Cambio (Continuación)**:
    *   **Frontend**: Visualizar las `exchangeRateAPIs` configuradas en `AppSettingsPage.tsx`.
    *   Considerar el CRUD básico para `exchangeRateAPIs` si se decide abordar ahora.
2.  **Fase 3: Módulo de Transacciones (Enfoque Principal)**:
    *   **Backend**: Desarrollar la lógica para transacciones de "Compra" y "Venta" de `GameItems`, incluyendo la actualización de stock del ítem y el saldo de la fuente de fondos.
    *   **Frontend**: Crear/adaptar formularios en `NewTransactionPage.tsx` para registrar estos tipos de transacciones.
3.  **Fase 4: Módulo de Gestión de Contactos (Mejoras)**:
    *   **Frontend**: Implementar las mejoras pendientes en `ContactForm.tsx` (campo "Otro" y vinculación a juego).
    *   **Frontend**: Implementar el manejo de `addresses` y `details` en el formulario de contactos.

---
Este documento se actualiza continuamente para reflejar el progreso y los cambios en las prioridades. 