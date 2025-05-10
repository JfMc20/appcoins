# AdminCoins - Frontend

Interfaz de usuario para la aplicación AdminCoins, construida con React, TypeScript y Tailwind CSS.

## Características Principales

- **Panel de administración** para gestión de operaciones financieras
  - Administración de usuarios con jerarquía administrador-operador
  - Gestión de juegos y fuentes de fondos
  - Registro de transacciones con distintos tipos
- **Sistema de autenticación** con dos roles: administrador y operador
  - Login/Logout con JWT
  - Protección de rutas según permisos
- **Interfaz responsive** adaptada a dispositivos móviles y escritorio
  - Diseño moderno con Tailwind CSS
  - Componentes personalizados reutilizables
- **Tema claro/oscuro** que se adapta a las preferencias del usuario
  - Transiciones suaves entre temas
  - Persistencia de preferencia de tema

## Requisitos

- Node.js (v14 o superior)
- npm o yarn
- Servidor Backend AdminCoins configurado y ejecutándose

## Instalación y Uso

1. Clona este repositorio
2. Navega a la carpeta frontend: `cd frontend`
3. Instala las dependencias: `npm install` o `yarn install`
4. Crea un archivo `.env` con la URL del backend:
   ```
   REACT_APP_API_BASE_URL=http://localhost:3002/api
   ```
5. Inicia el servidor de desarrollo: `npm start` o `yarn start`
6. Abre [http://localhost:5173](http://localhost:5173) para ver la aplicación

## Sistema de Autenticación

La aplicación implementa un sistema de autenticación que:

1. **Permite un único usuario administrador real**
2. **Incluye un usuario de prueba** con rol operador:
   - Email: `test@test.com`
   - Contraseña: `test12345`

### Flujo de registro

- Al iniciar la aplicación, se verifica si existe un usuario administrador
- Si no existe, el formulario de registro está disponible para crear uno
- Una vez existe un administrador, el registro público se cierra
- Los usuarios adicionales solo pueden ser creados por el administrador

### Jerarquía de Usuarios

La aplicación implementa una relación jerárquica entre usuarios:

- **Administradores**: Pueden crear y gestionar operadores
- **Operadores**: Están asignados a un administrador específico
- **Funcionalidades especiales**:
  - Cada administrador solo ve a sus propios operadores asignados
  - Se puede transferir operadores entre administradores
  - Al cambiar el rol de un usuario, se actualiza su asignación automáticamente

## Módulos e Interfaces Implementadas

### 1. Panel de Administración de Usuarios
- **UserManagementPage**: Panel principal para gestionar usuarios
  - Listado de usuarios con información detallada (nombre, email, rol, estado)
  - Formulario para creación de nuevos usuarios (operadores y administradores)
  - Asignación de operadores a administradores
  - Indicadores visuales de estado y rol

### 2. Gestión de Juegos (En desarrollo)
- **GamesList**: Tabla con filtros, buscador y acciones rápidas
- **GameDetail**: Información completa, métricas y transacciones relacionadas
- **GameForm**: Creación/edición de juegos con validaciones

### 3. Gestión de Fuentes de Fondos (En desarrollo)
- **FundingDashboard**: Resumen de saldos y distribución de capital
- **FundingSourcesList**: Filtros por tipo/moneda e indicadores visuales
- **FundingSourceDetail**: Información específica según tipo y transacciones
- **FundingSourceForm**: Campos dinámicos según tipo seleccionado

### 4. Gestión de Transacciones (En desarrollo)
- **TransactionDashboard**: Resumen y métricas
- **TransactionSearch**: Filtros complejos y exportación
- **TransactionDetail**: Información completa y relacionadas
- **TransactionForms**: Asistentes específicos según tipo
- **TransactionAnalytics**: Análisis de rentabilidad y tendencias

## Componentes Comunes Reutilizables

En la carpeta `src/components/common` se encuentran componentes reutilizables:

- **Button**: Botones personalizables con diferentes variantes y estados
- **Card**: Contenedor con estilos para mostrar información
- **Input**: Campos de entrada con etiquetas y validación
- **Select**: Selector desplegable personalizado
- **LoadingSpinner**: Indicador de carga para operaciones asíncronas
- **Modal**: Ventanas modales para diálogos y formularios
- **Table**: Tabla de datos con ordenamiento y paginación
- **Alert**: Mensajes de alerta y notificaciones
- **Badge**: Etiquetas para estados y categorías
- **Dropdown**: Menús desplegables para opciones

## Servicios y Comunicación con el Backend

La aplicación utiliza servicios ubicados en `src/services` para comunicarse con la API:

- **authService**: Autenticación, registro y gestión de tokens
- **userService**: Administración de usuarios (creación, actualización, eliminación)
- **gameService**: Operaciones CRUD para juegos
- **fundingSourceService**: Gestión de fuentes de fondos
- **transactionService**: Registro y consulta de transacciones

## Estructura de Carpetas

```
frontend/
├── public/             # Archivos estáticos
├── src/                # Código fuente
│   ├── components/     # Componentes reutilizables
│   │   ├── common/     # Componentes básicos (Button, Input, Card, etc.)
│   │   ├── layout/     # Componentes de estructura (Sidebar, Header, etc.)
│   │   ├── forms/      # Formularios reutilizables
│   │   └── ui/         # Componentes de interfaz específicos
│   ├── contexts/       # Contextos de React (autenticación, tema, etc.)
│   ├── hooks/          # Hooks personalizados
│   ├── pages/          # Páginas/vistas de la aplicación
│   │   ├── admin/      # Vistas para administradores
│   │   ├── auth/       # Páginas de login/registro
│   │   ├── dashboard/  # Vistas de resumen
│   │   └── settings/   # Configuración del sistema
│   ├── services/       # Servicios para comunicación con la API
│   ├── types/          # Definiciones de TypeScript
│   ├── utils/          # Utilidades y helpers
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Punto de entrada
│   └── router/         # Configuración de rutas
├── tailwind.config.js  # Configuración de Tailwind CSS
├── vite.config.ts      # Configuración de Vite
├── package.json        # Dependencias y scripts
└── tsconfig.json       # Configuración de TypeScript
```

## Scripts Disponibles

### `npm start` o `npm run dev`

Inicia el servidor de desarrollo en [http://localhost:5173](http://localhost:5173).

### `npm run build`

Compila la aplicación para producción en la carpeta `build`.

### `npm test`

Ejecuta las pruebas.

## Estado Actual del Desarrollo

El frontend actualmente tiene implementado:

1. **Sistema de autenticación completo**:
   - Login/Logout con tokens JWT
   - Rutas protegidas según rol
   - Persistencia de sesión

2. **Panel de administración de usuarios**:
   - Listado de usuarios con filtros
   - Creación de operadores con asignación a administradores
   - Visualización de relaciones jerárquicas

3. **Componentes comunes**:
   - Biblioteca de componentes UI reutilizables
   - Tema claro/oscuro con Tailwind
   - Formularios con validación

4. **Servicios conectados**:
   - Comunicación con API para usuarios, juegos, fondos y transacciones
   - Manejo de errores y loading states

Los próximos pasos incluyen:
- Completar interfaces para gestión de juegos
- Implementar vistas para fuentes de fondos
- Desarrollar formularios para los diferentes tipos de transacciones
- Crear dashboards con resúmenes y métricas

## Tecnologías Utilizadas

- **React**: Biblioteca principal para la construcción de interfaces
- **TypeScript**: Superconjunto tipado de JavaScript
- **Tailwind CSS**: Framework de utilidades CSS
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para comunicarse con el backend
- **Context API**: Gestión de estado global
