# Herramientas de Diagnóstico para Administradores de AppCoins

Este documento contiene información confidencial sobre las herramientas de diagnóstico disponibles para administradores del sistema.

## Acceso Seguro

Las herramientas de diagnóstico han sido movidas a URLs seguras y ocultas para evitar acceso no autorizado. 
Puedes acceder a ellas de dos maneras:

### 1. Combinación de Teclas (Recomendado)

Para activar las herramientas de diagnóstico, usa la siguiente combinación de teclas en cualquier página de la aplicación:

1. Presiona `Ctrl + Alt + D`
2. Luego presiona `T` (antes de 2 segundos)

Esto te llevará directamente al depurador de autenticación.

### 2. URLs Directas

Si necesitas acceder directamente, puedes usar las siguientes URLs (requiere ser administrador):

- **Depurador de Autenticación**: `/secure-system-diagnostics-5f7e3a9d8c1b6/auth-analyzer`
- **Inspector de Usuario**: `/secure-system-diagnostics-5f7e3a9d8c1b6/user-inspector`
- **Herramientas de Admin**: `/secure-system-diagnostics-5f7e3a9d8c1b6/admin-tools`

## Funcionalidades Disponibles

### Depurador de Autenticación
- Analiza respuestas de login en tiempo real
- Muestra información del token actual
- Permite pruebas de conexión con el backend

### Inspector de Usuario
- Muestra información detallada del usuario actual
- Proporciona detalles del token almacenado
- Permite verificar estado de autenticación

### Herramientas de Admin
- Permite forzar el rol de administrador cuando sea necesario
- Útil para situaciones de emergencia donde la autenticación presenta problemas

## Seguridad

Esta información debe mantenerse confidencial. Las herramientas están protegidas por:

1. Rutas complejas difíciles de descubrir mediante técnicas de fuzzing
2. Verificación obligatoria de rol de administrador
3. Sin enlaces visibles en la interfaz de usuario

Para mayor seguridad, considere cambiar periódicamente las rutas de acceso en el archivo `pathnames.ts`. 