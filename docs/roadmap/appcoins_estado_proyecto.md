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
- Implementación de interfaces para modelos

### Fase 2: Módulo de Gestión de Precios y Tasas de Cambio

#### ✅ Implementado:
- Integración con API externa (CriptoYa) para tasas de cambio fiat
- Actualización automática de tasas mediante cron job
- Almacenamiento de tasas en AppSettingsModel
- Endpoint para obtener las tasas actuales
- Estructura para configurar monedas soportadas

#### ❌ Pendiente:
- Interfaz de administración para gestionar tasas de cambio
- Actualización manual de tasas desde la interfaz
- Gestión de precios para GameItems
- Gestión de precios para ExternalProducts
- Estrategias de precios avanzadas

### Fase 3: Módulo de Transacciones

#### ✅ Implementado:
- Modelo completo de transacciones (`TransactionModel`)
- Endpoint para **creación** de transacciones (`POST /api/transactions`)
- Endpoints CRUD completos para Fuentes de Fondos (`/api/funding-sources`)

#### ❌ Pendiente:
- Endpoints para leer, actualizar y eliminar transacciones (`GET`, `PUT`, `DELETE /api/transactions`)
- Lógica completa para diferentes tipos de transacciones:
  - Compra/venta de ítems de juego
  - Compra/venta de productos externos
  - Ajustes de stock
  - Declaraciones de saldo
- Cálculo de comisiones y ganancias
- Actualización automática de stock en transacciones
- Vinculación completa con contactos y fuentes de fondos
- Interfaz de usuario para el registro y gestión de transacciones
    - Listado de transacciones con filtros.
    - Formularios para los diferentes tipos de transacciones.
    - **Vinculación Rápida de Contactos**: En el formulario de creación de transacciones, permitir seleccionar/buscar un contacto existente para asociarlo rápidamente.
    - Vista de detalle de una transacción.
    - Posibilidad de editar/eliminar (si la lógica de negocio lo permite).

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
- Componentes base reutilizables
- **Frontend**: Panel de administración de juegos (`/admin/games` ahora `GameManagementPage.tsx`) con funcionalidad completa para:
  - Listar juegos activos/inactivos y archivados (con filtrado desde el backend).
  - Crear nuevos juegos.
  - Editar juegos existentes.
  - Archivar juegos activos/inactivos.
  - Restaurar juegos archivados.
  - Eliminar permanentemente juegos archivados.
  - Se eliminó el archivo duplicado `GamesManagementPage.tsx`.
- **Frontend**: Interfaz para Fuentes de Fondos (`/funding-sources`) con funcionalidad **completa** para listar, crear, editar, archivar/restaurar y eliminar permanentemente fuentes.
- **Frontend**: Implementadas herramientas de diagnóstico para administradores (accesibles mediante combinación de teclas y URLs seguras, requieren rol de admin):
  - Depurador de Autenticación (`LoginDebugger.tsx`).
  - Inspector/Modificador de Roles de Usuario (`UserRoleDebug.tsx`, `FixUserAdmin.tsx`).

#### ❌ Pendiente:
- Dashboard principal con visión general del negocio
- Interfaz para gestión de productos (*si aplica, revisar si "juegos" cubre esto*)
- Interfaz para gestión de transacciones
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
- **Detalle de Juego (GameDetail)**: Información completa, métricas y transacciones relacionadas
- **Formulario de Juego (GameForm)**: Creación/edición de juegos con validaciones

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
2.  **¡COMPLETADO!** (Interfaz de Juegos Frontend)
3.  **¡COMPLETADO!** (Interfaz de Fuentes de Fondos Frontend - CRUD)
4.  **Transacciones Básicas (Fase 3 parcial)**: Completar la lógica e interfaces para registro de transacciones.
5.  **Gestión de Contactos (Fase 4)**: Implementar el CRUD e interfaces para contactos.
6.  **Precios y Estrategias (Fase 2)**: Completar la gestión de precios y tasas.
7.  **Transacciones Avanzadas (Fase 3 completo)**: Finalizar todas las funcionalidades de transacciones.
8.  **Informes Básicos (Fase 5 parcial)**: Implementar informes fundamentales para el negocio.
9.  **Interfaz Completa (Fase 6 completo)**: Finalizar todas las pantallas y mejoras de UX.
10. **Informes Avanzados (Fase 5 completo)**: Implementar informes personalizados y avanzados.

## Próximos Pasos Inmediatos

1.  **¡HECHO!** (Documentación)
2.  **¡HECHO!** (Implementar interfaz de juegos)
3.  **¡HECHO!** (Implementar la interfaz frontend para fuentes de fondos - CRUD).
4.  Desarrollar sistema de gestión de contactos completo (Backend y Frontend).

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