[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JfMc20/appcoins)

# AppCoins: Herramienta Administrativa para Revendedores de Ítems de Juegos

AppCoins es una aplicación web diseñada para simplificar y profesionalizar la gestión de operaciones de compra, venta y reventa de monedas virtuales, ítems de juegos MMORPG y otros productos digitales. Si eres un revendedor que maneja inventario, clientes, múltiples juegos y necesitas controlar tus transacciones y precios de manera eficiente, AppCoins es para ti.

## ¿Qué problema resuelve AppCoins?

La reventa de ítems y monedas de juegos puede volverse compleja rápidamente. AppCoins aborda estos desafíos centralizando:

*   La gestión de un catálogo diverso de juegos e ítems.
*   El seguimiento del stock y los precios de compra/venta.
*   La administración de clientes y proveedores.
*   El registro detallado de todas las transacciones.
*   La adaptación a diferentes tasas de cambio para operar en varios mercados.

## Características Principales

*   **Gestión de Catálogo Detallada:**
    *   Define múltiples juegos (ej. Tibia, WoW, etc.) y sus ítems/monedas específicas (ej. Tibia Coins, Gold, Gemas).
    *   Administra "Productos Externos" como claves de software, tarjetas de regalo, etc.
*   **Control de Inventario:**
    *   Lleva un registro del stock disponible para los ítems que gestionas (próximamente con mayor detalle en UI).
*   **Seguimiento Integral de Transacciones:**
    *   Registra operaciones de compra (a proveedores o jugadores) y venta (a clientes).
    *   **Visualiza un historial completo de transacciones con paginación y detalles básicos.**
    *   Vincula transacciones a contactos y actualiza el inventario automáticamente (en desarrollo).
*   **Gestión de Precios y Tasas de Cambio:**
    *   Configura precios de compra y venta para tus productos.
    *   Maneja múltiples tasas de cambio (ej. USDT-VES, USDT-COP) para operar en diferentes mercados locales.
    *   Integración con APIs externas para la actualización de tasas de monedas fiat.
    *   **Control de disponibilidad de tasas por par de monedas individualmente.**
*   **Administración de Contactos (Clientes/Proveedores):**
    *   Mantén una base de datos organizada de tus contactos comerciales.
*   **Roles de Usuario:**
    *   Sistema de roles (Administrador, Operador) para gestionar el acceso y delegar tareas dentro de tu equipo.
*   **Interfaz Intuitiva:**
    *   Diseñada para ser clara y eficiente, con un tema oscuro para mayor comodidad visual.

## Tecnologías Utilizadas

*   **Backend:** Node.js, Express.js, TypeScript, MongoDB
*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Autenticación:** Basada en JWT (JSON Web Tokens)

## Estado Actual del Proyecto

AppCoins se encuentra en **desarrollo activo**. Módulos fundamentales como la gestión de juegos, fuentes de fondos (para control de capital), la gestión de contactos y administración de usuarios ya están implementados y son funcionales. El backend para transacciones (creación y listado básico) y tasas de cambio también están avanzados. **El frontend ahora cuenta con la capacidad de listar todas las transacciones con paginación y la gestión del estado de habilitado por cada par de tasas de cambio.** La página de Ajustes de la Aplicación ha sido simplificada para centrarse en la gestión de monedas soportadas. El trabajo actual se centra en completar la interfaz para otros tipos de transacciones, el dashboard principal y los módulos de informes.

---

_(Este README se actualizará a medida que el proyecto evolucione.)_
