# Fase 3: Módulo de Transacciones

Este documento detalla la planificación y desarrollo del módulo de transacciones de la aplicación.

## 1. Objetivos Principales del Módulo

*   **Registrar operaciones de compra:**
    *   Compra de ítems de juego a proveedores.
    *   Compra de productos externos (Ej: ExitLag, Recovery Keys) a proveedores.
*   **Registrar operaciones de venta:**
    *   Venta de ítems de juego a clientes.
    *   Venta de productos externos a clientes.
*   **Cálculo de rentabilidad:**
    *   Calcular y registrar la ganancia o pérdida para cada transacción de venta, considerando el costo de adquisición (si aplica y está disponible).
*   **Gestión de comisiones/tarifas:**
    *   Aplicar y registrar cualquier comisión o tarifa asociada a la transacción (ej. porcentaje de ganancia para el operador/plataforma).
*   **Asociación de datos:**
    *   Vincular cada transacción con un contacto específico (cliente o proveedor).
    *   Registrar qué usuario (operador/administrador) realizó la transacción.
*   **Modificación y Anulación:**
    *   Permitir la edición de transacciones existentes (con los permisos adecuados).
    *   Permitir la anulación o cancelación de transacciones (con un sistema de trazabilidad, en lugar de borrado físico quizás).
*   **Impacto en Inventario:**
    *   Actualizar automáticamente el stock de `gameItems` (si se gestiona stock) y `externalProducts` después de cada compra o venta.
*   **Consulta y Búsqueda:**
    *   Proveer funcionalidades para buscar, filtrar y visualizar transacciones según diversos criterios (fecha, tipo, juego/producto, contacto, etc.).

## 2. Tipos de Transacciones

Los tipos de transacciones principales que manejará el módulo son:

*   **`COMPRA_ITEM_JUEGO`**: Adquisición de un ítem de juego a un proveedor.
    *   Impacto: Disminuye saldo de una `fundingSource`, puede aumentar stock de un `gameItem` (si `managesStock` es true).
*   **`VENTA_ITEM_JUEGO`**: Venta de un ítem de juego a un cliente.
    *   Impacto: Aumenta saldo de una `fundingSource`, puede disminuir stock de un `gameItem` (si `managesStock` es true).
*   **`COMPRA_PRODUCTO_EXTERNO`**: Adquisición de un producto externo a un proveedor.
    *   Impacto: Disminuye saldo de una `fundingSource`, aumenta stock de un `externalProduct`.
*   **`VENTA_PRODUCTO_EXTERNO`**: Venta de un producto externo a un cliente.
    *   Impacto: Aumenta saldo de una `fundingSource`, disminuye stock de un `externalProduct`.
*   **`AJUSTE_STOCK_POSITIVO`**: Incremento manual del stock de un `gameItem` o `externalProduct`.
    *   Impacto: Aumenta stock. No afecta directamente `fundingSource`.
*   **`AJUSTE_STOCK_NEGATIVO`**: Decremento manual del stock de un `gameItem` o `externalProduct`.
    *   Impacto: Disminuye stock. No afecta directamente `fundingSource`.
*   **`DEVOLUCION_CLIENTE`**: Un cliente devuelve un ítem/producto.
    *   Impacto: Puede disminuir saldo de una `fundingSource` (reembolso), puede aumentar stock.
*   **`DEVOLUCION_PROVEEDOR`**: Se devuelve un ítem/producto a un proveedor.
    *   Impacto: Puede aumentar saldo de una `fundingSource` (crédito/reembolso), puede disminuir stock.
*   **`DECLARACION_SALDO_INICIAL_CAPITAL`**: Registro o ajuste del saldo de una o varias `fundingSources`.
    *   Impacto: Actualiza `currentBalance` en las `fundingSources` especificadas. No afecta stock.
*   **(Futuro) `TRANSFERENCIA_ENTRE_FUENTES`**: Movimiento de capital entre dos `fundingSources` propias del usuario.
    *   Impacto: Disminuye saldo de `fundingSource` origen, aumenta saldo de `fundingSource` destino. No afecta stock.

## 3. Campos Clave para una Transacción (Modelo de Datos `Transaction`)

La estructura detallada de la colección `transactions` se encuentra en el documento `fase_1_entorno_y_db.md`. A continuación, un resumen de los grupos de campos más relevantes para la lógica de este módulo:

*   **Información General:** `_id`, `transactionDate`, `type`, `operatorUserId`, `contactId` (si aplica), `status`, `notes`, `relatedTransactionId`.
*   **Detalles del Ítem/Producto (`itemDetails`):** (Presente si la transacción involucra un ítem/producto)
    *   `itemType`: ("GameItem" o "ExternalProduct").
    *   `itemId`: Referencia al ítem.
    *   `itemNameSnapshot`: Nombre del ítem en ese momento.
    *   `quantity`: Cantidad transaccionada.
    *   `unitPrice`: Precio unitario (monto, moneda).
    *   `totalAmount`: Monto total por los ítems (monto, moneda).
*   **Detalles del Pago/Movimiento Monetario (`paymentDetails`):** (Presente si la transacción implica un movimiento de dinero o afecta una `fundingSource`)
    *   `fundingSourceId`: Referencia a la `fundingSources` afectada.
    *   `amount`: Monto del movimiento en la `fundingSource`.
    *   `currency`: Moneda del movimiento en la `fundingSource`.
    *   `exchangeRatesUsed`: Tasas de cambio aplicadas.
    *   `valueInReferenceCurrency`: Valor equivalente en USDT (o la moneda de referencia definida).
    *   `fundingSourceBalanceBefore`: Saldo de la fuente antes (opcional, para auditoría).
    *   `fundingSourceBalanceAfter`: Saldo de la fuente después (opcional, para auditoría).
*   **Declaración de Capital (`capitalDeclaration`):** (Presente solo para `type: DECLARACION_SALDO_INICIAL_CAPITAL`)
    *   Array de objetos, cada uno con: `fundingSourceId`, `declaredBalance`, `currency`, `previousBalance`.
*   **Detalles de Ganancia (`profitDetails`):** (Principalmente para ventas)
    *   `costOfGoods`: Costo del ítem vendido.
    *   `commission`: Comisión aplicada.
    *   `grossProfit`: Ganancia bruta.
    *   `netProfit`: Ganancia neta.

## 4. Interacción con otros Módulos

El módulo de transacciones interactuará cercanamente con:

*   **`Módulo de Gestión de Precios y Tasas de Cambio (Fase 2)`:**
    *   Obtendrá las tasas de cambio activas al momento de registrar una transacción para conversiones de moneda.
    *   Podrá usar precios base de ítems/productos para calcular `totalAmount` o como referencia.
*   **`Módulo de Gestión de Contactos (Fase 4)`:**
    *   Se asociará un `contactId` a las transacciones de compra/venta/devolución.
    *   Permitirá ver el historial de transacciones de un contacto.
*   **`Módulo de Informes (Fase 5)`:**
    *   Proveerá los datos base para todos los informes financieros y de inventario.
*   **`Módulo de Gestión de Stock (implícito en `gameItems` y `externalProducts`)`:**
    *   Actualizará `currentStock` en `gameItems` (si `managesStock` es true) y `externalProducts` tras compras, ventas, ajustes o devoluciones.
*   **`Módulo de Fuentes de Fondos (fundingSources)`:** (Definido en `fase_1_entorno_y_db.md`)
    *   Las transacciones que implican movimiento de dinero (compras, ventas, devoluciones con reembolso, declaraciones de saldo) leerán y actualizarán el `currentBalance` de las `fundingSources` relevantes.
    *   Se requerirá una interfaz para que el usuario administre (CRUD) sus `fundingSources`.
*   **`Módulo de Usuarios (users)`:**
    *   Cada transacción registrará el `operatorUserId` que la realizó.
    *   Los permisos de usuario (roles) definirán quién puede crear, modificar o anular transacciones.

## 5. Lógica de Negocio y Consideraciones Específicas

### 5.1. Actualización de Saldos en `fundingSources`

*   **Ventas:** Cuando se registra una `VENTA_ITEM_JUEGO` o `VENTA_PRODUCTO_EXTERNO`:
    *   El `currentBalance` de la `fundingSourceId` especificada en `paymentDetails` se incrementará por el `paymentDetails.amount`.
*   **Compras:** Cuando se registra una `COMPRA_ITEM_JUEGO` o `COMPRA_PRODUCTO_EXTERNO`:
    *   El `currentBalance` de la `fundingSourceId` especificada en `paymentDetails` se decrementará por el `paymentDetails.amount`.
*   **Devolución a Cliente (con reembolso):**
    *   El `currentBalance` de la `fundingSourceId` se decrementará.
*   **Devolución de Proveedor (con crédito/reembolso):**
    *   El `currentBalance` de la `fundingSourceId` se incrementará.
*   **Declaración de Saldo Inicial/Ajuste de Capital (`DECLARACION_SALDO_INICIAL_CAPITAL`):**
    *   Para cada entrada en el array `capitalDeclaration`:
        *   Se buscará la `fundingSource` por `fundingSourceId`.
        *   Se registrará su `currentBalance` actual como `previousBalance` en la transacción.
        *   Se actualizará el `currentBalance` de la `fundingSource` al `declaredBalance` especificado.
*   **(Futuro) Transferencia entre Fuentes:**
    *   Decrementará el saldo de la `fundingSource` origen.
    *   Incrementará el saldo de la `fundingSource` destino.
*   **Auditoría:** Se recomienda almacenar `fundingSourceBalanceBefore` y `fundingSourceBalanceAfter` en el `paymentDetails` de la transacción para facilitar la auditoría y el rastreo de discrepancias.

### 5.2. Actualización de Stock

*   Para `gameItems` con `managesStock: true` y para todos los `externalProducts` (que por defecto gestionan stock o códigos individuales):
    *   **Compras/Ajustes Positivos/Devoluciones de Cliente:** Incrementan `currentStock`.
    *   **Ventas/Ajustes Negativos/Devoluciones a Proveedor:** Decrementan `currentStock`.
*   Se debe manejar el caso de `stockItems` (códigos únicos) para `externalProducts`, marcándolos como "vendidos" y asociando el `transactionId`.

### 5.3. Gestión de `fundingSources` (CRUD)

*   El usuario (administrador) necesitará una interfaz para:
    *   **Crear** nuevas fuentes de fondos (ej. nueva cuenta bancaria, nueva billetera cripto).
        *   Campos: `name`, `currency`, `type`, `details` (info específica de la cuenta), `initialBalance` (que generaría una transacción de `DECLARACION_SALDO_INICIAL_CAPITAL`).
    *   **Listar/Ver** todas las fuentes de fondos activas con sus saldos actuales.
    *   **Editar** los detalles de una fuente de fondos (ej. actualizar nombre, notas, pero no directamente el saldo, que se maneja por transacciones).
    *   **Desactivar/Archivar** fuentes de fondos que ya no se usan (en lugar de borrar, para mantener integridad histórica).

### 5.4. Cálculo de Rentabilidad

*   Para transacciones de venta, si se conoce el `costOfGoods` (costo de adquisición del ítem/producto vendido):
    *   `grossProfit = venta.totalAmount - costOfGoods` (ambos en la misma moneda de referencia, ej. USDT).
    *   `netProfit = grossProfit - comisionesAplicadas`.
*   El `costOfGoods` podría obtenerse de transacciones de compra previas (FIFO, promedio ponderado) o ser un valor estimado.

### 5.5. Generación de Resumen de Inventario y Capital (Estilo "Foto")

*   **Inventario:**
    *   Iterar sobre todos los `gameItems` con `managesStock: true` y mostrar `itemNameSnapshot` y `currentStock`.
    *   Iterar sobre todos los `externalProducts` y mostrar `name` y `currentStock` (o conteo de `stockItems` disponibles).
    *   Para ítems "por pedido" (donde `managesStock: false` para `gameItems` o una configuración similar para `externalProducts`), se listarán como disponibles pero sin cantidad numérica de stock.
*   **Capital Disponible (Caja):**
    *   Iterar sobre todas las `fundingSources` activas del usuario.
    *   Agrupar por `currency` y mostrar el `name` de la fuente y su `currentBalance`.
    *   Mostrar totales por cada `currency`.

### 5.6. Anulación y Modificación de Transacciones

*   **Anulación:** En lugar de borrado físico, se podría marcar una transacción como `status: "cancelled"`.
    *   Si la transacción original afectó stock o saldos, se debería generar una transacción de contrapartida automáticamente para revertir los efectos (ej. si se cancela una venta, el stock se reingresa y el saldo de la `fundingSource` se revierte).
*   **Modificación:** Requerirá cuidado, especialmente si la transacción ya afectó saldos/stock.
    *   Podría implicar anular la original y crear una nueva corregida.
    *   Se deben definir claramente qué campos son modificables y bajo qué condiciones.
    *   Se requiere un log de auditoría para las modificaciones.

## 6. Endpoints de API (Backend)

A continuación, se listan los endpoints de API propuestos para el backend que darán servicio a las funcionalidades del módulo de transacciones y gestión de fuentes de fondos.

**Endpoints para Transacciones (`/api/transactions`):**

*   **`POST /api/transactions`**
    *   **Descripción:** Crea una nueva transacción (compra, venta, ajuste, declaración de saldo, etc.).
    *   **Autenticación:** Requerida (Operador/Admin).
    *   **Cuerpo (Payload):** Objeto `Transaction` conforme al `type` especificado. El servidor validará la estructura y los datos.
    *   **Lógica Principal:** 
        *   Validar datos de entrada.
        *   Actualizar `currentStock` en `gameItems` o `externalProducts` si aplica.
        *   Actualizar `currentBalance` en la `fundingSource` involucrada si aplica.
        *   Registrar `fundingSourceBalanceBefore` y `fundingSourceBalanceAfter` si se configura.
        *   Calcular y guardar `profitDetails` si aplica.
        *   Guardar la transacción en la base de datos.
    *   **Respuesta Exitosa (201):** El documento de la transacción creada.
    *   **Respuestas de Error:** 400 (Bad Request - datos inválidos), 401 (Unauthorized), 403 (Forbidden), 500 (Internal Server Error).

*   **`GET /api/transactions`**
    *   **Descripción:** Lista todas las transacciones, con opciones de filtrado y paginación.
    *   **Autenticación:** Requerida (Operador/Admin).
    *   **Parámetros de Query (Ejemplos):** `type`, `dateFrom`, `dateTo`, `contactId`, `fundingSourceId`, `itemId`, `itemType`, `status`, `page` (default 1), `limit` (default 10), `sortBy` (default `transactionDate`), `sortOrder` (default `desc`).
    *   **Respuesta Exitosa (200):** Objeto con `{ data: [Array de transacciones], pagination: { currentPage, totalPages, totalItems, hasNextPage, hasPrevPage } }`.

*   **`GET /api/transactions/:id`**
    *   **Descripción:** Obtiene los detalles de una transacción específica por su ID.
    *   **Autenticación:** Requerida.
    *   **Respuesta Exitosa (200):** El documento de la transacción.
    *   **Respuestas de Error:** 404 (Not Found).

*   **`PUT /api/transactions/:id`**
    *   **Descripción:** Modifica una transacción existente. (Definir reglas estrictas: podría ser preferible anular y crear una nueva para transacciones completadas que afectaron saldos/stock).
    *   **Autenticación:** Requerida (Admin, o reglas específicas para operadores).
    *   **Cuerpo (Payload):** Campos a modificar.
    *   **Respuesta Exitosa (200):** El documento de la transacción actualizada.

*   **`POST /api/transactions/:id/cancel`**
    *   **Descripción:** Cancela una transacción. Marca la transacción como `status: "cancelled"` y puede generar transacciones de contrapartida para revertir efectos en stock y saldos de `fundingSources`.
    *   **Autenticación:** Requerida (Admin, o reglas específicas).
    *   **Respuesta Exitosa (200):** Objeto con la transacción actualizada y, si aplica, las transacciones de contrapartida generadas.

**Endpoints para Fuentes de Fondos (`/api/funding-sources`):**

*   **`POST /api/funding-sources`**
    *   **Descripción:** Crea una nueva fuente de fondos para el usuario autenticado.
    *   **Autenticación:** Requerida (Usuario asociado a la fuente, típicamente Admin u Operador con permisos).
    *   **Cuerpo (Payload):** Objeto con `{ name, currency, type, details (opcional), initialBalance (opcional) }`.
    *   **Lógica Principal:** Si se provee `initialBalance > 0`, se crea automáticamente una transacción de tipo `DECLARACION_SALDO_INICIAL_CAPITAL` para esta nueva fuente.
    *   **Respuesta Exitosa (201):** El documento de la fuente de fondos creada.

*   **`GET /api/funding-sources`**
    *   **Descripción:** Lista todas las fuentes de fondos activas del usuario autenticado.
    *   **Autenticación:** Requerida.
    *   **Parámetros de Query (Ejemplos):** `status` (default "active"), `currency`, `type`.
    *   **Respuesta Exitosa (200):** Array de fuentes de fondos.

*   **`GET /api/funding-sources/:id`**
    *   **Descripción:** Obtiene los detalles de una fuente de fondos específica perteneciente al usuario.
    *   **Autenticación:** Requerida.
    *   **Respuesta Exitosa (200):** El documento de la fuente de fondos.
    *   **Respuestas de Error:** 404 (Not Found).

*   **`PUT /api/funding-sources/:id`**
    *   **Descripción:** Actualiza los detalles de una fuente de fondos (ej. `name`, `type`, `details`, `status`). El `currentBalance` solo se modifica mediante transacciones.
    *   **Autenticación:** Requerida.
    *   **Cuerpo (Payload):** Campos a modificar.
    *   **Respuesta Exitosa (200):** El documento de la fuente de fondos actualizada.

*   **`DELETE /api/funding-sources/:id`** (o `PUT /api/funding-sources/:id/archive`)
    *   **Descripción:** Desactiva/Archiva una fuente de fondos. No se permite el borrado físico si existen transacciones asociadas para mantener la integridad histórica. Se cambia el `status` a "archived" o "inactive".
    *   **Autenticación:** Requerida.
    *   **Respuesta Exitosa (200 o 204):** Mensaje de confirmación o el recurso actualizado.

**Endpoints para Resúmenes (`/api/summary`):**

*   **`GET /api/summary/financial-snapshot`**
    *   **Descripción:** Obtiene el resumen de inventario (stock de ítems y productos) y capital disponible (saldos en `fundingSources` agrupados por moneda).
    *   **Autenticación:** Requerida.
    *   **Respuesta Exitosa (200):** Objeto estructurado, ej:
        ```json
        {
          "inventory": {
            "gameItems": [
              { "name": "Tibia Coins", "currentStock": 1000, "managesStock": true },
              { "name": "Diamantes PXP", "currentStock": 250, "managesStock": true },
              { "name": "Recovery Key Tibia", "managesStock": false, "availability": "Por pedido" }
            ],
            "externalProducts": [
              { "name": "ExitLag 30 Días", "currentStock": 3 }
            ]
          },
          "capital": {
            "USDT": {
              "total": 4000,
              "sources": [
                { "name": "Binance USDT", "balance": 4000 }
              ]
            },
            "VES": {
              "total": 4500,
              "sources": [
                { "name": "Banco Venezuela VES", "balance": 4500 }
              ]
            },
            "USD": {
              "total": 2000,
              "sources": [
                { "name": "Zelle Personal", "balance": 2000 }
              ]
            }
          }
        }
        ```

Estos endpoints proporcionan una base sólida para la gestión de transacciones y el control financiero que necesitas.

## 7. Componentes de UI (Frontend)

Esta sección describe los componentes de Interfaz de Usuario (Frontend) que se necesitarán para interactuar con el módulo de transacciones y las funcionalidades asociadas. Se priorizará un **tema oscuro** y se podrían utilizar librerías como **Headless UI** (posiblemente con **Tailwind CSS** para el estilizado, como se mencionó en Fase 1) para construir componentes accesibles y personalizables, junto con una **librería de gráficos** (ej. Recharts, Chart.js, Nivo) para la visualización de métricas.

**Componentes Principales y Vistas:**

1.  **Página/Dashboard de Transacciones y Finanzas:**
    *   **`FinancialSnapshotDisplay` (o `FinancialOverviewCard`)**:
        *   **Propósito:** Mostrar el resumen de inventario (ítems, productos y sus stocks) y el capital disponible (saldos en `fundingSources` agrupados por moneda), similar a la "foto" de referencia.
        *   **Datos:** Consume el endpoint `GET /api/summary/financial-snapshot`.
        *   **Características:** Podría incluir mini-gráficos (ej. donas para distribución de capital por moneda, barras para valor de stock) utilizando la librería de gráficos seleccionada. Diseño claro y conciso en tema oscuro.
    *   **`QuickActionsPanel`**:
        *   **Propósito:** Botones o enlaces para acciones comunes.
        *   **Acciones:** "Nueva Transacción", "Declarar Saldos de Capital", "Ver Historial de Transacciones", "Gestionar Fuentes de Fondos".

2.  **Gestión de Transacciones:**
    *   **`TransactionForm` (Modal o Página Dedicada)**:
        *   **Propósito:** Crear y editar transacciones.
        *   **Características:**
            *   Selector para `type` de transacción que adapta dinámicamente los campos del formulario.
            *   Campos para `transactionDate` (con DatePicker), `contactId` (con autocompletar/selector), `operatorUserId` (automático o seleccionable si admin registra por otro).
            *   Sección para `itemDetails` (si aplica): selector de `itemType` e `itemId` (con autocompletar/búsqueda), `quantity`, `unitPrice` (monto y moneda).
            *   Sección para `paymentDetails` (si aplica): selector de `fundingSourceId`, `amount`, `currency`.
            *   Sección para `capitalDeclaration` (para tipo `DECLARACION_SALDO_INICIAL_CAPITAL`): lista de `fundingSourceId` y `declaredBalance`.
            *   Cálculos en tiempo real (ej. `totalAmount`).
            *   Manejo de `notes`.
            *   Validación de campos.
    *   **`TransactionsListPage` (Página Dedicada)**:
        *   **Propósito:** Mostrar una lista paginada y filtrable de todas las transacciones.
        *   **Componentes Internos:**
            *   **`TransactionFilters`**: Controles para filtrar por `type`, rango de fechas, `contactId`, `fundingSourceId`, `status`, etc.
            *   **`TransactionsTable`**: Tabla con columnas como: Fecha, Tipo, Ítem/Producto, Cantidad, Monto, Contacto, Fuente de Fondos, Operador, Estado, Acciones.
            *   **`PaginationControls`**.
        *   **Acciones por Fila:** Ver Detalles, Editar (con permisos), Cancelar (con confirmación).
    *   **`TransactionDetailsView` (Modal o Vista Dedicada)**:
        *   **Propósito:** Mostrar todos los detalles de una transacción específica, incluyendo `profitDetails`, `exchangeRatesUsed`, saldos antes/después de `fundingSource` (si se guardan).

3.  **Gestión de Fuentes de Fondos (`fundingSources`):**
    *   **`FundingSourcesPage` (Página Dedicada en Configuración/Finanzas)**:
        *   **Propósito:** Permitir al usuario administrar sus fuentes de fondos.
        *   **Acción Principal:** Botón para "Añadir Nueva Fuente de Fondos" (abriría `FundingSourceForm`).
        *   **`FundingSourcesTable`**: Lista de fuentes de fondos con columnas: Nombre, Moneda, Tipo, Saldo Actual, Estado, Acciones.
        *   **Acciones por Fila:** Editar, Archivar/Desactivar.
    *   **`FundingSourceForm` (Modal o Página Dedicada)**:
        *   **Propósito:** Crear y editar fuentes de fondos.
        *   **Campos:** `name`, `currency` (selector), `type` (selector), `details` (campos dinámicos según el tipo, ej. `accountNumber` para bancos), `initialBalance` (opcional, al crear).
        *   Validación de campos.

4.  **Componentes Reutilizables (Genéricos, construidos con Headless UI + Estilos):**
    *   `ModalWrapper`: Componente base para modales.
    *   `CustomSelect/Dropdown`: Basado en Headless UI Listbox/Menu.
    *   `CustomDatePicker`: Integración de una librería de date-picker con estilos del tema oscuro.
    *   `DataTable`: Componente genérico para tablas con ordenamiento, paginación (podría usar una librería como TanStack Table).
    *   `StyledButton`, `StyledInput`, `StyledCheckbox`, etc.: Elementos de formulario básicos con el tema oscuro aplicado.
    *   `NotificationToast`: Para mostrar mensajes de éxito, error o informativos.
    *   `LoadingSpinner`: Indicador de carga.
    *   `ConfirmationDialog`: Para acciones destructivas como cancelar transacción o archivar fuente de fondos.

**Consideraciones de Diseño UI/UX Específicas para la Fase 3:**

*   **Claridad en Formularios Complejos:** El `TransactionForm` puede ser complejo. Se debe guiar al usuario, mostrando/ocultando campos relevantes según el tipo de transacción.
*   **Retroalimentación Inmediata:** Indicar claramente el resultado de las operaciones (ej. "Transacción guardada con éxito", "Saldo de Binance actualizado").
*   **Consistencia del Tema Oscuro:** Asegurar que todos los elementos, incluidos los gráficos y componentes de terceros (como date pickers), respeten el tema oscuro.
*   **Accesibilidad:** Aprovechar las capacidades de Headless UI para asegurar que la interfaz sea usable por todos.
*   **Rendimiento en Listas:** Para la `TransactionsTable`, considerar la virtualización si se esperan grandes cantidades de datos.

Estos componentes y consideraciones deberían proporcionar una buena base para el desarrollo del frontend del módulo de transacciones. 