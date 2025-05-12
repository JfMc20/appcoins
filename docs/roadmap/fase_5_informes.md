# Fase 5: Módulo de Informes

Este documento detalla la planificación y desarrollo del módulo de generación de informes de la aplicación.

## 1. Objetivos Principales del Módulo

Los objetivos fundamentales del módulo de informes son:

*   Proveer una visión consolidada y analítica del rendimiento del negocio a través de diversos informes personalizables.
*   Permitir la **generación de informes agregados** por periodos de tiempo flexibles, incluyendo selecciones predefinidas (diario, semanal, mensual) y rangos de fechas personalizados.
*   Facilitar la **comparación de métricas clave entre diferentes periodos de tiempo** para identificar tendencias, crecimiento o áreas de mejora (ej. día actual vs. día anterior, semana actual vs. semana anterior, este mes vs. mes pasado, este mes vs. mismo mes del año anterior).
*   Mostrar métricas esenciales de forma clara y comprensible, tales como:
    *   Volumen total de ventas y compras (tanto en cantidad de ítems/productos como en valor monetario).
    *   Rentabilidad bruta y neta de las operaciones (global y por transacción/producto si es aplicable).
    *   Movimientos de capital y saldos actuales en las diferentes `fundingSources`.
    *   Estado y valoración del inventario para `gameItems` (con stock gestionado) y `externalProducts`.
*   Generar **rankings o listas "Top"** para análisis específicos, como por ejemplo:
    *   "Top Compradores" (basado en volumen o cantidad de transacciones) por juego o general.
    *   "Top Vendedores/Proveedores" (basado en volumen o cantidad de transacciones) por juego o general.
    *   "Top Productos/Ítems Vendidos" por rentabilidad o cantidad.
*   Ofrecer la capacidad de **exportar todos los informes generados a formato PDF**, permitiendo una fácil compartición, impresión y archivo de los datos.
*   Proporcionar potentes **herramientas de filtrado y segmentación de datos** dentro de los informes, permitiendo al usuario desglosar la información por múltiples dimensiones (ej. por juego específico, por categoría de producto, por tipo de contacto, por `fundingSource` utilizada, por usuario/operador).
*   Presentar la información de manera intuitiva mediante **visualizaciones gráficas interactivas** (tablas detalladas, gráficos de barras, gráficos de líneas, gráficos circulares, etc.), que faciliten la interpretación de los datos y las comparativas entre periodos.

## 2. Tipos de Informes y Contenido Detallado

A continuación, se describen los tipos de informes iniciales que la aplicación generará, junto con su contenido y funcionalidades clave. Todos los informes deben ser exportables a PDF y permitir la selección de periodos de tiempo flexibles (diario, semanal, mensual, rangos personalizados) y comparaciones entre periodos donde aplique.

1.  **Informe de Resumen General (Dashboard de Informes):**
    *   **Propósito:** Ofrecer una vista rápida y consolidada del rendimiento general del negocio.
    *   **Periodo Seleccionable:** Hoy, Ayer, Últimos 7 días, Esta Semana (Lun-Dom), Semana Pasada, Este Mes, Mes Pasado, Rango de Fechas Personalizado.
    *   **Opción de Comparación:** Permitir seleccionar un periodo anterior para comparar métricas (ej. vs Semana Pasada, vs Mismo Periodo Mes Anterior).
    *   **Contenido Principal:**
        *   **Ventas Totales:** Número de ventas, Valor total bruto de ventas (en moneda de referencia, con posible desglose por moneda de pago original si es relevante).
        *   **Compras Totales:** Número de compras, Valor total de compras (en moneda de referencia).
        *   **Rentabilidad Clave:** Ganancia Bruta Total, Ganancia Neta Total (considerando `costOfGoods` y `commission` registrados en las transacciones).
        *   **Métricas de Capital:** Saldo actual de todas las `fundingSources` (agrupado por moneda), y un resumen de los principales movimientos (total ingresos vs. total egresos en el periodo).
        *   **Inventario Clave:** Valor total estimado del inventario actual, número de ítems/productos con stock bajo.
    *   **Visualizaciones Gráficas:**
        *   Gráfico de líneas o barras mostrando la tendencia de Ventas y Rentabilidad Neta durante el periodo seleccionado (y el periodo de comparación si aplica).
        *   Gráfico circular mostrando la distribución de Ventas por Juego (o categoría de producto principal).
        *   Gráfico circular mostrando la distribución de saldos por `fundingSource` o por moneda principal.
    *   **Funcionalidad:** Opción de "Exportar a PDF" el resumen completo.

2.  **Informe de Rentabilidad Detallado:**
    *   **Propósito:** Analizar en profundidad la rentabilidad de las operaciones de venta.
    *   **Periodo Seleccionable:** Similar al informe de resumen.
    *   **Filtros Avanzados:** Por Juego, por `gameItem` específico, por `externalProduct` específico, por `contactId` (cliente), por `operatorUserId`.
    *   **Contenido Principal (Tabla Detallada de Ventas):**
        *   Columnas: Fecha, ID Transacción, Cliente, Ítem/Producto Vendido, Cantidad, Precio Unitario de Venta, Valor Total Venta, Costo de Adquisición Unitario (si disponible), Costo Total de Adquisición, Ganancia Bruta, Comisiones/Tarifas, Ganancia Neta.
        *   Totales y Promedios: Sumatorias de valor de venta, costo, ganancia bruta, comisiones, ganancia neta. Porcentaje de margen promedio.
    *   **Visualizaciones Gráficas:**
        *   Gráfico de barras mostrando los Productos/Ítems más rentables (por ganancia neta total en el periodo).
        *   Gráfico de barras mostrando rentabilidad por Juego.
    *   **Funcionalidad:** Exportar a PDF (tabla detallada y gráficos).

3.  **Informe de Movimientos de Capital (Estado de `FundingSources`):**
    *   **Propósito:** Rastrear el flujo de efectivo y los saldos en todas las fuentes de fondos.
    *   **Periodo Seleccionable:** Similar al informe de resumen.
    *   **Filtros:** Por `fundingSource` específica, por moneda de la `fundingSource`.
    *   **Contenido Principal (por cada `fundingSource` o consolidado):**
        *   Saldo Inicial de la `fundingSource` al comienzo del periodo.
        *   Lista detallada de todas las transacciones que afectaron la `fundingSource` en el periodo (columnas: Fecha, ID Transacción, Tipo Transacción, Descripción/Contraparte, Monto Ingreso, Monto Egreso, Saldo Resultante después de la transacción).
        *   Saldo Final de la `fundingSource` al cierre del periodo.
        *   Totales de Ingresos y Egresos para el periodo.
    *   **Visualizaciones Gráficas:**
        *   Gráfico de líneas mostrando la evolución del saldo de una `fundingSource` seleccionada.
        *   Gráfico de barras apiladas mostrando ingresos vs. egresos por `fundingSource`.
    *   **Funcionalidad:** Exportar a PDF.

4.  **Informe de Inventario y Stock:**
    *   **Propósito:** Proveer una visión clara del estado actual del inventario y su valoración.
    *   **Fecha de Corte:** Por defecto "Actual", pero permitir seleccionar una fecha pasada para ver el estado del stock en ese momento (requiere lógica de reconstrucción de stock basada en transacciones hasta esa fecha).
    *   **Filtros:** Por Juego, por Categoría de Ítem/Producto (`gameItems.type` o `externalProducts.category`), por estado de stock (ej. "Stock Bajo", "En Stock", "Sin Stock").
    *   **Contenido Principal (Tabla de Inventario):**
        *   Columnas: Ítem/Producto, Juego (si aplica), Categoría, Stock Actual, Unidad, Umbral de Stock Bajo (`lowStockThreshold`), (Opcional) Último Costo de Compra Unitario, (Opcional) Valor Total del Stock por Ítem (Stock Actual * Último Costo).
        *   Indicadores visuales para ítems con stock bajo.
        *   Resumen: Valor total del inventario (si se calcula el costo).
    *   **(Opcional Avanzado) Historial de Movimientos de Stock:** Para un ítem/producto seleccionado, mostrar una lista de todas las transacciones que afectaron su stock (compras, ventas, ajustes) en un periodo dado.
    *   **Visualizaciones Gráficas:**
        *   Gráfico de barras mostrando la cantidad de stock por los N principales ítems/productos.
        *   Gráfico circular mostrando la distribución del valor del inventario por Juego o Categoría.
    *   **Funcionalidad:** Exportar a PDF.

5.  **Informe de "Top" Entidades (Rankings):**
    *   **Propósito:** Identificar los principales contribuyentes o elementos en diversas categorías.
    *   **Periodo Seleccionable:** Similar al informe de resumen.
    *   **Tipo de Ranking (Seleccionable):**
        *   Top Compradores (Clientes).
        *   Top Vendedores (Proveedores).
        *   Top Productos/Ítems (por ventas o por rentabilidad).
        *   Top Juegos (por volumen de ventas o por rentabilidad).
    *   **Métrica para Ranking (Seleccionable):** Volumen Total Transaccionado (en moneda de referencia), Número de Transacciones, Ganancia Neta Generada (si aplica).
    *   **Filtros Adicionales:** Por Juego específico (ej. "Top Compradores de Tibia Coins").
    *   **Contenido Principal:** Listas ordenadas (ej. Top 10, Top 20, o configurable) mostrando la entidad y la métrica correspondiente.
    *   **Visualizaciones Gráficas:** Gráficos de barras para los rankings.
    *   **Funcionalidad:** Exportar a PDF.

## 3. Lógica de Agregación y Cálculo de Datos

La generación de informes se basará en la agregación y procesamiento de datos de varias colecciones, principalmente `transactions`. Sin embargo, para optimizar el rendimiento y asegurar la precisión según la lógica de negocio definida, **el cálculo detallado de la rentabilidad neta por transacción de venta se realizará al momento de registrar dicha transacción (lógica de Fase 3)** y se almacenará directamente en el documento de la transacción. La lógica de los informes (Fase 5) se centrará en agregar estos datos precalculados y otra información relevante.

*   **Fuente de Datos Primaria:** La colección `transactions` es la fuente principal para métricas de ventas, compras, rentabilidad, movimientos de capital y rankings. Se complementa con `fundingSources` (saldos), `contacts` (filtros), `gameItems` y `externalProducts` (stock, filtros, costos promedio).
*   **Cálculo de Rentabilidad (Realizado en Fase 3, Agregado en Fase 5):**
    *   **Al registrar una VENTA:** La lógica del backend (Fase 3) calculará la **Rentabilidad Neta Precisa** convirtiendo el ingreso neto de la venta y el costo neto de adquisición del ítem vendido a la moneda de referencia (ej., USDT), usando las tasas de cambio específicas registradas en cada transacción (`paymentDetails.exchangeRatesUsed`).
    *   **Costo Neto de Adquisición:** Se determinará usando el método de costeo definido (ej., **Promedio Ponderado** almacenado/calculado a partir de `gameItems.averageCostRef`, o **Costo Específico** de `externalProducts.stockItems`). Este costo también se convertirá a moneda de referencia considerando tasas y tarifas de la(s) compra(s) original(es).
    *   **Ingreso Neto de Venta:** Considerará el monto recibido, convertido a moneda de referencia, menos comisiones (`profitDetails.commission`) y otras tarifas (`profitDetails.otherFees`) de la venta.
    *   **Almacenamiento:** El resultado (ej., `netProfitRef`, `grossProfitRef`, `netAcquisitionCostRef`, `netRevenueRef` - estos nombres exactos se pueden definir al implementar) se guardará en el objeto `profitDetails` de la transacción de VENTA.
    *   **Agregación en Informes (Fase 5):** Los informes de rentabilidad simplemente necesitarán usar `$match` para filtrar las transacciones de VENTA del periodo/criterio deseado y luego `$group` para sumar los campos precalculados (ej., `profitDetails.netProfitRef.amount`).
*   **Agregación en MongoDB (para otros informes):** Para informes de volumen, movimientos de capital, stock, rankings, etc., se usará intensivamente el **Framework de Agregación de MongoDB** en el backend. Se construirán pipelines con etapas como `$match`, `$group`, `$project`, `$sort`, `$lookup` (con moderación), `$limit`, `$skip` según sea necesario para cada informe.
*   **Cálculo de Saldos en `fundingSources`:**
    *   Se parte del `currentBalance` de la fuente.
    *   Se usan agregaciones (`$match` por fecha, `$group` por fuente, `$sum`) sobre las transacciones para calcular los movimientos dentro del periodo del informe y así determinar el saldo inicial y final del periodo.
*   **Cálculo del Valor de Inventario:**
    *   Se multiplica el `currentStock` por el `costo_unitario` de referencia (ej., `gameItems.averageCostRef.amount`). La suma de estos valores da el valor total del inventario.
*   **Comparaciones Temporales:**
    *   El backend ejecutará las consultas de agregación necesarias para los dos periodos (actual y comparación).
    *   La API devolverá los datos de ambos periodos para que el frontend los presente comparativamente.
*   **Rendimiento:**
    *   Indexación adecuada de campos usados en `$match` y `$sort` es crucial.
    *   Dado que la rentabilidad se precalcula, las agregaciones para esos informes serán más eficientes.
    *   Para otros informes con agregaciones complejas, considerar la pre-agregación de resúmenes periódicos (ej. totales diarios/mensuales en una colección separada) como optimización avanzada si es necesario.

## 4. Interacción con otros Módulos

La generación de informes depende en gran medida de los datos recopilados y gestionados por otros módulos de la aplicación. Las interacciones clave son:

*   **Módulo de Transacciones (Fase 3):**
    *   **Fuente Principal de Datos:** La colección `transactions` es la fuente fundamental para la mayoría de los informes (ventas, compras, rentabilidad, movimientos de capital, rankings, etc.). Los informes realizarán operaciones de lectura y agregación intensivas sobre esta colección.
    *   **Datos Precalculados:** Dependerá de los datos precalculados en `profitDetails` (rentabilidad neta, costo neto, etc.) para los informes de rentabilidad, lo que simplifica las agregaciones de esta fase.

*   **Módulo de Gestión de Contactos (Fase 4):**
    *   **Enriquecimiento de Datos:** Se utilizará la colección `contacts` para obtener información descriptiva (ej., `displayName`) al mostrar rankings o listas que involucren contactos.
    *   **Filtrado y Segmentación:** Los campos `type` y `tags` de los contactos servirán como criterios para filtrar y segmentar los datos en los informes (ej., "ver rentabilidad solo de clientes VIP").

*   **Módulo de `gameItems` y `externalProducts` (Definidos en Fase 1):**
    *   **Datos Maestros:** Se usarán estas colecciones para obtener nombres, categorías, y otros detalles de los ítems y productos al generar informes.
    *   **Informes de Stock:** Los campos `currentStock`, `managesStock`, `averageCostRef` (para `gameItems`), `stockItems` (para `externalProducts`) son esenciales para el Informe de Inventario.
    *   **Filtrado:** Los campos `gameId`, `type` (en `gameItems`), `category` (en `externalProducts`) se usarán para filtrar informes por juego o tipo de producto.

*   **Módulo de Fuentes de Fondos (`fundingSources`) (Definido en Fase 1):**
    *   **Informes de Capital:** Se consultará la colección `fundingSources` para obtener nombres descriptivos y saldos actuales (`currentBalance`), que sirven como punto de partida para calcular saldos históricos en los informes de movimientos de capital.
    *   **Filtrado:** Permitirá filtrar informes de movimientos de capital por `fundingSource` específica.

*   **Módulo de `appSettings` (Configuraciones):**
    *   **Moneda de Referencia:** Se leerá `defaultReferenceCurrency` para asegurar que los valores monetarios en los informes se presenten consistentemente en la moneda de referencia definida por el administrador.
    *   **Juegos Activos:** Los informes que se puedan filtrar por juego podrían usar la lista `activeGameIds` para priorizar o limitar las opciones de filtro a los juegos relevantes.

*   **Módulo de Usuarios (`users`):**
    *   **Filtrado por Operador:** Algunos informes podrían permitir filtrar las transacciones y resultados por el `operatorUserId` que las registró.
    *   **Control de Acceso:** El rol del usuario (`admin` vs. `operator`) podría determinar a qué informes tiene acceso o qué nivel de detalle puede ver.

## 5. Endpoints de API (Backend)

Estos endpoints proporcionarán los datos necesarios para generar los diferentes informes definidos. Se basarán en agregaciones complejas sobre la colección `transactions` y otras colecciones relevantes.

**Endpoints de Datos para Informes:**

*   **`GET /api/reports/summary`**
    *   **Descripción:** Obtiene los datos agregados para el Informe de Resumen General (Dashboard).
    *   **Autenticación:** Requerida (Operador/Admin).
    *   **Parámetros de Query Principales:** 
        *   `period` (ej. "today", "yesterday", "last7days", "thisWeek", "lastWeek", "thisMonth", "lastMonth").
        *   `startDate`, `endDate` (para `period="custom"`).
        *   `comparePeriod` (ej. "previousPeriod", "previousYear").
    *   **Respuesta Exitosa (200):** Objeto JSON complejo que contiene las métricas calculadas (ventas, compras, rentabilidad, capital, inventario) para el periodo principal y, si se solicitó, para el periodo de comparación.
    *   **Respuestas de Error:** 400 (Bad Request - parámetros inválidos), 401/403.

*   **`GET /api/reports/profitability`**
    *   **Descripción:** Obtiene la lista detallada de transacciones de venta con sus cálculos de rentabilidad para el periodo y filtros especificados.
    *   **Autenticación:** Requerida.
    *   **Parámetros de Query:** `period`, `startDate`, `endDate`, `gameId`, `itemId`, `itemType`, `contactId`, `operatorUserId`, `page`, `limit`, `sortBy` (ej. `transactionDate`, `netProfitRef.amount`), `sortOrder`.
    *   **Respuesta Exitosa (200):** Objeto con `{ data: [Array de transacciones de venta detalladas con rentabilidad], pagination: { ... }, summary: { Totales y promedios de rentabilidad } }`.

*   **`GET /api/reports/capital-flow`**
    *   **Descripción:** Obtiene el detalle de movimientos y saldos para las fuentes de fondos.
    *   **Autenticación:** Requerida.
    *   **Parámetros de Query:** `period`, `startDate`, `endDate`, `fundingSourceId` (opcional, para una fuente específica), `currency` (opcional, para filtrar por moneda de la fuente).
    *   **Respuesta Exitosa (200):** Objeto estructurado que detalla, para cada `fundingSource` (o la seleccionada), el saldo inicial, la lista de movimientos (ingresos/egresos) dentro del periodo, y el saldo final.

*   **`GET /api/reports/inventory`**
    *   **Descripción:** Obtiene el estado del inventario a una fecha específica.
    *   **Autenticación:** Requerida.
    *   **Parámetros de Query:** `asOfDate` (ISO Date string, default: now), `gameId`, `category`, `stockStatus` (ej. "low", "inStock", "outOfStock").
    *   **Respuesta Exitosa (200):** Objeto con `{ data: [Array de ítems/productos con su stock actual/histórico y valoración opcional], summary: { Valor total estimado del inventario } }`.

*   **`GET /api/reports/rankings`**
    *   **Descripción:** Obtiene listas ordenadas (rankings) de diferentes entidades.
    *   **Autenticación:** Requerida.
    *   **Parámetros de Query:** 
        *   `rankingType`: ("topBuyers", "topSellers", "topItemsByProfit", "topItemsBySales", "topGamesByProfit", etc.) - Requerido.
        *   `period`, `startDate`, `endDate`.
        *   `metric`: ("volume", "count", "profit") - Métrica para ordenar.
        *   `limit`: Número de resultados (ej. 10).
        *   `gameId`: (Opcional) Para filtrar el ranking por un juego específico.
    *   **Respuesta Exitosa (200):** Objeto con `{ data: [Array ordenado del ranking solicitado] }`.

**Endpoints para Exportación a PDF:**

Se propone un enfoque con endpoints específicos por informe para la generación de PDF en el backend:

*   **`GET /api/reports/summary/pdf`**
*   **`GET /api/reports/profitability/pdf`**
*   **`GET /api/reports/capital-flow/pdf`**
*   **`GET /api/reports/inventory/pdf`**
*   **`GET /api/reports/rankings/pdf`**

    *   **Parámetros de Query:** Aceptarían los mismos parámetros que sus contrapartes de datos (`GET /api/reports/...`) para definir el contenido del informe.
    *   **Autenticación:** Requerida.
    *   **Lógica:** Reutilizar la lógica de agregación de datos, formatear los resultados (tablas, gráficos básicos si la librería lo permite) usando una librería PDF en el backend (ej. `pdfkit`, `puppeteer`), y devolver el archivo PDF generado con las cabeceras HTTP adecuadas (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename="reporte_....pdf"`).
    *   **Respuesta Exitosa (200):** El flujo de datos del archivo PDF.

Este conjunto de endpoints proporciona la flexibilidad necesaria para consultar y exportar los datos de los informes requeridos.

## 6. Componentes de UI (Frontend)

La interfaz de usuario para el módulo de informes se centrará en la visualización clara de datos, la interactividad y la facilidad de configuración y exportación. Se utilizarán los principios de diseño (tema oscuro) y las librerías (Headless UI, Tailwind CSS, librería de gráficos) definidas anteriormente.

1.  **Página Principal de Informes (`ReportsDashboardPage`):**
    *   **Propósito:** Servir como el centro de control para todos los informes.
    *   **Layout:** Podría usar pestañas, un menú lateral o tarjetas para seleccionar el tipo de informe.
    *   **Componentes Clave Incrustados:**
        *   **`ReportSelector`**: Navegación principal entre los tipos de informe (Resumen, Rentabilidad, Capital, Inventario, Rankings).
        *   **`PeriodSelector`**: Componente destacado y reutilizable que permite seleccionar periodos predefinidos (Hoy, Ayer, Semana Actual/Pasada, Mes Actual/Pasado) y un rango de fechas personalizado. Incluirá una opción para seleccionar el periodo de comparación.
        *   **`FilterControls`**: Un área que muestra dinámicamente los controles de filtro relevantes para el informe actualmente seleccionado (ej. selector de juego, selector de fuente de fondos, tipo de ranking).
        *   **`ExportToPdfButton`**: Un botón claramente visible, habilitado una vez que se ha cargado un informe, para descargar la vista actual como PDF.
        *   **`ReportDisplayArea`**: El contenedor principal donde se renderizará el componente específico del informe seleccionado (ej. `SummaryReportView`).

2.  **Componentes de Vista por Informe:**
    *   **`SummaryReportView`**: 
        *   Muestra los KPIs principales en tarjetas o secciones destacadas.
        *   Renderiza los gráficos (tendencias, distribuciones) usando el componente `ChartWrapper`.
        *   Muestra datos comparativos si se solicitan.
    *   **`ProfitabilityReportView`**: 
        *   Utiliza el componente `DataTable` para mostrar la lista detallada de transacciones de venta y su rentabilidad.
        *   Incluye gráficos de barras para ítems/juegos más rentables.
        *   Muestra los totales y promedios.
    *   **`CapitalFlowReportView`**: 
        *   Puede mostrar una tabla (`DataTable`) con el detalle de movimientos por fuente.
        *   Utiliza `ChartWrapper` para los gráficos de evolución de saldo y flujo de caja.
        *   Muestra saldos iniciales, finales y totales.
    *   **`InventoryReportView`**: 
        *   Usa `DataTable` para listar el inventario.
        *   Aplica estilos condicionales para resaltar ítems con bajo stock.
        *   Incluye gráficos (barras, circular) de cantidad y valor.
        *   (Opcional) Podría tener una vista secundaria o modal para mostrar el historial de movimientos de un ítem.
    *   **`RankingsReportView`**: 
        *   Muestra listas ordenadas (Top N).
        *   Utiliza `ChartWrapper` para gráficos de barras simples que visualicen el ranking.

3.  **Componentes Reutilizables Esenciales:**
    *   **`ChartWrapper`**: Abstracción sobre la librería de gráficos elegida (Recharts, Chart.js, etc.). Responsable de renderizar diferentes tipos de gráficos (líneas, barras, donas/circulares) y aplicar el tema oscuro y opciones comunes.
    *   **`DataTable`**: Componente de tabla potente con características como paginación (del lado del cliente o servidor, dependiendo de la cantidad de datos), ordenamiento, y posiblemente filtros básicos por columna. Podría basarse en librerías como TanStack Table.
    *   **`PeriodSelector`**: Componente dedicado para la selección de fechas/periodos, incluyendo preselecciones comunes y rangos personalizados, más la selección del periodo de comparación.
    *   **`FilterDropdown` / `FilterMultiSelect`**: Componentes de filtro reutilizables basados en Headless UI.
    *   Componentes básicos de UI (`StyledButton`, `StyledInput`, etc.) consistentes con el tema oscuro.
    *   `LoadingSpinner` y `NotificationToast` para la retroalimentación al usuario durante la carga de datos y la exportación.

Esta estructura de componentes busca crear una experiencia de usuario flexible y potente para el análisis de los datos del negocio. 