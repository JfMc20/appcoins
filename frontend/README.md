# AdminCoins - Frontend

Interfaz de usuario para la aplicación AdminCoins, construida con React, TypeScript y Tailwind CSS.

## Características Principales

- **Panel de administración** para gestión de operaciones financieras
- **Sistema de autenticación** con dos roles: administrador y operador
- **Interfaz responsive** adaptada a dispositivos móviles y escritorio
- **Tema claro/oscuro** que se adapta a las preferencias del usuario

## Requisitos

- Node.js (v14 o superior)
- npm o yarn

## Instalación y Uso

1. Clona este repositorio
2. Navega a la carpeta frontend: `cd frontend`
3. Instala las dependencias: `npm install` o `yarn install`
4. Inicia el servidor de desarrollo: `npm start` o `yarn start`
5. Abre [http://localhost:5173](http://localhost:5173) para ver la aplicación

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

## Estructura de Carpetas

```
frontend/
├── public/           # Archivos estáticos
├── src/              # Código fuente
│   ├── components/   # Componentes reutilizables
│   ├── contexts/     # Contextos de React (autenticación, tema, etc.)
│   ├── pages/        # Páginas/vistas de la aplicación
│   ├── services/     # Servicios para comunicación con la API
│   ├── types/        # Definiciones de TypeScript
│   └── utils/        # Utilidades y helpers
├── package.json      # Dependencias y scripts
└── tsconfig.json     # Configuración de TypeScript
```

## Scripts Disponibles

### `npm start`

Inicia el servidor de desarrollo en [http://localhost:5173](http://localhost:5173).

### `npm run build`

Compila la aplicación para producción en la carpeta `build`.

### `npm test`

Ejecuta las pruebas.

### `npm run eject`

**Nota: esta es una operación irreversible. Una vez 'ejectado', no puedes volver atrás.**

Si no estás satisfecho con la configuración de herramientas de construcción, puedes 'ejectar' en cualquier momento.

## Tecnologías Utilizadas

- **React**: Biblioteca principal para la construcción de interfaces
- **TypeScript**: Superconjunto tipado de JavaScript
- **Tailwind CSS**: Framework de utilidades CSS
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para comunicarse con el backend
- **Context API**: Gestión de estado global
