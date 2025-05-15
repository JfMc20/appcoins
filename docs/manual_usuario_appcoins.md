# Manual de Usuario: AppCoins

## 1. Introducción

Bienvenido a AppCoins, tu aplicación integral para la gestión y el seguimiento de operaciones financieras relacionadas con la compra, venta y reventa de monedas virtuales, ítems de juegos y otros productos digitales. AppCoins está diseñado para ayudarte a mantener un control preciso de tus fuentes de fondos, transacciones, contactos y el rendimiento general de tus operaciones.

Este manual te guiará a través de las principales funcionalidades de la aplicación.

## 2. Conceptos Clave

Antes de empezar, es útil familiarizarse con algunos términos que se utilizan frecuentemente en AppCoins:

*   **Fuentes de Fondos (Funding Sources):** Representan los diferentes lugares donde almacenas tu dinero o activos (ej: billeteras de criptomonedas como Binance USDT, cuentas bancarias, PayPal, efectivo, etc.). Cada fuente tiene un saldo actual que se actualiza con las transacciones.
*   **Transacciones (Transactions):** Son los registros de cada operación que realizas. Pueden ser de diversos tipos, como compras, ventas, declaraciones de saldo, ajustes de capital, gastos, etc.
*   **Contactos (Contacts):** Son las personas o entidades con las que realizas transacciones (ej: clientes, proveedores).
*   **Juegos Configurados (Games):** Si tu negocio involucra ítems de múltiples juegos, aquí es donde se configuran los detalles de cada juego para una mejor organización.
*   **Ítems de Juego / Productos Externos:** Los bienes digitales o servicios específicos que compras o vendes.
*   **Operador:** Un usuario del sistema que realiza y registra las transacciones diarias.
*   **Administrador (Admin):** Un usuario con permisos elevados para configurar el sistema, gestionar usuarios, y supervisar todas las operaciones.

## 3. Primeros Pasos

*   **Acceso a la Aplicación:** Para comenzar a usar AppCoins, necesitarás una cuenta de usuario. Accede a través de la página de inicio de sesión con tus credenciales.
*   **Panel Principal (Dashboard):** Una vez dentro, serás recibido por el panel principal, que te ofrecerá una vista general del estado de tus operaciones (esta sección se desarrollará progresivamente).

## 4. Módulos Principales y Funcionalidades

### 4.1. Gestión de Fuentes de Fondos

Este módulo te permite administrar tus diferentes "billeteras" o lugares donde tienes capital.

*   **¿Qué es una Fuente de Fondos?**
    *   Como se mencionó, es cualquier lugar donde almacenes valor (Binance, AirTM, Efectivo USD, Efectivo ARS, etc.).
    *   Cada fuente tiene un tipo (billetera crypto, cuenta bancaria, efectivo), una moneda principal y un saldo.

*   **Crear una Nueva Fuente de Fondos:**
    1.  Navega a la sección "Fuentes de Fondos".
    2.  Haz clic en "Nueva Fuente".
    3.  Completa los detalles: Nombre (ej. "Binance USDT Personal"), Tipo, Moneda.
    4.  **Saldo Inicial:** Puedes definir un saldo inicial al crear la fuente. Si lo haces, el sistema registrará automáticamente una transacción de "Declaración de Saldo Inicial Capital" para reflejar este comienzo.
    5.  Guarda la fuente.

*   **Listar y Ver Fuentes de Fondos:**
    *   En la página principal de "Fuentes de Fondos", verás una lista de tus fuentes activas, mostrando su nombre, tipo, moneda, saldo actual y estado.
    *   Puedes usar el botón "Ver Archivadas" para ver fuentes que ya no están en uso activo.

*   **Editar una Fuente de Fondos:**
    *   Desde la lista, puedes seleccionar "Editar" en una fuente para modificar sus detalles (nombre, tipo, etc.). El saldo actual no se edita directamente aquí; se actualiza a través de transacciones.

*   **Archivar y Restaurar Fuentes de Fondos:**
    *   Si una fuente ya no la usas regularmente pero quieres conservar su historial, puedes "Archivarla".
    *   Las fuentes archivadas pueden ser "Restauradas" si necesitas volver a usarlas.

*   **Eliminar Permanentemente una Fuente de Fondos:**
    *   Solo las fuentes que ya están "Archivadas" pueden ser eliminadas permanentemente. Esta acción es irreversible.

### 4.2. Gestión de Transacciones

Este es el corazón de la aplicación, donde registras todas tus operaciones financieras.

*   **Tipos de Transacciones:** AppCoins soporta (o soportará) múltiples tipos de transacciones, incluyendo:
    *   `DECLARACION_OPERADOR_INICIO_DIA` (Declaración de Saldo Actual del Operador)
    *   `DECLARACION_SALDO_INICIAL_CAPITAL` (Generada al crear una fuente con saldo)
    *   `AJUSTE_ADMIN_CAPITAL` (Ajustes realizados por un administrador)
    *   Compras y Ventas (de ítems de juego, productos externos)
    *   Gastos e Ingresos
    *   Transferencias entre fuentes
    *   Ajustes de stock

*   **Nueva Declaración de Operador Inicio de Día (o Declaración de Saldo Actual):**
    *   **Propósito:** Esta transacción NO es para registrar una nueva entrada de dinero detallando su origen. Su objetivo principal es **conciliar y actualizar el saldo** de una fuente de fondos específica con la realidad. Es una herramienta para que el operador confirme el saldo total que tiene en una fuente en un momento dado.
    *   **Cómo Funciona:**
        1.  Ve a "Nueva Transacción" (o la sección designada para declaraciones).
        2.  Selecciona el tipo de transacción: `DECLARACION_OPERADOR_INICIO_DIA`.
        3.  **Fuente de Fondos:** Elige la fuente cuyo saldo quieres declarar (ej. "Binance USDT").
        4.  **Saldo Declarado:** Ingresa el monto TOTAL que has verificado que tienes *actualmente* en esa fuente real.
        5.  **Fecha de Transacción:** La fecha en que estás haciendo la declaración.
        6.  **Notas (Opcional):** Cualquier comentario relevante.
        7.  Al guardar:
            *   Se crea una transacción que registra: la fuente, el saldo que declaraste, el saldo que el sistema tenía *antes* de tu declaración, quién y cuándo.
            *   **El `currentBalance` de la Fuente de Fondos seleccionada se actualiza en el sistema al monto que declaraste.**
    *   **Importancia:** Ayuda a mantener los saldos del sistema precisos y proporciona un rastro de auditoría de estas conciliaciones.

*   **Registrar Otros Tipos de Transacciones (Compras, Ventas, etc.):**
    *   (Esta sección se detallará a medida que se implementen los formularios específicos)
    *   La idea es que puedas seleccionar el tipo de transacción (ej. "Venta de Ítem de Juego"), y el formulario te pedirá los detalles relevantes:
        *   Ítem vendido, cantidad, precio.
        *   Fuente de fondos donde se recibe el pago.
        *   Cliente asociado (ver "Vinculación de Contactos" más abajo).
        *   Comisiones, ganancias, etc.
    *   **Vinculación de Contactos en Transacciones:** Se planea que al registrar transacciones como compras o ventas, puedas seleccionar un contacto existente (cliente/proveedor). Esto agilizará el proceso y permitirá un mejor análisis de la actividad por contacto.

*   **Historial de Transacciones:**
    *   **Acceso:** Puedes acceder al historial de transacciones desde el menú de navegación, usualmente bajo la sección "Transacciones" -> "Historial".
    *   **Visualización:** Se presenta una tabla paginada con todas las transacciones que tienes permiso para ver (los operadores ven sus propias transacciones, los administradores ven todas).
    *   **Columnas Principales:**
        *   **Fecha:** Fecha y hora en que se registró la transacción.
        *   **Tipo:** El tipo de transacción (ej. `DECLARACION_OPERADOR_INICIO_DIA`).
        *   **Descripción / Detalles:** Un resumen o nota de la transacción. Para las declaraciones de inicio de día, muestra el saldo declarado, la moneda y un identificador de la fuente de fondos afectada.
        *   **Operador ID:** El identificador del usuario que realizó la transacción (próximamente se mostrará el nombre).
        *   **Estado:** El estado actual de la transacción (ej. `completed`).
    *   **Paginación:** Si hay muchas transacciones, puedes navegar entre páginas usando los botones "Anterior" y "Siguiente" al final de la tabla.
    *   **Botón "Nueva Transacción":** Desde esta página, también tienes un acceso directo para registrar una nueva transacción.

### 4.3. Gestión de Contactos

Administra la información de tus clientes, proveedores u otras entidades con las que interactúas.

*   **Crear un Nuevo Contacto:**
    *   Ve a la sección "Contactos" y selecciona "Nuevo Contacto".
    *   Ingresa la información: Nombre, Apodo, Tipo de Contacto (Cliente, Proveedor, Otro), Estado, Email, Teléfono, Notas.
    *   *(Mejora Futura Planeada: Si el tipo es "Otro", aparecerá un campo para describir qué tipo de "Otro" es).*
    *   *(Mejora Futura Planeada: Se podrá añadir una etiqueta o vinculación a un juego específico).*

*   **Listar y Ver Contactos:**
    *   Visualiza una tabla con todos tus contactos, con opciones de búsqueda y filtrado.

*   **Editar un Contacto:**
    *   Modifica la información de un contacto existente.

*   **Eliminar un Contacto:**
    *   Elimina contactos que ya no sean necesarios.

### 4.4. Gestión de Juegos Configurados (Principalmente para Administradores)

Si tu operación involucra múltiples juegos, este módulo permite su configuración.

*   **Listar Juegos:** Ver los juegos activos, inactivos y archivados.
*   **Crear/Editar Juegos:** Definir o modificar los detalles de cada juego.
*   **Archivar/Restaurar Juegos:** Gestionar el ciclo de vida de los juegos en el sistema.

#### 4.4.1. Gestión de Ítems de Juego

Una vez que un juego está configurado, puedes administrar los ítems específicos asociados a ese juego. Esto te permite definir los productos o servicios que comercializas para cada título.

*   **Acceder a la Gestión de Ítems:**
    1.  Desde la lista de "Juegos Configurados", selecciona el juego para el cual deseas administrar ítems.
    2.  Esto te llevará a una página donde verás los ítems ya configurados para ese juego y podrás realizar diversas acciones.

*   **Listar Ítems de un Juego:**
    *   Visualizarás una tabla con todos los ítems del juego seleccionado.
    *   La tabla mostrará detalles como Nombre, Código, Tipo, si es Comercializable, Stock (si aplica) y Estado.
    *   Podrás utilizar filtros para buscar ítems por nombre, código, tipo o estado.

*   **Crear un Nuevo Ítem de Juego:**
    1.  En la página de ítems del juego, busca el botón "Crear nuevo ítem".
    2.  Se desplegará un formulario donde deberás completar los detalles del ítem:
        *   **Nombre:** El nombre descriptivo del ítem (ej. "Tibia Coins", "Suscripción 1 Mes").
        *   **Código del Ítem (Opcional):** Un código interno si lo utilizas.
        *   **Tipo:** Selecciona si es una Moneda, Ítem, Servicio u Otro.
        *   **Descripción (Opcional):** Detalles adicionales sobre el ítem.
        *   **¿Gestiona Stock?:** Indica si llevarás un control de inventario para este ítem.
        *   **Stock Actual (si gestiona stock):** La cantidad inicial si aplica.
        *   **¿Es Comercializable?:** Indica si el ítem está activamente a la venta.
        *   **Estado Inicial:** Por defecto, usualmente "Activo".
    3.  Guarda el formulario para añadir el nuevo ítem al juego.

*   **Editar un Ítem de Juego Existente:**
    *   La edición de los detalles de un ítem (nombre, código, tipo, descripción, si gestiona stock, si es comercializable) se realiza típicamente a través de un formulario de edición, accesible desde la lista de ítems (próximamente se habilitará un botón o acción directa para edición completa de todos los campos).
    *   **Actualizar Stock:** Si un ítem gestiona stock, podrás actualizar la cantidad directamente desde la tabla de ítems.
    *   **Cambiar Estado:** Puedes cambiar el estado de un ítem (Activo, Inactivo, Archivado) usando el menú desplegable en la columna "Acciones" de la tabla de ítems. Esto actualiza cómo se muestra y se puede usar el ítem en el sistema.

*   **Eliminar Permanentemente un Ítem de Juego:**
    *   Desde la tabla de ítems, en la columna "Acciones", encontrarás un botón para "Eliminar".
    *   Al hacer clic, se te pedirá confirmación, ya que **esta acción es irreversible** y borra el ítem de forma definitiva de la base de datos.
    *   A diferencia del archivado (que es un cambio de estado), la eliminación borra el registro del ítem.

### 4.5. Gestión de Usuarios (Solo Administradores)

*   Los administradores pueden crear, listar, editar y eliminar cuentas de usuario (tanto operadores como otros administradores).
*   Asignar roles a los usuarios.

### 4.6. Tasas de Cambio (Información General)

*   AppCoins puede integrarse con servicios externos para obtener tasas de cambio actualizadas entre diferentes monedas, lo cual es crucial si operas con múltiples divisas. Esta configuración generalmente la maneja un administrador.

### 4.7. Gestión de Tasas de Cambio (Administradores)

Este módulo permite a los administradores supervisar y gestionar las tasas de cambio utilizadas en el sistema.

*   **Acceso a la Gestión de Tasas de Cambio:**
    *   Los administradores encontrarán una sección dedicada a "Tasas de Cambio" en el panel de administración.

*   **Visualizar Tasas de Cambio Actuales:**
    *   Se presenta un dashboard (`ExchangeRateDashboard`) que muestra las tasas de cambio más recientes que el sistema ha obtenido para los pares de monedas configurados (ej. USDT a VES, USDT a COP).
    *   Cada tasa muestra su valor actual, el valor anterior, el cambio porcentual (si aplica), la fuente de la tasa (ej. CriptoYa - Binance P2P) y la fecha de la última actualización.

*   **Actualización Manual de Tasas:**
    *   En el dashboard de tasas de cambio, existe un botón "Actualizar Tasas".
    *   Al presionarlo, el sistema intentará obtener las tasas más recientes de las APIs externas configuradas (como CriptoYa) para todas las monedas fiat activas.
    *   Esto es útil si se necesita forzar una actualización fuera del ciclo automático programado o después de realizar cambios en la configuración de monedas.

*   **Gestión de Monedas Soportadas (Próximamente):**
    *   Se planea añadir funcionalidades para que los administradores puedan:
        *   Ver la lista de monedas fiat que el sistema puede rastrear (ej. VES, COP, USD).
        *   Activar o desactivar monedas para la obtención de tasas.
        *   (Posiblemente) Añadir nuevas monedas fiat soportadas o editar los detalles de las existentes.

*   **Gestión de APIs de Tasas de Cambio (Próximamente):**
    *   Se planea permitir a los administradores ver y gestionar las fuentes API configuradas para obtener las tasas.

## 5. Roles de Usuario

*   **Operador:** Es el usuario principal que realiza las transacciones diarias, gestiona contactos y fuentes de fondos bajo su responsabilidad, y realiza las declaraciones de saldo.
*   **Administrador (Admin):** Tiene acceso completo a todas las funcionalidades, incluyendo la configuración del sistema, gestión de todos los usuarios, supervisión de todas las fuentes y transacciones, y ajustes de capital.

## 6. Flujos de Trabajo Comunes (Ejemplos)

*   **Inicio de Jornada de un Operador:**
    1.  Inicia sesión en AppCoins.
    2.  Va a la sección de "Transacciones" -> "Nueva Declaración de Inicio de Día".
    3.  Para cada una de sus fuentes de fondos activas (ej. Efectivo, Binance), cuenta el saldo real.
    4.  Registra una declaración para cada fuente, ingresando el saldo contado. El sistema actualiza los saldos.
    5.  Comienza a registrar las ventas, compras y otros movimientos del día.

*   **Registrar una Venta (Flujo Anticipado):**
    1.  El operador va a "Nueva Transacción".
    2.  Selecciona tipo "Venta de Ítem de Juego".
    3.  Busca y selecciona el cliente (Contacto).
    4.  Selecciona el ítem vendido y la cantidad.
    5.  Ingresa el precio de venta.
    6.  Selecciona la fuente de fondos donde recibió el pago.
    7.  Guarda la transacción. El sistema actualiza el saldo de la fuente de fondos, el stock del ítem (si aplica), y registra la ganancia.

## 7. Futuras Funcionalidades

AppCoins es un proyecto en desarrollo. Algunas de las funcionalidades planeadas a futuro incluyen:
*   Un Dashboard principal más completo con indicadores clave de rendimiento.
*   Módulo de Informes detallados (diarios, por juego, por contacto, de stock, etc.).
*   Gestión avanzada de precios y estrategias.
*   Funcionalidades completas para todos los tipos de transacciones.

---

Este manual se irá actualizando a medida que la aplicación evolucione. 