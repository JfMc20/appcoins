**1. Definición y Alcance del Proyecto:**

*   **Objetivo Principal:** Desarrollar una aplicación para facilitar el monitoreo y la administración de la compra, venta y reventa de monedas/ítems de **múltiples juegos** y **productos externos** (ej. software, servicios) con gestión de stock.
*   **Funcionalidades Clave (Detallado):**
    *   **Gestión de Catálogo de Entidades Transaccionables:**
        *   Capacidad de definir y configurar diferentes "Juegos" (ej., Tibia, OtroJuegoMMO, etc.).
        *   Para cada juego, definir las "Monedas/Items" que se comercializarán (ej., Tibia Coins, Gold, Gemas, etc.).
        *   Capacidad de definir "Productos Externos" (ej., códigos de ExitLag, Recovery Keys) con atributos como nombre, descripción, proveedor.
        *   **Gestión de Stock** para Productos Externos y opcionalmente para Monedas/Items de juego (si se desea controlar el inventario propio).
    *   **Gestión de Precios y Tasas de Cambio:**
        *   Inicialmente para USDT-VES, con **diseño flexible para incorporar fácilmente otras tasas de cambio de monedas fiat** (ej., USDT-COP, etc.).
        *   Permitir la configuración de la fuente de datos (API) para cada par de monedas fiat.
        *   Mecanismo de actualización de tasas fiat (ej. cada X minutos, al iniciar la app, manual).
        *   Visualización clara de la(s) tasa(s) activa(s) en la interfaz.
        *   Permitir la configuración de precios de venta/compra para Monedas/Items de cada juego (puede ser un precio fijo en una moneda de referencia como USDT, una tasa de cambio directa si aplica, o un margen sobre un costo de adquisición).
        *   Permitir la configuración de precios de venta para Productos Externos (en USDT o moneda local tras conversión).
    *   **Cálculo de Porcentajes (Ganancia/Comisión) por Transacción:**
        *   Definir reglas de cálculo (ej., porcentaje fijo, escalonado por volumen, configurable por el administrador).
        *   Aplicar el cálculo sobre el monto de la transacción (en USDT o la moneda base definida).
        *   Mostrar de forma transparente la comisión/ganancia calculada antes de confirmar la transacción.
        *   (Opcional) Posibilidad de ajuste manual de la comisión bajo ciertos criterios o permisos.
    *   **Registro de Transacciones (Compra/Venta/Reventa):**
        *   Selección del tipo: Compra (ingreso al stock/inventario) o Venta (salida del stock/inventario).
        *   Permitir seleccionar si la transacción es de una **Moneda/Item de Juego** o un **Producto Externo**.
        *   Si es Moneda/Item de Juego: seleccionar el Juego y el Item/Moneda específico.
        *   Si es Producto Externo: seleccionar el Producto.
        *   Asociación con un contacto.
        *   Entrada de cantidad.
        *   Entrada de precio:
            *   Precio unitario (ej. USDT por Tibia Coin, o VES por Tibia Coin).
            *   O monto total acordado (en USDT o VES), calculando el precio unitario implícito.
        *   Cálculo automático de los montos totales (USDT, VES u otra moneda) basado en la tasa de cambio vigente.
        *   Visualización y aplicación de la comisión/ganancia.
        *   Fecha y hora de la transacción.
        *   Campo para notas adicionales sobre la transacción.
        *   Las transacciones de Productos Externos (o Items con stock gestionado) deben actualizar automáticamente los niveles de stock.
    *   **Historial de Transacciones:**
        *   Listado cronológico de todas las transacciones.
        *   Filtros avanzados: por fecha/rango de fechas, tipo (compra/venta), contacto, moneda fiat, **Juego, Item/Moneda de Juego, Producto Externo**.
        *   Visualización detallada de cada transacción individual.
        *   (Opcional Avanzado) Posibilidad de editar o anular transacciones (requiere un sistema de auditoría y permisos estrictos).
    *   **Generación de Informes Diarios (y Personalizados):**
        *   Informe diario automático/manual que resuma:
            *   Totales por **Juego > Item/Moneda** (comprado/vendido, volumen, ganancia).
            *   Totales por **Producto Externo** (vendido, stock restante, volumen, ganancia).
            *   Balance general de Monedas/Items de Juego (si se gestiona stock).
            *   Volumen total transaccionado en USDT (o moneda principal).
            *   Volumen total transaccionado en VES (u otras monedas secundarias).
            *   Total de comisiones/ganancias generadas.
            *   Número total de transacciones de compra y venta.
        *   Posibilidad de generar informes para rangos de fechas específicos.
        *   **Informes de niveles de stock** para Productos Externos y Monedas/Items con gestión de inventario, con posibles alertas de stock bajo.
        *   (Futuro) Informes por contacto, por tipo de moneda.
    *   **Experiencia de Usuario Multiplataforma:**
        *   La interfaz de usuario debe ser intuitiva y completamente funcional tanto en dispositivos de escritorio como móviles (diseño responsivo).

**Consideración General:** La interfaz de usuario debe ser intuitiva para todas estas funcionalidades, minimizando la entrada manual de datos donde sea posible mediante cálculos automáticos y selecciones. 

## Alcance del Proyecto (Primera Versión - MVP)

### Módulos Principales Incluidos:

1.  **Módulo de Gestión de Inventario y Productos (Juegos):**
    *   Definición de juegos y productos (ej. Tibia Coins, etc.). (✅ Implementado)
    *   Gestión de stock por producto. (✅ Modelo tiene stock, UI de gestión de stock explícita pendiente)
    *   Precios de compra y venta. (🚧 Backend para tasas, UI de precios por item pendiente)
    *   **Estado Actual:** Mayormente implementado, con gestión completa de juegos (CRUD, archivado, eliminación) y backend para tasas de cambio. UI para precios específicos por ítem y gestión de stock detallada pendiente.

2.  **Módulo de Gestión de Transacciones:**
    *   Registro de transacciones (compra, venta, otros movimientos). (🚧 Creación backend básica implementada, UI y lógica completa pendientes)
    *   Vinculación a clientes y productos. (🚧 Backend soporta, UI pendiente)
    *   Cálculo automático de totales y comisiones (si aplica). (❌ Pendiente)
    *   Historial de transacciones. (❌ UI Pendiente, backend para consulta básica podría existir)
    *   **Estado Actual:** Implementación inicial de backend para crear transacciones. UI, lógica de tipos de transacción, cálculos y listados pendientes.

3.  **Módulo de Gestión de Clientes (Contactos):**
    *   Base de datos de clientes/contactos. (✅ Implementado)
    *   Historial de transacciones por cliente. (🚧 Backend soporta, UI pendiente)
    *   **Estado Actual:** Backend CRUD completo. Frontend para listar, crear y eliminar contactos implementado. Edición de contactos y visualización de historial pendientes.

4.  **Módulo de Informes y Estadísticas Básicas:**
    *   Informe de ventas y compras diarias/semanales/mensuales. (❌ Pendiente)
    *   Informe de niveles de stock. (❌ Pendiente)
    *   Dashboard con métricas clave. (❌ Pendiente)
    *   **Estado Actual:** Pendiente.

5.  **Módulo de Configuración del Sistema:**
    *   Gestión de usuarios y roles (administrador, operador). (✅ Implementado)
    *   Configuración de tasas de cambio (si no son automáticas). (✅ Backend implementado, UI admin pendiente)
    *   Configuración de tipos de productos y comisiones. (🚧 Gestión de juegos implementada, comisiones pendientes)
    *   **Estado Actual:** Gestión de usuarios y backend de tasas de cambio implementados. UI para tasas y configuración de comisiones pendiente.

### Fuera del Alcance (Primera Versión): 