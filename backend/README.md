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

### 1. Registrar un Nuevo Usuario

*   **`POST /api/auth/register`**
    *   Descripción: Crea un nuevo usuario en el sistema.
    *   Acceso: Público (o restringido a administradores según configuración futura).
    *   Cuerpo (Payload):
        ```json
        {
          "username": "nuevooperador",
          "email": "operador@example.com",
          "password": "contraseñaSegura123",
          "fullName": "Nombre Apellido Operador",
          "role": "operator" // Opcional, default: "operator". Puede ser "admin".
        }
        ```
    *   Respuesta Exitosa (201):
        ```json
        {
          "_id": "userIdGenerado",
          "username": "nuevooperador",
          "email": "operador@example.com",
          "role": "operator"
        }
        ```
    *   Nota: Este endpoint no devuelve un token directamente. El usuario debe hacer login después de registrarse.

### 2. Iniciar Sesión

*   **`POST /api/auth/login`**
    *   Descripción: Autentica a un usuario y devuelve un JWT.
    *   Acceso: Público.
    *   Cuerpo (Payload):
        ```json
        {
          "email": "operador@example.com",
          "password": "contraseñaSegura123"
        }
        ```
    *   Respuesta Exitosa (200):
        ```json
        {
          "_id": "userIdGenerado",
          "username": "nuevooperador",
          "email": "operador@example.com",
          "role": "operator",
          "fullName": "Nombre Apellido Operador",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJJZEdlbmVyYWRvIiwicm9sZSI6Im9wZXJhdG9yIiwiaWF0IjoxNjE2Njg2MDk2LCJleHAiOjE2MTkyNzgwOTZ9.signature"
        }
        ```

### 3. Usar el Token JWT

Para acceder a rutas protegidas, incluye el token obtenido en el paso anterior en el header `Authorization` de tus peticiones, con el prefijo `Bearer `.

```bash
curl -H "Authorization: Bearer tu_token_jwt_aqui" http://localhost:3002/api/ruta-protegida
```

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

## Base de Datos (MongoDB)

La aplicación utiliza MongoDB como base de datos. Los modelos principales definidos en `src/models/` son:

*   `Game`: Información de los juegos soportados.
*   `GameItem`: Ítems/monedas específicas de cada juego.
*   `ExternalProduct`: Productos externos (software, servicios).
*   `Transaction`: Registro de todas las operaciones.
*   `Contact`: Clientes y proveedores.
*   `User`: Operadores/Administradores de la aplicación.
*   `FundingSource`: Fuentes de capital (cuentas, billeteras).
*   `AppSetting`: Configuración global de la aplicación (singleton).

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

_(Más secciones se añadirán a medida que el proyecto avance: Despliegue, Contribución, etc.)_ 