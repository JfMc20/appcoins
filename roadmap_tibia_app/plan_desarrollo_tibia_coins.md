**Documento: Plan de Desarrollo - Aplicación de Gestión Multi-Juego y Productos**

**1. Definición y Alcance del Proyecto:**

*   Ver detalles en: [Definición y Alcance del Proyecto](./definicion_y_alcance.md)

**2. Tecnologías Propuestas (Ejemplos, podemos ajustarlas):**

*   **Backend:** Node.js con Express.
*   **Frontend:** React with TypeScript (TS).
*   **Base de Datos:** MongoDB (NoSQL).
    *   *Pros:* Esquema flexible (ideal para variabilidad de datos de juegos/productos), natural para JavaScript/Node.js (documentos BSON/JSON), buena escalabilidad horizontal.
    *   *Contras:* Generalmente requiere un servidor separado (local o en la nube), las relaciones complejas entre datos pueden necesitar una planificación cuidadosa del diseño de documentos.
    *   *(Nota: Bases de datos SQL como PostgreSQL o MySQL podrían considerarse en un futuro muy lejano si surgieran necesidades relacionales extremadamente complejas no cubiertas eficientemente por MongoDB, pero el foco primario es MongoDB)*.
*   **API para Tasa de Cambio de Monedas Fiat:** Se investigarán APIs públicas o servicios que provean las tasas necesarias (ej. exchanges de criptomonedas, APIs financieras) con capacidad de expansión.

**2.A. Principios Generales de Desarrollo**

*   **Modularidad:** El sistema se construirá en módulos cohesivos y con bajo acoplamiento para facilitar el desarrollo, las pruebas y el mantenimiento.
*   **Separación de Responsabilidades (SoC):** Cada componente del sistema (módulo, clase, función) tendrá una responsabilidad clara y única.
*   **Reutilización (DRY - Don't Repeat Yourself):** Se priorizará la creación de código reutilizable (componentes, servicios, utilidades) para evitar la duplicación y mejorar la eficiencia.
*   **Código Limpio y Mantenible:** Se seguirán buenas prácticas de codificación, incluyendo nombres descriptivos, funciones concisas, y comentarios juiciosos para asegurar la legibilidad y facilidad de mantenimiento.
*   **Diseño Responsivo:** La interfaz de usuario será diseñada para ofrecer una experiencia óptima en una variedad de dispositivos (escritorio, tablet, móvil).
*   **Escalabilidad:** Aunque se empiece con una configuración sencilla (ej. MongoDB), las decisiones de diseño deben tener en cuenta la posible necesidad de escalar la aplicación en el futuro.
*   **Seguridad:** Se considerarán las mejores prácticas de seguridad en todas las capas de la aplicación, especialmente en la autenticación, autorización y manejo de datos sensibles.

**2.B. Configuración de Acceso y Dominio**

*   **Dominio Principal de la Aplicación:** Inicialmente configurado como `https://appcoinsadmin.duckdns.org`. Este dominio se gestionará a través de variables de entorno (ej. `APP_DOMAIN` para la configuración de Docker/Traefik y `VITE_ALLOWED_HOSTNAME` para la configuración de desarrollo de Vite) para facilitar cambios futuros.
*   **Gestión de Tráfico y SSL:** Se utilizará Traefik como reverse proxy para gestionar el tráfico entrante y la terminación SSL (HTTPS) para el dominio configurado, utilizando certificados de Let's Encrypt.
*   **Estructura de URIs (bajo el dominio configurado):**
    *   El frontend será servido directamente.
    *   La API del backend será accesible a través del path `/api`. Traefik se encargará de enrutar las peticiones `/api/*` al servicio del backend.
    *   El frontend se configurará (a través de `VITE_API_BASE_URL=/api`) para hacer sus peticiones a la API usando este path relativo, lo que lo hace independiente del nombre de dominio específico.

**3. Fases de Desarrollo:**

*   **Fase 1: Configuración del Entorno y Diseño de Base de Datos.**
    *   Ver detalles y progreso en: [Fase 1: Configuración del Entorno y Diseño de Base de Datos](./fase_1_entorno_y_db.md)

*   **Fase 2: Módulo de Gestión de Precios y Tasas de Cambio.**
    *   Ver detalles y progreso en: [Fase 2: Módulo de Gestión de Precios y Tasas de Cambio](./fase_2_precios_y_tasas.md)

*   **Fase 3: Módulo de Transacciones.**
    *   Ver detalles y progreso en: [Fase 3: Módulo de Transacciones](./fase_3_transacciones.md)

*   **Fase 4: Módulo de Gestión de Contactos.**
    *   Ver detalles y progreso en: [Fase 4: Módulo de Gestión de Contactos](./fase_4_contactos.md)
    *   CRUD para contactos.
    *   Visualización de historial de transacciones por contacto.

*   **Fase 5: Módulo de Informes.**
    *   Ver detalles y progreso en: [Fase 5: Módulo de Informes](./fase_5_informes.md)
    *   Generación de informes diarios y personalizados (por juego, producto, contacto, fechas).
    *   Informes de stock.

*   **Fase 6: Interfaz de Usuario (Frontend).**
    *   Ver detalles y progreso en: [Fase 6: Interfaz de Usuario (Frontend) - General](./fase_6_frontend.md)
    *   Diseño y desarrollo de todas las vistas de la aplicación.
    *   Asegurar diseño responsivo y buena UX.

*   **Fase 7: Pruebas y Despliegue.**
    *   (Detalles a desarrollar en un archivo dedicado, ej: `./fase_7_pruebas_despliegue.md`)
    *   Pruebas unitarias, de integración y E2E.
    *   Corrección de errores.
    *   Estrategia y ejecución del despliegue.

**4. Siguientes Pasos Inmediatos:**

*   **Investigación de APIs de Tasa de Cambio:** Buscar y evaluar APIs fiables para USDT-VES.
*   **Definición Detallada de Cálculos de Porcentaje:** ¿Cómo se calcularán exactamente las comisiones o ganancias? (Ej: ¿Es un porcentaje fijo sobre el monto en USDT? ¿Varía según el volumen?)
*   **Diseño de la Interfaz de Usuario (Bocetos Iniciales):** ¿Cómo te imaginas las pantallas principales? 