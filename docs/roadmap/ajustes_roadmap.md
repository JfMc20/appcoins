# Propuesta de Ajustes al Roadmap de AppCoins

Basado en el análisis del roadmap original y el estado actual del proyecto, este documento propone ajustes para optimizar el desarrollo y adaptarlo a las necesidades reales del proyecto.

## Ajustes Generales Propuestos

### 1. Enfoque Modular y Entregas Incrementales

El roadmap original está estructurado en fases secuenciales que pueden retrasar la entrega de valor. Se propone:

- **Desarrollo por módulos funcionales**: Completar ciclos completos (backend + frontend) de funcionalidades específicas antes de pasar a la siguiente.
- **MVP por cada fase**: Definir una versión mínima viable de cada módulo que pueda ser entregada y utilizada.
- **Iteraciones cortas**: Planificar sprints de 2 semanas con entregables concretos.

### 2. Priorización Basada en Valor de Negocio

Se propone reorganizar las fases restantes según el valor que aportan al negocio:

| Prioridad | Funcionalidad | Justificación |
|-----------|---------------|---------------|
| Alta | Transacciones básicas | Core del negocio, permite registrar operaciones |
| Alta | Gestión de contactos | Necesario para vincular transacciones a clientes |
| Media | Gestión de tasas de cambio | Ya implementado parcialmente, permite automatizar cálculos |
| Media | Gestión de juegos y productos | Define el catálogo de ítems transaccionables |
| Media | Dashboard básico | Visibilidad rápida del estado del negocio |
| Baja | Informes avanzados | Útil pero no crítico para la operación diaria |

### 3. Simplificación del Modelo de Datos

El modelo de datos propuesto en la Fase 1 es muy completo pero podría ser excesivamente complejo para la primera versión:

- **Simplificar relaciones**: Reducir la complejidad de algunas entidades al inicio.
- **Enfocar en el flujo principal**: Priorizar las entidades necesarias para el registro de transacciones.
- **Enfoque incremental**: Implementar primero los campos obligatorios y luego añadir los opcionales.

## Roadmap Ajustado

### Fase 1-A: Finalización de Modelos Básicos (Sprint 1-2)

- Completar los modelos esenciales: Game, GameItem, Transaction (simplificado)
- Endpoints CRUD básicos para estos modelos
- Pruebas de integración de estos endpoints

### Fase 3-A: Transacciones Básicas (Sprint 3-4)

- Implementar transacciones de tipo compra/venta de ítems de juego (solo Tibia Coins inicialmente)
- Cálculo simple de valores usando tasas de cambio
- Interfaz básica para registro de transacciones
- Dashboard simple mostrando últimas transacciones

### Fase 4: Gestión de Contactos (Sprint 5)

- CRUD completo para contactos
- Vinculación con transacciones
- Interfaz para gestión de contactos
- Vista de historial básico de transacciones por contacto

### Fase 2-A: Mejoras en Tasas y Precios (Sprint 6)

- Interfaz de administración para tasas de cambio
- Configuración de precios para GameItems
- Visualización mejorada de tasas en el dashboard

### Fase 1-B: Expansión de Modelos (Sprint 7-8)

- Implementar ExternalProduct completo
- Expandir Transaction para soportar productos externos
- Ampliar FundingSource para mejor gestión de capital

### Fase 3-B: Transacciones Avanzadas (Sprint 9-10)

- Soporte para todos los tipos de transacciones
- Cálculo de comisiones y ganancias
- Actualizaciones automáticas de stock
- Interfaz mejorada para transacciones

### Fase 5-A: Informes Básicos (Sprint 11)

- Reporte diario de operaciones
- Reporte básico de stock
- Exportación simple a CSV

### Fase 6: Mejoras de UX y Responsive (Sprint 12)

- Optimización de interfaz para dispositivos móviles
- Mejoras en navegación y experiencia de usuario
- Tema claro/oscuro mejorado

### Fase 5-B: Informes Avanzados (Sprint 13-14)

- Informes personalizados por fechas y criterios
- Gráficos y visualizaciones de datos
- Exportación en múltiples formatos

## Consideraciones Técnicas para el Ajuste

### Backend

- Implementar primero los controladores y servicios básicos antes de añadir validaciones complejas
- Usar enfoques ágiles como TDD (Test-Driven Development) para las partes críticas
- Considerar la implementación de una capa de caché para optimizar las consultas frecuentes

### Frontend

- Usar un enfoque de "diseño mobile-first" desde el principio
- Implementar componentes reutilizables para acelerar el desarrollo
- Considerar el uso de bibliotecas de gráficos para la visualización de datos

### Infraestructura

- Implementar CI/CD para automatizar pruebas y despliegues
- Configurar monitoreo básico de la aplicación
- Implementar backups automatizados de la base de datos

## Próximos Pasos Inmediatos

1. Finalizar la definición del MVP para Fase 1-A
2. Establecer criterios de aceptación claros para cada entregable
3. Crear un repositorio de control de versiones mejorado con estructura de ramas
4. Implementar las tareas de la Fase 1-A según la priorización 