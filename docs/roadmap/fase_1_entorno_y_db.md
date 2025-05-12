# Fase 1: Configuración del Entorno y Diseño de Base de Datos (MongoDB)

Este documento detalla los pasos y consideraciones para la Fase 1 del proyecto: "Aplicación de Gestión Multi-Juego y Productos".

## 1. Configuración del Entorno de Desarrollo

Esta sección cubrirá la configuración inicial necesaria para el desarrollo.

*   **Backend (Node.js con Express):**
    *   Instalación de Node.js (versión LTS recomendada) y gestor de paquetes (npm o yarn).
    *   Inicialización del proyecto (`npm init` o `yarn init`).
    *   Instalación de dependencias clave:
        *   `express`: Framework web.
        *   `mongoose`: ODM para MongoDB, facilitará la interacción con la base de datos.
        *   `dotenv`: Para gestionar variables de entorno.
        *   `nodemon`: Para reiniciar automáticamente el servidor durante el desarrollo.
        *   (Otras según se necesiten: `cors` para habilitar peticiones de otros dominios, `bcryptjs` para hashing de contraseñas, `jsonwebtoken` para autenticación basada en tokens, `morgan` para logging de peticiones HTTP).
    *   Definición de una estructura de carpetas base para el proyecto backend:
        ```
        /src
        |-- config/           # Conexión a BD, variables de entorno
        |-- models/           # Definiciones de esquemas de Mongoose (Módulos de datos)
        |-- controllers/      # Lógica de negocio para cada ruta (Módulos de control)
        |-- routes/           # Definición de rutas de la API (Módulos de ruteo)
        |-- middlewares/      # Middlewares personalizados (ej. auth, error handling)
        |-- services/         # (Opcional) Lógica de negocio más compleja o reutilizable
        |-- utils/            # Funciones de utilidad
        |-- app.js            # Configuración principal de Express y middlewares globales
        |-- server.js         # Punto de entrada, inicia el servidor
        ```
*   **Frontend (React with TypeScript):**
    *   Instalación de Node.js (si no está ya para el backend).
    *   Creación del proyecto React (elegir una opción):
        *   Opción A (Create React App): `npx create-react-app nombre-app-frontend --template typescript`
        *   Opción B (Vite - recomendado por rapidez y modernidad): `npm create vite@latest nombre-app-frontend -- --template react-ts`
    *   Instalación de librerías frontend básicas y estructura de módulos:
        *   `axios` o `fetch API`: Para peticiones HTTP al backend.
        *   `react-router-dom`: Para la gestión de rutas/navegación.
        *   Librerías de UI (Opcional, elegir una o ninguna): Material-UI, Ant Design, Chakra UI, o Tailwind CSS (con Headless UI).
        *   Gestor de estado (Opcional, según complejidad): Redux Toolkit, Zustand, Context API with hooks.
    *   Definición de una estructura de carpetas base (ejemplo):
        ```
        /src
        |-- components/       # Componentes reutilizables (UI)
        |   |-- common/         # Botones, Inputs, Modales genéricos
        |   |-- layout/         # Navbar, Sidebar, Footer
        |   `-- specific/       # Componentes específicos de alguna feature
        |-- pages/            # Componentes de nivel de página (Vistas principales)
        |-- features/         # (Alternativa a pages) Módulos agrupados por funcionalidad
        |-- services/         # Lógica para interactuar con APIs (ej. authService, transactionService)
        |-- hooks/            # Hooks personalizados
        |-- store/            # (Si se usa Redux/Zustand) Configuración del estado global
        |-- context/          # (Si se usa Context API) Definiciones de contextos
        |-- types/            # Definiciones de tipos e interfaces de TypeScript
        |-- assets/           # Imágenes, fuentes, etc.
        |-- styles/           # Estilos globales, variables CSS, temas
        |-- utils/            # Funciones de utilidad del frontend
        |-- App.tsx           # Componente raíz de la aplicación, configuración de rutas
        |-- main.tsx          # Punto de entrada de React
        ```
        *   **Consideración Clave para UI/UX:** La aplicación debe ser completamente **responsiva**, ofreciendo una experiencia de usuario óptima tanto en dispositivos de escritorio como en móviles (tablets y smartphones).
            *   Esto implicará el uso de técnicas de diseño responsivo (CSS Media Queries, Flexbox, Grid Layout).
            *   Elección de librerías de UI (si se usan) que soporten o faciliten el diseño responsivo (ej. Material-UI, Ant Design, Chakra UI, o frameworks CSS como Tailwind CSS).
            *   Pruebas continuas en diferentes tamaños de pantalla durante el desarrollo.
*   **Base de Datos (MongoDB):**
    *   **Opción 1 (Local con Docker - Preferida para desarrollo y consistencia):**
        *   Asegurar que Docker y Docker Compose estén instalados.
        *   Configuración de un archivo `docker-compose.yml` para definir el servicio de MongoDB.
        *   Esto permitirá levantar la base de datos de forma aislada y reproducible.
        *   Creación de la base de datos para el proyecto dentro del contenedor Docker.
    *   **Opción 2 (Cloud - Recomendado para facilidad y colaboración):**
        *   Crear una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
        *   Configurar un clúster gratuito (M0 Sandbox).
        *   Configurar el acceso (IP Whitelist, usuario de base de datos).
        *   Obtener la cadena de conexión (connection string).
    *   **Herramientas de Gestión:**
        *   Instalación de [MongoDB Compass](https://www.mongodb.com/products/compass) (GUI oficial) para visualizar y gestionar la base de datos.
        *   (Alternativa) Extensiones de VSCode para MongoDB.
*   **Control de Versiones (Git):**
    *   Inicialización de un repositorio Git en la raíz del proyecto (o monorepo con workspaces si se prefiere gestionar backend y frontend juntos pero modularmente).
    *   Creación de archivos `.gitignore` adecuados para Node.js (incluyendo `node_modules/`, `.env`) y React (incluyendo `node_modules/`, `build/`, `.env.local`).
    *   Definición de una estrategia de ramas (ej. `main` para producción, `develop` para integración, `feature/nombre-feature` para desarrollo de nuevas funcionalidades).
    *   (Opcional pero recomendado) Configuración de un repositorio remoto (GitHub, GitLab, Bitbucket).

*   **Principios de Diseño de Código Aplicados (Backend y Frontend):**
    *   **Modularidad:** El código se organizará en módulos cohesivos y poco acoplados.
        *   *Backend:* La estructura propuesta (rutas, controladores, servicios, modelos) facilita la separación de cada área de funcionalidad.
        *   *Frontend:* Se fomentará la creación de componentes y módulos (features/pages) que encapsulen su propia lógica y presentación.
    *   **Separación de Responsabilidades (SoC):** Cada módulo, clase o función debe tener una única responsabilidad bien definida.
        *   *Backend:* Los controladores manejan las peticiones HTTP, los servicios la lógica de negocio, y los modelos la interacción con la base de datos. Los middlewares se encargan de tareas transversales (autenticación, logging, errores).
        *   *Frontend:* Los componentes se dividirán en presentacionales (dumb components) y contenedores (smart components) cuando sea apropiado. Los servicios manejarán la lógica de API, y los hooks la lógica de estado reutilizable.
    *   **Reutilización:** Se buscará crear componentes, funciones y servicios genéricos y reutilizables siempre que sea posible para evitar la duplicación de código (principio DRY - Don't Repeat Yourself).
        *   *Backend:* Funciones de utilidad, servicios genéricos.
        *   *Frontend:* Componentes de UI comunes (botones, inputs, layouts), hooks personalizados, funciones de utilidad.
    *   **Código Limpio y Legible:** Se seguirán convenciones de nombrado claras, se escribirán funciones cortas y enfocadas, y se añadirán comentarios solo cuando sea necesario para explicar lógica compleja.

## 2. Diseño de la Base de Datos (MongoDB)

A continuación, se proponen las colecciones iniciales y su estructura, pensadas para la flexibilidad de MongoDB.

### Colecciones Principales (Visión General):

1.  `games`: Información de los juegos soportados.
2.  `gameItems`: Monedas o ítems específicos de cada juego (vinculados a `games`).
3.  `externalProducts`: Productos externos como software, servicios, con gestión de stock.
4.  `transactions`: Registro de todas las operaciones.
5.  `contacts`: Datos de clientes/proveedores.
6.  `users`: (Si se requiere) Operadores de la aplicación con roles y permisos.
7.  `appSettings`: Configuraciones generales, tasas de cambio fiat activas, comisiones por defecto, etc.

---

(Aquí comenzaremos a detallar cada colección una por una)

### 2.1. Colección: `games`
*   **Propósito:** Almacenar información sobre los diferentes juegos que la aplicación gestionará.
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `name`: `String` (Nombre del juego, ej: "Tibia", "Albion Online") - Requerido, Idealmente único.
    *   `shortName`: `String` (Nombre corto o código, ej: "TB", "AO") - Opcional, Único si se usa.
    *   `description`: `String` (Descripción breve del juego) - Opcional.
    *   `iconUrl`: `String` (URL a un logo o ícono del juego) - Opcional.
    *   `status`: `String` (Valores posibles: "active", "archived", "coming_soon") - Default: "active".
    *   `createdAt`: `Date` (Timestamp de creación) - Automático (ej. con `timestamps: true` en Mongoose).
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `name: 1` { unique: true } (para búsquedas rápidas y asegurar unicidad).
    *   `shortName: 1` { unique: true, sparse: true } (si se implementa y es único).
    *   `status: 1`

---

### 2.2. Colección: `gameItems`
*   **Propósito:** Almacenar información sobre las monedas o ítems específicos de cada juego que se pueden comercializar.
*   **Relaciones:**
    *   Vinculada a la colección `games` a través de `gameId`.
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `gameId`: `ObjectId` (Referencia al `_id` de la colección `games`) - Requerido.
    *   `name`: `String` (Nombre del ítem/moneda, ej: "Tibia Coin", "Exalted Orb", "Poción de Vida Mayor") - Requerido.
    *   `itemCode`: `String` (Código corto o identificador único interno si se necesita, ej: "TC", "EXALT", "HP_POT_L") - Opcional, Único dentro de un mismo `gameId` si se usa.
    *   `type`: `String` (Categoría del ítem, ej: "Moneda", "Equipamiento", "Consumible", "Material de Crafteo", "Cosmético") - Requerido. Ayuda a clasificar y filtrar.
    *   `description`: `String` (Descripción detallada del ítem/moneda) - Opcional.
    *   `iconUrl`: `String` (URL a un logo o ícono del ítem) - Opcional.
    *   `stackable`: `Boolean` (Indica si el ítem se puede apilar en el inventario del juego. ej: monedas sí, una espada única no) - Default: `true` (especialmente para monedas).
    *   `isTradable`: `Boolean` (Indica si este ítem es uno que el usuario de la app activamente comercializa) - Default: `true`.
    *   `defaultUnit`: `String` (Unidad estándar para las transacciones de este ítem, ej: "unidad", "k" (miles), "kk" (millones), "stack") - Opcional.
    *   `managesStock`: `Boolean` (Indica si el usuario gestiona un stock propio de este ítem en la app. Si `false`, solo se registran transacciones. Si `true`, se controlará `currentStock`) - Default: `false`.
    *   `currentStock`: `Number` (Cantidad actual en stock, relevante si `managesStock` es `true`) - Default: `0`.
    *   `lowStockThreshold`: `Number` (Umbral para alertar sobre stock bajo, si `managesStock` es `true`) - Opcional.
    *   `status`: `String` (ej: "active" - disponible para transacciones, "archived" - no se usa más, "rare_find" - para ítems especiales) - Default: "active".
    *   `attributes`: `Array` de `Object` (Para propiedades dinámicas y específicas del ítem que no son comunes a todos. ej: `[{ "key": "Servidor", "value": "Mondebra" }, { "key": "Tier", "value": "5.3" }]`) - Opcional, para máxima flexibilidad.
    *   `averageCostRef`: `Object` (Costo promedio ponderado unitario en moneda de referencia, calculado y actualizado tras cada compra si `managesStock` es true y se usa este método de costeo) - Opcional.
        *   `amount`: `Number`.
        *   `currency`: `String` (ej. "USDT").
    *   `createdAt`: `Date` (Timestamp de creación) - Automático.
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `gameId: 1` (Para filtrar ítems por juego).
    *   `gameId: 1, name: 1` { unique: true } (Asegura que el nombre de un ítem sea único dentro de un mismo juego).
    *   `gameId: 1, itemCode: 1` { unique: true, sparse: true } (Si `itemCode` se usa y debe ser único por juego).
    *   `type: 1` (Para búsquedas por tipo de ítem).
    *   `status: 1`
    *   `managesStock: 1` (Para encontrar rápidamente ítems con gestión de stock).

---

### 2.3. Colección: `externalProducts`
*   **Propósito:** Almacenar información sobre productos o servicios externos que se comercializan y que no son ítems intrínsecos de un juego (ej. software, códigos de activación, servicios).
*   **Relaciones:**
    *   Opcionalmente vinculada a la colección `games` a través de `relatedGameId` si el producto es específico para un juego.
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `name`: `String` (Nombre del producto, ej: "ExitLag Pin 30 Días", "Tibia Account Recovery Key") - Requerido.
    *   `productCode`: `String` (Código corto o SKU, ej: "ELAG30D", "RECKEY_TB") - Opcional, Único si se usa.
    *   `category`: `String` (Categoría del producto, ej: "Software", "Servicio", "Suscripción", "Código Digital") - Requerido.
    *   `description`: `String` (Descripción detallada del producto) - Opcional.
    *   `supplier`: `String` (Proveedor del producto, si aplica) - Opcional.
    *   `relatedGameId`: `ObjectId` (Referencia opcional al `_id` de la colección `games` si este producto es específico para un juego) - Opcional.
    *   `managesStock`: `Boolean` (Indica si se gestiona un stock de este producto. ej: para códigos de activación sí, para un servicio de consultoría quizás no) - Default: `true`.
    *   `currentStock`: `Number` (Cantidad actual en stock, si `managesStock` es `true`) - Default: `0`.
    *   `lowStockThreshold`: `Number` (Umbral para alertar sobre stock bajo, si `managesStock` es `true`) - Opcional.
    *   `stockItems`: `Array` de `Object` (Si `managesStock` es true y necesitas rastrear códigos individuales. ej: `[{ code: "XYZ123", status: "available", addedAt: Date }, { code: "ABC789", status: "sold", soldAt: Date, transactionId: ObjectId }]`) - Opcional, útil para códigos únicos.
    *   `price`: `Object` (Para definir el precio de venta)
        *   `amount`: `Number` (Monto del precio) - Requerido.
        *   `currency`: `String` (Código de la moneda del precio, ej: "USDT", "VES", "USD") - Requerido. (Este precio se usará o convertirá al momento de la transacción).
    *   `cost`: `Object` (Opcional, para definir el costo de adquisición si se quiere calcular margen)
        *   `amount`: `Number`
        *   `currency`: `String`
    *   `status`: `String` (ej: "active" - disponible para venta, "discontinued", "out_of_stock") - Default: "active".
    *   `imageUrl`: `String` (URL a una imagen del producto) - Opcional.
    *   `tags`: `Array` de `String` (Para facilitar búsquedas y categorización, ej: ["gaming", "vpn", "security"]) - Opcional.
    *   `createdAt`: `Date` (Timestamp de creación) - Automático.
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `name: 1` (Para búsquedas).
    *   `productCode: 1` { unique: true, sparse: true } (Si se usa y debe ser único).
    *   `category: 1`
    *   `status: 1`
    *   `relatedGameId: 1` (Si se usa frecuentemente para filtrar por juego).
    *   `tags: 1` (Si se usa para búsquedas).

---

### 2.4. Colección: `transactions`
*   **Propósito:** Registrar todas las operaciones de compra, venta, ajustes de stock y movimientos de capital.
*   **Relaciones:**
    *   Vinculada a `contacts` a través de `contactId` (para compras/ventas).
    *   Vinculada a `gameItems` O `externalProducts` (polimórfica, para transacciones de ítems/productos).
    *   Vinculada a `users` a través de `operatorUserId` (quién registró la transacción).
    *   Vinculada a `fundingSources` a través de `fundingSourceId` (de dónde sale o a dónde entra el dinero para transacciones monetarias).
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `transactionDate`: `Date` (Fecha y hora en que ocurrió la transacción) - Requerido, Default: `Now`.
    *   `type`: `String` (Tipo de transacción, ej: "COMPRA_ITEM_JUEGO", "VENTA_ITEM_JUEGO", "COMPRA_PRODUCTO_EXTERNO", "VENTA_PRODUCTO_EXTERNO", "AJUSTE_STOCK_POSITIVO", "AJUSTE_STOCK_NEGATIVO", "DEVOLUCION_CLIENTE", "DEVOLUCION_PROVEEDOR", "DECLARACION_SALDO_INICIAL_CAPITAL") - Requerido.
    *   `contactId`: `ObjectId` (Referencia al `_id` de la colección `contacts`. Requerido para compras/ventas/devoluciones) - Opcional.
    *   `operatorUserId`: `ObjectId` (Referencia al `_id` de la colección `users`) - Requerido.

    *   **Item Transaccionado (Polimórfico - para tipos de transacción que involucren ítems/productos):**
        *   `itemDetails`: `Object` - Opcional (presente si la transacción involucra un ítem/producto).
            *   `itemType`: `String` (Indica la colección del ítem: "GameItem" o "ExternalProduct") - Requerido si `itemDetails` existe.
            *   `itemId`: `ObjectId` (Referencia al `_id` del ítem en `gameItems` o `externalProducts`) - Requerido si `itemDetails` existe.
            *   `itemNameSnapshot`: `String` (Nombre del ítem al momento de la transacción, para historial) - Requerido si `itemDetails` existe.
            *   `gameIdSnapshot`: `ObjectId` (Si `itemType` es "GameItem", el `gameId`. Si `itemType` es "ExternalProduct" y tiene `relatedGameId`, ese valor) - Opcional.
            *   `quantity`: `Number` (Cantidad del ítem transaccionado) - Requerido si `itemDetails` existe.
            *   `unitPrice`: `Object` (Precio acordado por unidad del ítem) - Opcional (presente en compras/ventas).
                *   `amount`: `Number`.
                *   `currency`: `String` (ej: "USDT", "VES").
            *   `totalAmount`: `Object` (Monto total de la parte del ítem: `quantity * unitPrice.amount`) - Opcional (presente en compras/ventas).
                *   `amount`: `Number`.
                *   `currency`: `String`.

    *   **Movimiento Monetario (para tipos de transacción que involucren flujo de dinero):**
        *   `paymentDetails`: `Object` - Opcional (presente si la transacción implica un movimiento de dinero).
            *   `fundingSourceId`: `ObjectId` (Referencia a `fundingSources` de donde sale (compra) o a donde entra (venta) el dinero) - Requerido si `paymentDetails` existe.
            *   `amount`: `Number` (Monto del movimiento) - Requerido si `paymentDetails` existe.
            *   `currency`: `String` (Moneda del movimiento, ej: "USDT", "VES", "USD") - Requerido si `paymentDetails` existe.
            *   `exchangeRatesUsed`: `Array` de `Object` (Tasas de cambio aplicadas si `paymentDetails.currency` es diferente a la `currency` de `unitPrice` o si se quiere registrar la conversión a una moneda de referencia) - Opcional.
                *   `fromCurrency`: `String`
                *   `toCurrency`: `String`
                *   `rate`: `Number`
                *   `source`: `String` (ej. "API_CriptoYa", "Manual_Admin")
            *   `valueInReferenceCurrency`: `Object` (Valor del movimiento en la moneda de referencia, ej. USDT).
                *   `amount`: `Number`.
                *   `currency`: `String` (ej. "USDT").
            *   `fundingSourceBalanceBefore`: `Number` (Saldo de la `fundingSourceId` antes de esta transacción. Para auditoría) - Opcional.
            *   `fundingSourceBalanceAfter`: `Number` (Saldo de la `fundingSourceId` después de esta transacción. Para auditoría) - Opcional.

    *   **Declaración de Saldos (para tipo `DECLARACION_SALDO_INICIAL_CAPITAL`):**
        *   `capitalDeclaration`: `Array` de `Object` - Opcional (presente solo si `type` es "DECLARACION_SALDO_INICIAL_CAPITAL").
            *   `fundingSourceId`: `ObjectId` (Referencia a `fundingSources`).
            *   `declaredBalance`: `Number` (El nuevo saldo declarado para esa fuente).
            *   `currency`: `String` (Moneda de la fuente).
            *   `previousBalance`: `Number` (Saldo anterior de la fuente, para auditoría).

    *   **Comisiones y Ganancias (principalmente para ventas):**
        *   `profitDetails`: `Object` - Opcional.
            *   `costOfGoods`: `Object` (Costo del ítem vendido, si se conoce y se quiere calcular ganancia neta).
                *   `amount`: `Number`.
                *   `currency`: `String`.
            *   `commission`: `Object` (Comisión aplicada a la transacción).
                *   `percentage`: `Number`.
                *   `fixedAmount`: `Number`.
                *   `calculatedAmount`: `Number`.
                *   `description`: `String` (Opcional, ej. "Comisión Plataforma Venta", "Fee Operador").
                *   `currency`: `String`.
            *   `grossProfit`: `Object` (Ganancia bruta: `totalAmount` - `costOfGoods`).
                *   `amount`: `Number`.
                *   `currency`: `String`.
            *   `netProfit`: `Object` (Ganancia neta: `grossProfit` - `commission`).
                *   `amount`: `Number`.
                *   `currency`: `String`.
            *   `otherFees`: `Array` de `Object` (Para otras tarifas asociadas a la transacción, ej., comisión bancaria, fee de Pago Móvil) - Opcional.
                *   `amount`: `Number`.
                *   `currency`: `String`.
                *   `description`: `String` (ej. "Comisión Banco", "Fee Pago Móvil").

    *   `notes`: `String` (Notas adicionales sobre la transacción) - Opcional.
    *   `status`: `String` (ej: "completed", "pending", "cancelled", "error") - Default: "completed".
    *   `relatedTransactionId`: `ObjectId` (Para enlazar transacciones, ej. una devolución a su venta original) - Opcional.
    *   `createdAt`: `Date` (Timestamp de creación) - Automático.
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `transactionDate: -1` (Para ordenar por más recientes).
    *   `type: 1` (Para filtrar por tipo).
    *   `contactId: 1` (Para buscar transacciones de un contacto).
    *   `operatorUserId: 1`
    *   `itemDetails.itemId: 1` (Si se busca frecuentemente por ítem específico).
    *   `itemDetails.itemType: 1`
    *   `paymentDetails.fundingSourceId: 1` (Para transacciones por fuente de fondos).
    *   `status: 1`
    *   `capitalDeclaration.fundingSourceId: 1` (Si se usa `DECLARACION_SALDO_INICIAL_CAPITAL`).

---

### 2.5. Colección: `contacts`
*   **Propósito:** Almacenar información sobre los clientes, proveedores u otras personas con las que se realizan transacciones.
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `displayName`: `String` (Nombre principal o alias para mostrar, ej: "Juan Pérez", "Cliente TibiaCoins VIP", "Proveedor Rápido") - Requerido.
    *   `firstName`: `String` (Nombre de pila) - Opcional.
    *   `lastName`: `String` (Apellido) - Opcional.
    *   `type`: `String` (Tipo de contacto, ej: "Cliente", "Proveedor", "Ambos", "Otro") - Opcional, Default: "Cliente".
    *   `primaryContactMethod`: `Object` (El método de contacto principal y preferido) - Opcional.
        *   `platform`: `String` (ej: "WhatsApp", "Telegram", "Discord", "InGame", "Email", "Phone").
        *   `identifier`: `String` (ej: "+123456789", "usuarioDiscord#1234", "NombrePersonajeEnJuego", "correo@dominio.com").
        *   `gameId`: `ObjectId` (Referencia opcional a `games` si el `identifier` es un nombre de personaje en un juego específico).
    *   `additionalContactMethods`: `Array` de `Object` (Otros métodos de contacto) - Opcional.
        *   `platform`: `String`
        *   `identifier`: `String`
        *   `gameId`: `ObjectId` (Opcional)
    *   `notes`: `String` (Notas generales sobre el contacto) - Opcional.
    *   `tags`: `Array` de `String` (Etiquetas para clasificar o agrupar contactos, ej: ["VIP", "Mayorista", "RiesgoBajo", "Juego_Tibia"]) - Opcional.
    *   `status`: `String` (ej: "active", "inactive", "blocked") - Requerido, Default: "active".
    *   `lastTransactionDate`: `Date` (Fecha de la última transacción con este contacto, se puede actualizar mediante triggers o lógica de aplicación) - Opcional.
    *   `totalTransactionsCount`: `Number` (Contador del total de transacciones, actualizable) - Opcional.
    *   `totalVolume`: `Object` (Volumen total transaccionado con este contacto en moneda de referencia) - Opcional.
        *   `amount`: `Number`
        *   `currency`: `String` (ej. "USDT")
    *   `profileImageUrl`: `String` (URL a una imagen de perfil del contacto) - Opcional.
    *   `createdAt`: `Date` (Timestamp de creación) - Automático.
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `displayName: 1` (Para búsqueda por nombre).
    *   `type: 1`
    *   `status: 1`
    *   `tags: 1` (Para búsquedas por etiquetas).
    *   `primaryContactMethod.platform: 1, primaryContactMethod.identifier: 1` (Para buscar por método de contacto principal).
    *   `additionalContactMethods.platform: 1, additionalContactMethods.identifier: 1` (Si se necesita buscar en métodos adicionales).
    *   `lastTransactionDate: -1` (Para encontrar contactos recientes/inactivos).

---

### 2.6. Colección: `users`
*   **Propósito:** Gestionar las cuentas de los usuarios que operan la aplicación, con diferentes roles y permisos.
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `username`: `String` (Nombre de usuario para login, debe ser único) - Requerido.
    *   `email`: `String` (Email del usuario, debe ser único) - Requerido. (Podría usarse como alternativa al username para login).
    *   `password`: `String` (Contraseña hasheada) - Requerido.
    *   `role`: `String` (Rol del usuario, ej: "operator", "admin") - Requerido.
    *   `displayName`: `String` (Nombre para mostrar en la interfaz) - Opcional.
    *   `status`: `String` (ej: "active", "inactive", "pending_verification") - Requerido, Default: "active".
    *   `lastLoginAt`: `Date` (Timestamp del último inicio de sesión) - Opcional.
    *   `failedLoginAttempts`: `Number` (Contador de intentos fallidos) - Default: 0.
    *   `lockedUntil`: `Date` (Si la cuenta está bloqueada temporalmente por muchos intentos fallidos) - Opcional.
    *   `createdAt`: `Date` (Timestamp de creación) - Automático.
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `username: 1` { unique: true }
    *   `email: 1` { unique: true }
    *   `role: 1`
    *   `status: 1`

---

### 2.7. Colección: `appSettings`
*   **Propósito:** Almacenar configuraciones globales y parámetros operativos de la aplicación. Usualmente contendrá un único documento o un conjunto muy limitado de documentos de configuración.
*   **Campos (para un documento de configuración global):**
    *   `_id`: `ObjectId` (PK)
    *   `configIdentifier`: `String` (ej: "global_settings", para identificar este documento único) - Requerido, Único.
    *   `defaultReferenceCurrency`: `String` (Código de la moneda fiat principal de referencia para cálculos internos y reportes, ej: "USDT") - Requerido.
    *   `supportedFiatCurrencies`: `Array` de `Object` (Lista de monedas fiat que la aplicación soporta para visualización y transacciones)
        *   `code`: `String` (ej: "VES", "COP", "USD") - Requerido, Único en el array.
        *   `symbol`: `String` (ej: "Bs.", "$", "$") - Requerido.
        *   `name`: `String` (ej: "Bolívar Venezolano", "Peso Colombiano", "US Dollar") - Requerido.
        *   `isActive`: `Boolean` (Indica si esta moneda está actualmente activa para su uso en la app) - Default: `true`.
        *   `apiSource`: `String` (Identificador de la API o método para obtener su tasa contra la `defaultReferenceCurrency`) - Opcional.
    *   `activeGameIds`: `Array` de `ObjectId` (Referencias a `_id` de la colección `games`. Almacena los IDs de los juegos que el admin ha marcado como activos para operar en esta instancia de la aplicación. Si está vacío o no existe, se asumen todos los juegos como activos) - Opcional.
    *   `defaultTransactionFees`: `Object` (Configuración de comisiones por defecto)
        *   `type`: `String` (ej: "percentage", "fixed")
        *   `sellRate`: `Number` (Valor de la comisión para ventas, ej: 0.05 para 5% o un monto fijo)
        *   `buyRate`: `Number` (Valor de la comisión para compras)
        *   `currency`: `String` (Moneda de la comisión si es fija, ej: "USDT") - Opcional.
    *   `exchangeRateAPIs`: `Array` de `Object` (Configuración para APIs de tasas de cambio)
        *   `name`: `String` (Nombre de la API, ej: "CentralBankAPI", "CryptoCompare")
        *   `apiKey`: `String` (Clave de API, cifrada o manejada de forma segura) - Opcional.
        *   `baseUrl`: `String` (URL base de la API) - Opcional.
        *   `priority`: `Number` (Para definir el orden de preferencia si hay múltiples APIs) - Opcional.
        *   `isEnabled`: `Boolean` - Default: `true`.
    *   `notifications`: `Object` (Configuración de notificaciones)
        *   `lowStockAlertsEnabled`: `Boolean` - Default: `true`.
        *   `adminEmailForAlerts`: `String` (Email del admin para recibir alertas) - Opcional.
    *   `businessInfo`: `Object` (Información del negocio/operador para reportes, etc.) - Opcional
        *   `name`: `String`
        *   `contactEmail`: `String`
    *   `lastModifiedBy`: `ObjectId` (Referencia al `user` que hizo el último cambio) - Opcional.
    *   `createdAt`: `Date`
    *   `updatedAt`: `Date`
*   **Índices Sugeridos:**
    *   `configIdentifier: 1` { unique: true }

---

### 2.8. Colección: `fundingSources`
*   **Propósito:** Almacenar información sobre las diferentes fuentes de fondos (cuentas bancarias, billeteras de cripto, efectivo) donde el usuario gestiona su capital.
*   **Relaciones:**
    *   Vinculada a `users` a través de `userId` (a qué usuario pertenece esta fuente de fondos).
*   **Campos:**
    *   `_id`: `ObjectId` (PK, automático por MongoDB)
    *   `userId`: `ObjectId` (Referencia al `_id` de la colección `users`) - Requerido.
    *   `name`: `String` (Nombre descriptivo y único para el usuario, ej: "Binance USDT Spot", "Banco de Venezuela Principal VES", "Efectivo USD Caja Chica", "Zelle Juan Pérez") - Requerido.
    *   `currency`: `String` (Código de la moneda principal de esta fuente, ej: "USDT", "VES", "USD", "COP", "BRL", "MXN") - Requerido.
    *   `type`: `String` (Tipo de fuente, ej: "ExchangeCripto", "CuentaBancariaNacional", "CuentaBancariaInternacional", "BilleteraElectronica", "EfectivoFisico", "Otro") - Requerido.
    *   `currentBalance`: `Number` (Saldo actual de esta fuente de fondos) - Requerido, Default: `0`.
    *   `details`: `Object` (Información adicional específica del tipo de cuenta, almacenar con precaución datos sensibles) - Opcional.
        *   `accountNumber`: `String` (Para cuentas bancarias).
        *   `email`: `String` (Para Zelle, PayPal, etc.).
        *   `walletAddress`: `String` (Para criptomonedas).
        *   `bankName`: `String`.
        *   `holderName`: `String`.
        *   (Otros campos según necesidad).
    *   `status`: `String` (Valores posibles: "active", "inactive", "archived") - Default: "active".
    *   `lastTransactionDate`: `Date` (Fecha de la última transacción que afectó esta fuente) - Opcional.
    *   `notes`: `String` (Notas adicionales) - Opcional.
    *   `createdAt`: `Date` (Timestamp de creación) - Automático.
    *   `updatedAt`: `Date` (Timestamp de última actualización) - Automático.
*   **Índices Sugeridos:**
    *   `userId: 1, name: 1` { unique: true } (Nombre de fuente único por usuario).
    *   `userId: 1, currency: 1` (Para buscar fuentes por usuario y moneda).
    *   `userId: 1, type: 1` (Para buscar por tipo).
    *   `userId: 1, status: 1`
    *   `currentBalance: 1` (Aunque cambiará mucho, puede ser útil para ciertos reportes).

---

### 2.9. Consideraciones Adicionales sobre el Diseño de Datos (MongoDB)

*   **Relaciones y Referencias:**
    *   La mayoría de las relaciones entre colecciones se gestionan mediante `ObjectId` que referencian documentos en otras colecciones (ej., `gameId` en `gameItems` apunta a un documento en `games`).
    *   Esto promueve la normalización y la consistencia de los datos, evitando la duplicación excesiva.
    *   Las operaciones de "join" se realizarán a nivel de aplicación o utilizando el `$lookup` de MongoDB en las agregaciones cuando sea necesario.

*   **Embedding vs. Referencing:**
    *   **Referencing (Enfoque Principal Usado):** Se ha optado mayormente por referenciar datos. Es adecuado cuando los datos referenciados son grandes, cambian con frecuencia, o se acceden/actualizan independientemente del documento principal.
    *   **Embedding (Considerar para Casos Específicos):** Se podría considerar embeber sub-documentos si los datos son pequeños, raramente cambian, y se acceden casi siempre junto con el documento padre. Ejemplo: Si `primaryContactMethod` en `contacts` solo tuviera unos pocos campos fijos y no se consultara por separado, podría haberse embebido directamente. Sin embargo, la estructura actual como objeto separado permite flexibilidad.
    *   La decisión final de embedding vs. referencing puede reevaluarse para optimizar consultas específicas si surgen cuellos de botella de rendimiento.

*   **Validación de Datos:**
    *   Se utilizará **Mongoose** a nivel de aplicación para definir esquemas estrictos (o flexibles donde sea necesario con `strict: false` o campos `Mixed`).
    *   Mongoose proporcionará validaciones para tipos de datos, campos requeridos, valores mínimos/máximos, patrones (regex), valores permitidos (enum), y validaciones personalizadas.
    *   Esto asegura la integridad de los datos antes de que se persistan en MongoDB.

*   **Estrategia de Índices:**
    *   Los índices sugeridos en cada definición de colección son un punto de partida basado en consultas comunes anticipadas (búsquedas, ordenamiento, unicidad).
    *   Es crucial analizar los patrones de consulta reales una vez la aplicación esté en desarrollo/uso para añadir, modificar o eliminar índices.
    *   Herramientas como `explain()` en MongoDB se usarán para optimizar las consultas y asegurar que los índices se estén utilizando correctamente.
    *   Se debe tener cuidado de no sobre-indexar, ya que los índices consumen espacio y pueden ralentizar las operaciones de escritura.

*   **Timestamps:**
    *   La mayoría de las colecciones incluyen campos `createdAt` y `updatedAt`. Con Mongoose, esto se puede gestionar automáticamente usando la opción `timestamps: true` en la definición del esquema, lo que simplifica el seguimiento de cuándo se crearon y modificaron los documentos.

--- 