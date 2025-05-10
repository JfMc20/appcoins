# AdminCoins - Backend API

API RESTful para la aplicación AdminCoins, construida con Node.js, Express, TypeScript y MongoDB.

## Configuración y Ejecución

1.  Asegúrate de tener una instancia de MongoDB corriendo (localmente o en Docker/Atlas).
2.  Navega a la carpeta `backend`: `cd backend`
3.  Crea un archivo `.env` basado en `.env.example` (si existe) o con las siguientes variables:
    ```env
    PORT=3002
    MONGODB_URI=mongodb://localhost:27017/AdminCoins # Ajusta si tu MongoDB está en otro lugar
    API_SECRET_KEY=tu_clave_secreta_aqui # Clave para autenticación básica de API de settings
    JWT_SECRET=Token_JWT # Secreto para firmar los JSON Web Tokens
    JWT_EXPIRES_IN=30d # Tiempo de expiración para los JWT (ej. 30d, 1h, 60m)
    # LOG_LEVEL=debug # Opcional: para ver más logs
    ```
4.  Instala dependencias: `npm install`
5.  Ejecuta el servidor de desarrollo (con Nodemon y ts-node): `npm run dev`
    *   El servidor escuchará en el puerto especificado (ej. 3002).

## Sistema de Usuarios y Autenticación

### Roles y Restricciones

La aplicación AdminCoins implementa un sistema de control de acceso basado en roles con jerarquía:

1. **Roles disponibles**:
   - `admin`: Tiene acceso completo a todas las funcionalidades del sistema. Puede crear y gestionar operadores.
   - `operator`: Acceso limitado a operaciones específicas. Cada operador está asignado a un administrador específico.

2. **Jerarquía de Usuarios**:
   - Los administradores pueden crear operadores que quedan asignados a ellos.
   - Los administradores solo pueden ver y gestionar a sus propios operadores.
   - Un administrador puede transferir un operador a otro administrador.
   - Si un operador se convierte en administrador, pierde su asignación.
   - Si un administrador se convierte en operador, se asigna automáticamente al administrador que realizó el cambio.

3. **Lógica de Registro**:
   - La aplicación permite un único usuario administrador real.
   - Existe un usuario de prueba (`test@test.com`) con rol operador que siempre está disponible.
   - El registro público está abierto únicamente cuando no existe ningún usuario administrador real.
   - Una vez se ha creado un usuario administrador, el registro adicional solo puede ser realizado por dicho administrador.

4. **Usuario de Prueba**:
   - Email: `test@test.com`
   - Contraseña: `test12345`
   - Este usuario tiene el rol de `operator` y es útil para probar el sistema sin necesidad de registro.

## Endpoints de API Protegidos

Algunos endpoints requieren una API Key para ser consumidos. Esta debe ser enviada en la cabecera `X-API-Key`.

### Settings API (`/api/settings`)

*   **`GET /exchange-rates`**
    *   Descripción: Obtiene las tasas de cambio fiat actuales almacenadas en la configuración.
    *   Autenticación: Requiere `X-API-Key`.
    *   Ejemplo con `curl` (reemplaza `tu_clave_secreta_aqui` con tu clave real):
        ```bash
        curl -H "X-API-Key: tu_clave_secreta_aqui" http://localhost:3002/api/settings/exchange-rates
        ```
    *   Respuesta Exitosa (200):
        ```json
        {
          "USDT_VES": { "currentRate": 117.05, /* ...otros campos... */ },
          "USDT_COP": { "currentRate": 4193.5, /* ... */ }
          // ...más pares...
        }
        ```

*   **`POST /exchange-rates/refresh`**
    *   Descripción: Dispara una actualización manual de las tasas de cambio desde la fuente externa (CriptoYa).
    *   Autenticación: Requiere `X-API-Key`.
    *   Ejemplo con `curl` (reemplaza `tu_clave_secreta_aqui` con tu clave real):
        ```bash
        curl -X POST -H "X-API-Key: tu_clave_secreta_aqui" http://localhost:3002/api/settings/exchange-rates/refresh
        ```
    *   Respuesta Exitosa (200):
        ```json
        { "message": "Tasas de cambio actualizadas exitosamente." }
        ```
    *   Respuesta de Error (ej. 500):
        ```json
        { "message": "Error al actualizar las tasas de cambio.", "error": "Mensaje detallado del error" }
        ```

## Autenticación de Usuarios (JWT)

La mayoría de los endpoints de la API requieren autenticación mediante JSON Web Tokens (JWT).

### 1. Verificar Estado de Registro

*   **`GET /api/auth/registration-status`**
    *   Descripción: Verifica si el registro está disponible (solo cuando no existe un usuario administrador real).
    *   Acceso: Público.
    *   Respuesta cuando el registro está abierto (200):
        ```json
        {
          "status": "open",
          "message": "El registro está abierto para crear un usuario administrador."
        }
        ```
    *   Respuesta cuando el registro está cerrado (200):
        ```json
        {
          "status": "closed",
          "message": "El registro de nuevos usuarios está actualmente deshabilitado. Ya existe un usuario administrador."
        }
        ```

### 2. Registrar un Nuevo Usuario

*   **`POST /api/auth/register`**
    *   Descripción: Crea un nuevo usuario administrador en el sistema (solo disponible cuando no existe un admin).
    *   Acceso: Público (pero restringido por lógica de negocio).
    *   Cuerpo (Payload):
        ```json
        {
          "username": "adminuser",
          "email": "admin@example.com",
          "password": "contraseñaSegura123",
          "fullName": "Nombre Apellido Admin"
        }
        ```
    *   Respuesta Exitosa (201):
        ```json
        {
          "_id": "userIdGenerado",
          "username": "adminuser",
          "email": "admin@example.com",
          "role": "admin"
        }
        ```
    *   Respuesta si el registro está cerrado (403):
        ```json
        {
          "message": "El registro de nuevos usuarios está actualmente deshabilitado. Ya existe un usuario administrador."
        }
        ```
    *   Nota: Este endpoint no devuelve un token directamente. El usuario debe hacer login después de registrarse.

### 3. Iniciar Sesión

*   **`POST /api/auth/login`**
    *   Descripción: Autentica a un usuario y devuelve un JWT.
    *   Acceso: Público.
    *   Cuerpo (Payload):
        ```json
        {
          "email": "admin@example.com",
          "password": "contraseñaSegura123"
        }
        ```
    *   Respuesta Exitosa (200):
        ```json
        {
          "_id": "userIdGenerado",
          "username": "adminuser",
          "email": "admin@example.com",
          "role": "admin",
          "fullName": "Nombre Apellido Admin",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJJZEdlbmVyYWRvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjE2Njg2MDk2LCJleHAiOjE2MTkyNzgwOTZ9.signature"
        }
        ```

### 4. Usar el Token JWT

Para acceder a rutas protegidas, incluye el token obtenido en el paso anterior en el header `Authorization` de tus peticiones, con el prefijo `Bearer `.

```bash
curl -H "Authorization: Bearer tu_token_jwt_aqui" http://localhost:3002/api/ruta-protegida
```

## API de Administración de Usuarios (`/api/admin/users`)

Endpoints para la gestión de usuarios por parte de los administradores. Todas las rutas requieren autenticación JWT y rol de administrador.

*   **`GET /api/admin/users`**
    *   Descripción: Obtiene todos los usuarios accesibles para el administrador actual (sus operadores asignados y él mismo).
    *   Respuesta Exitosa (200): Lista de usuarios con sus detalles (sin contraseñas).
    *   Notas: La respuesta incluye información sobre a qué administrador está asignado cada operador.

*   **`GET /api/admin/users/:id`**
    *   Descripción: Obtiene los detalles de un usuario específico por su ID.
    *   Respuesta Exitosa (200): Detalles del usuario solicitado.
    *   Respuesta de Error (404): Si el usuario no existe o no es accesible para el administrador actual.

*   **`POST /api/admin/users`**
    *   Descripción: Crea un nuevo usuario (operador o administrador).
    *   Cuerpo (Payload):
        ```json
        {
          "username": "nuevooperador",
          "email": "operador@example.com",
          "password": "contraseñaSegura123",
          "fullName": "Nombre del Operador",
          "role": "operator", // "admin" u "operator"
          "assignedTo": "idDelAdministrador" // Solo para operadores
        }
        ```
    *   Respuesta Exitosa (201): Detalles del usuario creado.
    *   Notas: Si se crea un operador, se asigna automáticamente al administrador que lo crea a menos que se especifique otro administrador en `assignedTo`.

*   **`PUT /api/admin/users/:id`**
    *   Descripción: Actualiza los datos de un usuario existente.
    *   Cuerpo (Payload): Campos a actualizar (similares a los de creación).
    *   Respuesta Exitosa (200): Detalles del usuario actualizado.
    *   Notas: 
        - Si se cambia el rol de un operador a administrador, pierde su asignación.
        - Si se cambia el rol de un administrador a operador, se asigna al administrador que realiza el cambio.
        - Un administrador solo puede modificar a sus propios operadores asignados.

*   **`DELETE /api/admin/users/:id`**
    *   Descripción: Elimina un usuario del sistema.
    *   Respuesta Exitosa (200): Mensaje de confirmación.
    *   Respuesta de Error (400): Si se intenta eliminar el último administrador del sistema.
    *   Notas: Se implementan verificaciones de seguridad para evitar eliminar el último administrador.

## API de Fuentes de Fondos (`/api/funding-sources`)

Endpoints para gestionar las fuentes de capital (cuentas bancarias, efectivo, billeteras cripto, etc.). Todas las rutas requieren autenticación JWT.

*   **`POST /api/funding-sources`**
    *   Descripción: Crea una nueva fuente de fondos para el usuario autenticado.
    *   Cuerpo (Payload):
        ```json
        {
          "name": "Caja Efectivo Principal USD",
          "currency": "USD",
          "type": "EfectivoFisico", // ej: ExchangeCripto, CuentaBancariaNacional, BilleteraElectronica, EfectivoFisico
          "initialBalance": 1000, // Opcional. Si se provee, crea una transacción tipo DECLARACION_SALDO_INICIAL_CAPITAL.
          "notes": "Caja principal en oficina"
        }
        ```
    *   Respuesta Exitosa (201): Documento de la fuente de fondos creada.

*   **`GET /api/funding-sources`**
    *   Descripción: Lista todas las fuentes de fondos del usuario autenticado. Permite filtros por query params (ej. `status`, `currency`, `type`).
    *   Respuesta Exitosa (200): Array de fuentes de fondos.

*   **`GET /api/funding-sources/:id`**
    *   Descripción: Obtiene los detalles de una fuente de fondos específica perteneciente al usuario.
    *   Respuesta Exitosa (200): Documento de la fuente de fondos.

*   **`PUT /api/funding-sources/:id`**
    *   Descripción: Actualiza los detalles de una fuente de fondos (ej. `name`, `type`, `notes`, `status`). **Importante:** El `currentBalance` no se modifica directamente por este endpoint; los cambios de saldo deben realizarse a través de transacciones.
    *   Cuerpo (Payload): Campos a modificar.
    *   Respuesta Exitosa (200): Documento de la fuente de fondos actualizada.

*   **`DELETE /api/funding-sources/:id`** (o `PUT /api/funding-sources/:id/archive`)
    *   Descripción: Desactiva/Archiva una fuente de fondos. No se borra físicamente si tiene transacciones asociadas.
    *   Respuesta Exitosa (200 o 204): Confirmación o recurso actualizado.

## API de Transacciones (`/api/transactions`)

Endpoints para registrar todas las operaciones financieras y de inventario. Todas las rutas requieren autenticación JWT. Los permisos específicos por tipo de transacción se manejan en el controlador.

*   **`POST /api/transactions`**
    *   Descripción: Crea una nueva transacción. El comportamiento exacto depende del `type` especificado en el payload.
    *   Cuerpo (Payload ejemplos):
        *   **Para `DECLARACION_OPERADOR_INICIO_DIA`**: Usada por un operador para declarar su saldo inicial.
            ```json
            {
              "type": "DECLARACION_OPERADOR_INICIO_DIA",
              "transactionDate": "2024-05-10T09:00:00.000Z", // Opcional, default: ahora
              "capitalDeclaration": [
                {
                  "fundingSourceId": "id_de_la_fuente_de_fondos_del_operador",
                  "declaredBalance": 150.75
                }
              ],
              "notes": "Saldo inicial caja chica para el día"
            }
            ```
            *   Reglas: Solo una por operador/fuente/día. `capitalDeclaration` debe tener exactamente una entrada. Rol `operator` o `admin`.

        *   **Para `AJUSTE_ADMIN_CAPITAL`**: Usada por un administrador para ajustes manuales de saldo.
            ```json
            {
              "type": "AJUSTE_ADMIN_CAPITAL",
              "capitalDeclaration": [
                {
                  "fundingSourceId": "id_fuente_1",
                  "declaredBalance": 5000.00
                },
                {
                  "fundingSourceId": "id_fuente_2",
                  "declaredBalance": 1250.25
                }
              ],
              "notes": "Corrección de saldo por admin"
            }
            ```
            *   Reglas: Solo rol `admin`. `capitalDeclaration` puede tener una o más entradas.

        *   **Para `DECLARACION_SALDO_INICIAL_CAPITAL`**: Usada al crear una `FundingSource` con saldo, o para cargas masivas por un `admin`.
            ```json
            {
              "type": "DECLARACION_SALDO_INICIAL_CAPITAL",
              "capitalDeclaration": [
                {
                  "fundingSourceId": "id_de_fuente_nueva_o_existente",
                  "declaredBalance": 10000
                }
              ],
              "notes": "Saldo inicial para nueva cuenta bancaria"
            }
            ```

    *   Respuesta Exitosa (201): El documento de la transacción creada.
    *   Respuestas de Error Comunes:
        *   `400 Bad Request`: Datos inválidos, falta `capitalDeclaration`, tipo de transacción desconocido.
        *   `401 Unauthorized`: Token no provisto o inválido.
        *   `403 Forbidden`: Usuario no tiene permisos para el tipo de transacción o la acción sobre la fuente.
        *   `404 Not Found`: `fundingSourceId` no encontrada.
        *   `409 Conflict`: Ej. intento de `DECLARACION_OPERADOR_INICIO_DIA` duplicada.

    *   _(Otros tipos de transacciones como COMPRA_ITEM_JUEGO, VENTA_ITEM_JUEGO, etc., se documentarán a medida que se implementen completamente su lógica de `itemDetails`, `paymentDetails` y `profitDetails`.)_

## API de Juegos y Productos (`/api/games`)

Endpoints para gestionar juegos y sus ítems. Todas las rutas requieren autenticación JWT.

*   **`GET /api/games`**
    *   Descripción: Obtiene la lista de todos los juegos disponibles.
    *   Respuesta Exitosa (200): Array de juegos.

*   **`GET /api/games/:id`**
    *   Descripción: Obtiene los detalles de un juego específico.
    *   Respuesta Exitosa (200): Detalles del juego solicitado.

*   **`POST /api/games`** (Admin)
    *   Descripción: Crea un nuevo juego.
    *   Cuerpo (Payload):
        ```json
        {
          "name": "Tibia",
          "slug": "tibia",
          "description": "MMORPG creado en 1997",
          "websiteUrl": "https://www.tibia.com",
          "iconUrl": "https://example.com/tibia-icon.png",
          "status": "active",
          "serverOptions": ["Global", "Optional-PvP", "Open-PvP", "Hardcore-PvP"]
        }
        ```
    *   Respuesta Exitosa (201): Detalles del juego creado.

*   **`PUT /api/games/:id`** (Admin)
    *   Descripción: Actualiza los detalles de un juego.
    *   Cuerpo (Payload): Campos a actualizar (similares a los de creación).
    *   Respuesta Exitosa (200): Detalles del juego actualizado.

## Base de Datos (MongoDB)

La aplicación utiliza MongoDB como base de datos. Los modelos principales definidos en `src/models/` son:

*   `GameModel`: Información de los juegos soportados.
*   `GameItemModel`: Ítems/monedas específicas de cada juego.
*   `ExternalProductModel`: Productos externos (software, servicios).
*   `TransactionModel`: Registro de todas las operaciones financieras y de inventario.
*   `ContactModel`: Clientes y proveedores.
*   `UserModel`: Operadores/Administradores de la aplicación, con jerarquía de asignación.
*   `FundingSourceModel`: Fuentes de capital (cuentas, billeteras).
*   `AppSettingModel`: Configuración global de la aplicación (singleton).

### Modelo de Usuario (`UserModel`)

El modelo de usuario incluye los siguientes campos principales:

*   `username`: Nombre de usuario único.
*   `email`: Correo electrónico único.
*   `passwordHash`: Contraseña hasheada con bcrypt.
*   `fullName`: Nombre completo del usuario (opcional).
*   `role`: Rol del usuario (`admin` o `operator`).
*   `status`: Estado del usuario (`active`, `inactive`, `pending_verification`).
*   `assignedTo`: Referencia al administrador que creó/gestiona este operador (solo para operadores).
*   `lastLogin`: Fecha del último inicio de sesión.
*   `failedLoginAttempts`: Contador de intentos fallidos de inicio de sesión.
*   `lockUntil`: Fecha hasta la que el usuario está bloqueado por intentos fallidos.
*   `createdAt` y `updatedAt`: Fechas de creación y última modificación.

El campo `assignedTo` permite implementar la jerarquía entre administradores y operadores, facilitando:
- Que cada administrador vea solo sus propios operadores
- Transferencia de operadores entre administradores
- Seguimiento de quién creó cada operador

### Configuración Global (`AppSetting`)

Existe un único documento en la colección `appsettings` (identificado por `configIdentifier: 'global_settings'`) que almacena la configuración central, incluyendo:

*   `defaultReferenceCurrency`: Moneda base para cálculos (ej. "USDT").
*   `supportedFiatCurrencies`: Lista de monedas fiat activas y su configuración.
*   `defaultTransactionFees`: Comisiones por defecto.
*   `exchangeRateAPIs`: Configuración de APIs externas de tasas.
*   `currentExchangeRates`: **Un mapa que almacena las tasas de cambio fiat actuales (ej. USDT/VES, USDT/COP) obtenidas del servicio externo configurado (actualmente CriptoYa, priorizando Binance P2P).** Este campo es actualizado automáticamente por el servicio de tasas.
*   `notifications`: Configuración de alertas.
*   `businessInfo`: Información básica del negocio.

## Servicios Principales

*   **`ExchangeRateService` (`src/services/ExchangeRateService.ts`)**:
    *   Se encarga de obtener tasas de cambio fiat desde APIs externas (CriptoYa).
    *   Implementa la lógica para seleccionar la tasa preferida (Binance P2P).
    *   Actualiza periódicamente el campo `currentExchangeRates` en el documento `AppSetting` de la base de datos. (Se usa un cron job para esto).

*   **`UserService` (`src/services/UserService.ts`)**:
    *   Gestiona la creación, modificación y eliminación de usuarios.
    *   Implementa la lógica de jerarquía entre administradores y operadores.
    *   Maneja la asignación y reasignación de operadores a administradores.

*   **`AuthService` (`src/services/AuthService.ts`)**:
    *   Administra la autenticación y autorización de usuarios.
    *   Genera y verifica tokens JWT.
    *   Controla la lógica de registro condicionado a la existencia previa de administradores.

*   **`Logger` (`src/utils/logger.ts`)**:
    *   Módulo centralizado para el registro de eventos de la aplicación.
    *   Utiliza `chalk` para salida coloreada y formateada en la consola.
    *   Permite diferentes niveles de log (info, warn, error, debug, db, cron, http).
    *   El nivel de log se puede controlar opcionalmente con la variable de entorno `LOG_LEVEL` (valores: error, warn, info, http, db, cron, debug). Por defecto, es 'debug' en desarrollo y 'info' en producción.

## Scripts Útiles

*   **Probar Servicio de Actualización de Tasas (`testExchangeRates.ts`)**:
    *   Ubicación: `src/scripts/testExchangeRates.ts`
    *   Propósito: Verifica la conexión a la BD, asegura la existencia del documento `AppSettings`, llama a la función `updateFiatExchangeRates` para obtener y almacenar las tasas actuales de CriptoYa (Binance P2P) en la BD, y muestra las tasas resultantes.
    *   Ejecución (desde la carpeta `backend`): `npx ts-node src/scripts/testExchangeRates.ts`

---

## Estructura del Proyecto

*   `/backend`: API RESTful (Node.js, Express, TypeScript, MongoDB)
*   `/frontend`: Interfaz de usuario (React, TypeScript, Vite)
*   `/roadmap_tibia_app`: Documentos de planificación detallada.

## Estado Actual del Desarrollo

El backend actualmente tiene implementado:

1. **Sistema de usuarios completo**:
   - Autenticación con JWT
   - Roles (admin/operator) con jerarquía
   - CRUD completo de usuarios
   - Asignación de operadores a administradores

2. **Sistema de juegos y fuentes de fondos**:
   - Modelos completos
   - Endpoints CRUD

3. **Sistema de transacciones básico**:
   - Modelo completo
   - Endpoints para operaciones CRUD
   - Soporte para diferentes tipos de transacciones

4. **Sistema de tasas de cambio**:
   - Integración con API externa (CriptoYa)
   - Actualización automática mediante cron job
   - Almacenamiento en la configuración global

Los próximos pasos incluyen:
- Completar la lógica para diferentes tipos de transacciones
- Desarrollar el sistema de contactos
- Implementar sistema de informes
- Mejorar la configuración de precios y estrategias

_(Más secciones se añadirán a medida que el proyecto avance: Despliegue, Contribución, etc.)_ 