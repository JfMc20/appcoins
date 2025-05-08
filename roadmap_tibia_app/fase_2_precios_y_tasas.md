# Fase 2: Módulo de Gestión de Precios y Tasas de Cambio

Este documento detalla el desarrollo del módulo encargado de gestionar los precios de los productos y las tasas de cambio de monedas fiat.

## 1. Objetivos del Módulo

*   Obtener y almacenar **tasas de cambio fiables y actualizadas** entre la moneda de referencia (ej. USDT) y otras monedas fiat soportadas (ej. VES, COP, MXN, BRL, USD).
*   Permitir la configuración de precios para `gameItems`.
*   Permitir la configuración de precios para `externalProducts`.
*   Proveer la lógica y la tasa de conversión necesaria para que el módulo de transacciones pueda **calcular el valor equivalente de las operaciones en diferentes monedas fiat locales** al momento de realizar/registrar pagos o cobros.

## 2. Gestión de Tasas de Cambio Fiat

*   **Fuentes de Datos (APIs):**
    *   Investigación inicial de APIs para tasas USDT-VES (y otras relevantes):
        *   Posibles candidatas:
            *   **CriptoYa (criptoya.com/api):**
                *   *Pros:* Enfocada en LATAM (incluye VES, ARS, COP, etc.), datos de múltiples exchanges y P2P, API parece pública y gratuita para muchos endpoints, documentación en español.
                *   *Contras:* Frecuencia de actualización y límites de uso para versiones gratuitas deben verificarse. La dependencia de datos P2P puede significar mayor variabilidad o necesidad de promediar.
                *   *Relevancia:* Muy Alta.
                *   **Endpoint General Confirmado (vía docs y prueba):** `GET /api/{coin}/{fiat}/{volumen}`.
                    *   Ejemplo funcional: `https://criptoya.com/api/usdt/ves/1` para obtener precios de 1 USDT en VES.
                    *   **Importante:** El parámetro `{volumen}` es **requerido**. La ruta debe incluir los tres parámetros (`coin`, `fiat`, `volumen`) para funcionar. El endpoint inicial probado (`/api/ve/usdt`) no era correcto.
                    *   *Prueba exitosa:* Se realizó una prueba con el script `criptoya_test_project/testCriptoYa.ts` que confirma la obtención de datos JSON usando el endpoint `/api/usdt/ves/1`.
            *   **Yadio.io (yadio.io):**
                *   *Pros:* Parece también enfocada en LATAM, ofrece API pública.
                *   *Contras:* Documentación de API menos visible, requiere más investigación sobre endpoints, formatos y límites.
                *   *Relevancia:* Potencialmente Alta.
            *   **APIs de Exchanges Grandes (ej. Binance, Kraken):**
                *   *Pros:* APIs públicas robustas para datos de mercado spot, tiers gratuitos usualmente generosos.
                *   *Contras:* Tasas P2P directas vía API son menos comunes; la tasa spot del exchange puede no reflejar la tasa P2P de interés para VES. Requiere que el par específico (ej. USDT/VES) esté listado como par spot.
                *   *Relevancia:* Media-Alta (requiere investigación específica de endpoints).
            *   **AbstractAPI - Exchange Rate API (abstractapi.com):**
                *   *Pros:* Plan gratuito (500 req/mes), soporta fiat y cripto.
                *   *Contras:* Límite bajo en plan gratuito, verificar cobertura de USDT y VES y frecuencia de actualización.
                *   *Relevancia:* Media (posible respaldo).
            *   **ExchangeRatesAPI.io (exchangeratesapi.io):**
                *   *Pros:* Plan gratuito (100 req/mes), enfocado en fiat.
                *   *Contras:* Límite muy bajo, actualizaciones horarias en plan gratuito, verificar cobertura cripto relevante.
                *   *Relevancia:* Media-Baja (posible respaldo para fiat tradicional).
        *   Criterios de selección: Fiabilidad, frecuencia de actualización, costo/límites del plan gratuito, facilidad de integración, disponibilidad de los pares de moneda necesarios (especialmente USDT-VES).
    *   Configuración en `appSettings`:
        *   La colección `appSettings` (definida en Fase 1) contendrá una sección `exchangeRateAPIs` para almacenar URLs, API keys (de forma segura), y prioridades.
        *   Se definirá una **estrategia de selección de tasa** por defecto (configurable):
            *   Usar el precio `bid` (precio al que comprarían tu USDT, podría ser más conservador para tus pagos).
            *   Usar el precio `ask` (precio al que venderían USDT, podría ser relevante si cobras en fiat).
            *   Usar un promedio de `bid` y `ask`.
            *   Usar la tasa de un exchange específico como referencia principal (ej. siempre Binance P2P).
        *   También en `appSettings`, la sección `supportedFiatCurrencies` indicará qué monedas están activas y cuál es su fuente preferida.
*   **Mecanismo de Actualización:**
    *   **Combinación Automático + Manual:**
        *   **Automático:** Tarea programada (cron job) en el backend usando `node-cron` o similar.
            *   *Frecuencia:* Tres veces al día (ej. mañana, mediodía, noche - horarios configurables).
            *   *Lógica:* Obtener tasas para todos los pares activos (USDT-VES, USDT-MXN, USDT-COP, USDT-USD, USDT-BRL, etc.) desde las APIs configuradas, actualizar almacenamiento, registrar logs, manejar errores.
        *   **Manual:** Opción en UI de admin para disparar actualización inmediata o ingresar tasa manualmente si APIs fallan.
*   **Almacenamiento de Tasas:**
    *   **Ubicación:** Documento de configuración global en `appSettings`.
    *   **Estructura:** Se almacenará la tasa actual y la anterior para permitir mostrar cambios. Ejemplo:
        ```js
        // Dentro de appSettings
        currentExchangeRates: {
          USDT_VES: {
            currentRate: Number,   // Tasa más reciente
            previousRate: Number, // Tasa anterior
            change: Number,      // Diferencia numérica
            changePercent: Number, // Cambio porcentual
            lastUpdated: Date,   // Fecha de currentRate
            source: String       // Fuente (ej: 'CriptoYa')
          },
          USDT_MXN: { /* ... */ },
          USDT_COP: { /* ... */ },
          USDT_USD: { /* ... */ },
          USDT_BRL: { /* ... */ }
        }
        ```
    *   **Historial Detallado:** Solo se guardan la tasa actual y la previa en `appSettings`. Si se requiere un historial más largo, se podría considerar una colección separada de logs de tasas en el futuro.
*   **Acceso a las Tasas:**
    *   El backend proveerá un endpoint o servicio interno para que otros módulos (especialmente transacciones) obtengan la **tasa de conversión seleccionada (según la estrategia definida)** para un par de monedas.

## 3. Gestión de Precios de `gameItems`

Esta sección detalla cómo se definirán, almacenarán y gestionarán los precios de compra y venta para los ítems específicos de cada juego.

*   **Objetivo:** Establecer precios base para las transacciones de `gameItems`, permitiendo flexibilidad en la estrategia de precios y asegurando que se puedan calcular los valores correctos en las operaciones.
*   **Almacenamiento:** La información de precios se asociará directamente con cada documento en la colección `gameItems` (definida en Fase 1). Se propone añadir un campo `pricing` de tipo Objeto a la estructura de `gameItems`.

*   **Estrategias de Precios Propuestas:**

    *   **1. Precio Fijo (Estrategia Principal Inicial):**
        *   **Descripción:** Se define un precio de compra y/o venta específico por unidad del `gameItem`. Este precio se establece típicamente en la moneda de referencia principal de la aplicación (ej., USDT).
        *   **Campo en `gameItems`:** Se añadirá/modificará un campo `pricing` de tipo Objeto dentro de cada documento `gameItem`.
        *   **Estructura Detallada del campo `pricing` (cuando `strategy` es "fixed"):**
            ```js
            pricing: {
              strategy: { 
                type: String, 
                enum: ['fixed', 'margin', 'other'], // Estrategia de precio
                required: true, 
                default: 'fixed' 
              }, 
              referenceCurrency: { 
                type: String, // Moneda en la que se definen los precios base (ej. "USDT")
                required: true, 
                default: 'USDT' // Podría tomarse de appSettings.defaultReferenceCurrency
              }, 
              // Precios por unidad del gameItem en referenceCurrency
              sellPricePerUnit: { 
                type: Number // Precio al que VENDES el item al cliente 
                             // (Opcional si solo compras este item)
              },  
              buyPricePerUnit: { 
                type: Number  // Precio al que COMPRAS el item al cliente
                              // (Opcional si solo vendes este item)
              },   
              lastUpdated: { 
                type: Date // Fecha de última actualización de estos precios
              }          
            }
            ```
        *   **Notas Importantes:**
            *   Los campos `sellPricePerUnit` y `buyPricePerUnit` son opcionales individualmente. Si un `gameItem` tiene `isTradable: true`, al menos uno de estos precios debería estar definido.
            *   Estos precios son la base por unidad en la moneda de referencia (`referenceCurrency`).
            *   Al registrar una transacción, el sistema tomará el precio unitario correspondiente (`buy` o `sell`), lo multiplicará por la `quantity`, y luego usará la tasa de cambio fiat (obtenida según la Sección 2) para calcular el valor final en la moneda local (ej. VES, COP) si es necesario.

    *   **2. Margen sobre Costo de Adquisición (Posible Estrategia Futura/Avanzada):**
        *   **Descripción:** El precio de venta se calcula automáticamente aplicando un margen (porcentual o fijo) sobre el costo registrado de adquisición del ítem.
        *   **Dependencias:** Esta estrategia es más compleja y requiere:
            *   Que el `gameItem` tenga `managesStock: true`.
            *   Un sistema para registrar el costo de adquisición de los ítems en stock (ej., costo promedio ponderado, costo por lote específico - FIFO/LIFO). La implementación de esta gestión de costos podría ser parte de la Fase 3 (Módulo de Transacciones) o un módulo de inventario dedicado.
        *   **Decisión:** Se considera una mejora potencial para fases posteriores. **La implementación inicial se centrará exclusivamente en la estrategia de "Precio Fijo".**

    *   **3. Vinculado a Tasa de Cambio Específica del Juego (Menos Prioritario):**
        *   **Descripción:** El precio de un ítem se define en términos de otro ítem del mismo juego (ej. 1 EspadaLegendaria = 10,000 TibiaCoins).
        *   **Aplicabilidad:** Podría ser útil en escenarios muy específicos dentro de un juego, pero es menos relevante para el flujo principal de conversión a USDT/Fiat. Se podría implementar en el futuro si surge la necesidad.

*   **Interfaz de Configuración (Requisito Frontend - Fase 6 / Admin):**
    *   Se requerirá una sección en la interfaz de administración (accesible por rol 'admin') que permita:
        *   Listar, buscar y seleccionar `gameItems`.
        *   Para cada `gameItem` seleccionado:
            *   Ver/Modificar el campo `pricing`.
            *   Establecer/Actualizar `sellPricePerUnit` y `buyPricePerUnit` en la moneda de referencia (`referenceCurrency`).
            *   (Futuro) Seleccionar otras estrategias de precio si se implementan.

## 4. Gestión de Precios de `externalProducts`

Esta sección detalla cómo se gestionarán los precios de venta para los productos externos (ej. software, códigos, servicios). Dado que estos productos generalmente se *venden* al cliente final y no se *compran* de ellos de la misma manera que los `gameItems`, el enfoque principal estará en el precio de venta.

*   **Objetivo:** Establecer precios de venta claros para los `externalProducts` y permitir el cálculo de su valor en diferentes monedas fiat al momento de la transacción.
*   **Almacenamiento:** La información del precio de venta principal se almacenará directamente en el documento `externalProduct` dentro de la colección `externalProducts` (definida en Fase 1), utilizando el campo `price` existente. El costo de adquisición (si se rastrea) se almacena en el campo `cost`.

*   **Estrategia de Precios Principal:**

    *   **Precio Fijo de Venta:**
        *   **Descripción:** Se define un precio de venta fijo para el producto. Este precio se puede establecer directamente en la moneda de referencia (ej. USDT) o, si es más conveniente para ciertos productos, directamente en una moneda local principal (ej. VES). **Se recomienda definir los precios base en la moneda de referencia (USDT) para mayor consistencia.**
        *   **Campo en `externalProducts`:** Se utilizará el campo `price` (definido en Fase 1) que ya tiene la estructura:
            ```js
            price: {
              amount: { type: Number, required: true }, // Monto del precio de venta
              currency: { type: String, required: true } // Código de la moneda (ej. "USDT", "VES")
            }
            ```
        *   **Campo de Costo (Opcional):** El campo `cost` (también definido en Fase 1) se puede usar para registrar el costo de adquisición y calcular márgenes:
             ```js
            cost: {
              amount: { type: Number },
              currency: { type: String } // Moneda en la que se adquirió
            }
            ```
        *   **Notas Importantes:**
            *   El campo `price` representa el precio al que se **vende** el producto al cliente. No se contempla un `buyPrice` ya que típicamente no se compran estos productos *del* cliente.
            *   Si el `price.currency` es la moneda de referencia (ej. "USDT"), al realizar una transacción en una moneda local (ej. "VES"), se utilizará la tasa de cambio fiat (obtenida según la Sección 2) para calcular el valor final en VES.
            *   Si el `price.currency` ya está en la moneda local (ej. "VES"), ese será el precio final en esa moneda, pero se podría usar la tasa de cambio inversa para calcular el valor equivalente en USDT para reportes internos si fuera necesario.
            *   El campo `cost` es opcional y se usaría internamente para calcular la ganancia (`profit`) en la transacción.

*   **Interfaz de Configuración (Requisito Frontend - Fase 6 / Admin):**
    *   Se necesita una interfaz en la sección de administración para:
        *   Listar, buscar y seleccionar `externalProducts`.
        *   Para cada producto:
            *   Establecer/Actualizar el `price.amount` y `price.currency`.
            *   (Opcional) Establecer/Actualizar el `cost.amount` y `cost.currency`.

## 5. Interacción con el Módulo de Transacciones

Este módulo de precios y tasas es fundamental para que el Módulo de Transacciones (Fase 3) pueda calcular y registrar correctamente los valores monetarios de cada operación. El flujo de interacción típico al registrar una nueva transacción será el siguiente:

1.  **Identificación del Ítem/Producto:** El usuario selecciona el `gameItem` o `externalProduct` que se está transaccionando.
2.  **Determinación del Precio Unitario Base:**
    *   El sistema recupera la información de `pricing` del `gameItem` seleccionado o el campo `price` del `externalProduct`.
    *   Se identifica el precio unitario relevante para el tipo de transacción:
        *   Para una **venta** (vendes al cliente): Se usa `pricing.sellPricePerUnit` (para `gameItems`) o `price.amount` (para `externalProducts`).
        *   Para una **compra** (compras al cliente): Se usa `pricing.buyPricePerUnit` (para `gameItems`). (Las compras de `externalProducts` desde clientes no son el caso de uso principal aquí).
    *   Se anota este precio base y su `referenceCurrency` (ej. USDT).
3.  **Entrada de Cantidad y Moneda de Pago/Cobro:**
    *   El usuario introduce la cantidad (`quantity`) del ítem/producto.
    *   El usuario indica la moneda en la que se realizará el pago o cobro final con el cliente (ej. "VES", "COP", "USDT").
4.  **Obtención de Tasa de Cambio (si es necesaria):**
    *   Si la moneda de pago/cobro es diferente de la `referenceCurrency` del precio base (ej., el precio base está en USDT y el pago es en VES):
        *   El sistema consulta internamente (a través de un servicio del backend) la tasa de conversión vigente almacenada en `appSettings.currentExchangeRates` para el par correspondiente (ej. USDT-VES), utilizando la **estrategia de selección de tasa** configurada (bid, ask, promedio).
5.  **Cálculo de Valores Finales:**
    *   `totalAmountInReferenceCurrency` = `quantity` * `precioUnitarioBase`
    *   Si se usó una tasa de cambio:
        *   `totalAmountInLocalCurrency` = `totalAmountInReferenceCurrency` * `tasaDeCambio` (o división, dependiendo de la dirección de la tasa).
    *   (Opcional) Cálculo de comisión y ganancia según las reglas definidas.
6.  **Almacenamiento en la Transacción:**
    *   Todos estos valores calculados, junto con la tasa de cambio utilizada (si aplica) y los precios base, se almacenan en el documento de la colección `transactions`, en los campos que definimos en la Fase 1 (ej. `unitPrice`, `totalAmount`, `exchangeRatesUsed`, `valueInReferenceCurrency`, `valueInLocalCurrency`, `commission`, `profit`, etc.).
    *   Esto asegura que cada transacción tenga un registro completo de los valores y tasas aplicados en ese momento específico, independientemente de cómo cambien los precios o tasas en el futuro.

*   **Interfaz de Usuario (Feedback):** Durante el proceso de registro de la transacción en el frontend, se deben mostrar al usuario los cálculos intermedios y el valor final en la moneda de pago/cobro de forma clara antes de confirmar la operación.

## 6. Consideraciones Técnicas del Backend (Node.js/Express)

Para implementar la funcionalidad descrita en esta fase, se requerirán los siguientes desarrollos en el backend:

*   **API Endpoints:** Se crearán (o modificarán) los siguientes endpoints RESTful:
    *   **Para el Frontend General / Dashboard:**
        *   `GET /api/settings/exchange-rates`: Devuelve las tasas de cambio actuales y sus cambios recientes (desde `appSettings.currentExchangeRates`). Protegido para usuarios autenticados.
    *   **Para Administración (Rol 'admin'):**
        *   `POST /api/admin/settings/exchange-rates/refresh`: Dispara la actualización manual de todas las tasas de cambio activas desde las APIs configuradas.
        *   `PUT /api/admin/settings/exchange-rates`: Permite modificar la configuración de tasas en `appSettings` (ej. cambiar la estrategia de selección, activar/desactivar monedas, actualizar manualmente una tasa).
        *   `PUT /api/admin/game-items/:itemId/pricing`: Actualiza el objeto `pricing` de un `gameItem` específico.
        *   `PUT /api/admin/external-products/:productId/pricing`: Actualiza los campos `price` y/o `cost` de un `externalProduct` específico.
        *   `GET /api/admin/settings`: Endpoint para obtener la configuración completa de `appSettings` (incluyendo tasas, APIs, etc.) para la UI de administración.

*   **Servicios (Lógica de Negocio):** Se crearán o extenderán servicios para encapsular la lógica:
    *   `ExchangeRateService`:
        *   `fetchFromExternalAPI(apiConfig)`: Lógica para llamar a APIs externas (ej. CriptoYa) basado en la configuración.
        *   `selectRate(rates, strategy)`: Aplica la estrategia de selección (bid, ask, avg) sobre los datos devueltos por la API.
        *   `updateStoredRates()`: Orquesta la obtención de todas las tasas activas y actualiza el documento en `appSettings`, calculando `currentRate`, `previousRate`, `change`, etc.
        *   `getConversionRate(fromCurrency, toCurrency)`: Devuelve la tasa de conversión actual almacenada para ser usada por otros módulos (como Transacciones).
    *   `PricingService`:
        *   `getItemPrice(itemType, itemId, transactionType)`: Obtiene el precio unitario base (`buy` o `sell`) en la moneda de referencia para un `gameItem` o `externalProduct`.
        *   `updateGameItemPricing(itemId, pricingData)`: Valida y actualiza los datos de precios para un `gameItem`.
        *   `updateExternalProductPricing(productId, priceData, costData)`: Valida y actualiza los datos de precio/costo para un `externalProduct`.
    *   `CronJobService` (o configuración en `server.js` / `app.js`):
        *   Utilizar `node-cron` u otra librería similar para configurar la tarea que llame a `ExchangeRateService.updateStoredRates()` 3 veces al día según los horarios definidos.

*   **Modelos de Mongoose:**
    *   Asegurar que los esquemas de Mongoose para `AppSettings`, `GameItem`, y `ExternalProduct` reflejen las estructuras de datos definidas en la Fase 1 y en esta Fase 2 (incluyendo el campo `pricing` en `GameItem` y la estructura `currentExchangeRates` en `AppSettings`).
    *   Implementar validaciones a nivel de esquema con Mongoose.

*   **Manejo de Errores y Logging:**
    *   Implementar manejo robusto de errores para las llamadas a las APIs de tasas (timeouts, errores de red, respuestas inesperadas, formato inválido). Incluir reintentos básicos o fallback si hay APIs alternativas configuradas.
    *   Agregar logging detallado para las ejecuciones del cron job (éxito, errores, tasas actualizadas) y para las actualizaciones manuales de precios/tasas.

*   **Seguridad:**
    *   Implementar middleware de autenticación (`isAuthenticated`) y autorización (`isAdmin`) para proteger los endpoints `/api/admin/...`.
    *   Almacenar y gestionar de forma segura las API keys de servicios externos (usar variables de entorno - `dotenv`).

## 7. Requisito Frontend Asociado: Panel de Cambios

*   La Interfaz de Usuario (Fase 6) deberá mostrar un panel con las tasas actuales (ej. para USDT contra VES, MXN, COP, USD, BRL), indicando visualmente el cambio (magnitud y dirección) desde la última actualización, basado en los datos `currentRate` y `previousRate` almacenados en `appSettings`.
*   El backend proveerá un endpoint específico para obtener estos datos formateados para el panel.

--- 