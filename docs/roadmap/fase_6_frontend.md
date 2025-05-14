# Fase 6: Interfaz de Usuario (Frontend) - General

Este documento detalla la planificación y el estado de los aspectos generales de la interfaz de usuario (Frontend) de la aplicación, complementando los componentes específicos definidos en las fases de cada módulo.

## 1. Objetivos Principales

Los objetivos clave para la planificación general del frontend son:

*   Definir la estructura de **layout principal** de la aplicación, favoreciendo **pantallas dedicadas y optimizadas para tareas específicas**, en particular la **entrada rápida de datos para el rol de `operator`**.
*   Establecer un sistema de **navegación principal eficiente** que permita acceso rápido a las funciones clave (ej. registro de transacciones/contactos, vista de saldos/stock, informes).
*   **Optimizar la UI/UX para la entrada rápida y efectiva de datos** por parte de los operadores, especialmente durante momentos de alto tráfico, minimizando clics y complejidad en formularios de uso frecuente.
*   Implementar el **flujo de autenticación** en el frontend: página de login, manejo de tokens JWT, almacenamiento seguro del token, protección de rutas según autenticación y rol. (✅ Implementado)
*   Crear las interfaces necesarias para la **gestión de usuarios** por parte del administrador (listar, crear, editar, cambiar estado/rol de operadores). (✅ Implementado)
*   Implementar la interfaz para que el administrador gestione la **configuración de "Juegos Activos"** y otras configuraciones relevantes de `appSettings`. (🚧 Parcialmente implementado a través de la gestión de juegos, pendiente UI de AppSettings)
*   Asegurar la **consistencia visual** en toda la aplicación, aplicando de forma coherente el **tema oscuro** seleccionado. (✅ Implementado)
*   Confirmar y documentar las **librerías principales de UI** (ej. Headless UI + Tailwind CSS) y de **gráficos** (ej. Recharts) que se utilizarán. (✅ Confirmado: Tailwind CSS, componentes comunes desarrollados, se considerará Recharts para gráficos)
*   Garantizar una **buena Experiencia de Usuario (UX) general**, abordando aspectos como diseño responsivo (adaptabilidad a móvil/escritorio), rendimiento percibido, manejo claro de estados de carga y error, y accesibilidad. (🚧 En progreso continuo)

## 2. Estructura General y Layout

*   **Layout Principal:** Se utiliza un `DashboardLayout` que incluye una barra lateral de navegación (`SidePanel`) y un área de contenido principal. (✅ Implementado)
*   **Componentes de Layout Reutilizables:** `Card`, `Button`, `Modal`, `LoadingSpinner`, `Notification`, `FilterBar` han sido creados y se utilizan consistentemente. (✅ Implementado)
*   **Optimización para Operadores:** Se priorizarán formularios directos y flujos de trabajo eficientes para las tareas comunes del operador, como el registro de transacciones. (🚧 Objetivo continuo, se refinará con la UI de transacciones)

## 3. Navegación Principal

*   **SidePanel:** Contiene enlaces a las secciones principales: Dashboard (pendiente), Juegos, Fuentes de Fondos, Contactos, Transacciones (pendiente), Usuarios (admin), Configuración (pendiente). (✅ Implementado y expandiéndose)
*   **Rutas Protegidas:** El enrutamiento (`react-router-dom`) protege las rutas según la autenticación y el rol del usuario. (✅ Implementado)

## 4. Flujo de Autenticación y Gestión de Usuarios (UI)

*   **Páginas de Autenticación:** `LoginPage`, `RegisterPage` (si aplica para auto-registro o solo creación por admin). (✅ LoginPage implementada)
*   **Contexto de Autenticación (`AuthContext`):** Maneja el estado del usuario, token JWT, y funciones de login/logout. (✅ Implementado)
*   **Gestión de Usuarios (Admin UI en `UserManagementPage.tsx`):**
    *   Listado, creación, edición y eliminación de usuarios/operadores.
    *   Asignación de roles (admin/operator).
    *   Modales de confirmación para acciones sensibles. (✅ Implementado)

## 5. Gestión de Configuración (UI para Admin)

*   **Gestión de Juegos:** La actual `GameManagementPage.tsx` permite la gestión completa de juegos, que indirectamente es una forma de "configuración". (✅ Implementado)
*   **Pendiente:** Una sección dedicada de "Configuración de la Aplicación" (`AppSettings`) para que el administrador gestione:
    *   Tasas de cambio (fuentes, actualización manual si es necesario).
    *   Monedas fiat soportadas.
    *   Comisiones por defecto.
    *   Otras configuraciones globales.

## 6. Tema Visual (Modo Oscuro) y Consistencia

*   **Modo Oscuro por Defecto:** La aplicación utiliza un tema oscuro de forma consistente. (✅ Implementado)
*   **Tailwind CSS:** Se utiliza para el estilizado, permitiendo una personalización detallada y coherente. (✅ Implementado)
*   **Componentes Comunes:** El uso de componentes comunes (`Button`, `Card`, `Modal`, etc.) asegura la consistencia visual. (✅ Implementado)

## 7. Librerías Principales de UI y Gráficos (Confirmación)

*   **UI Framework:** Tailwind CSS es la base para el estilizado. (✅ Confirmado)
*   **Componentes Headless/Custom:** Se han desarrollado componentes comunes personalizados (`Button`, `Modal`, `Input`, `Card`, `FilterBar`, etc.) priorizando la flexibilidad. Se podría considerar Headless UI si se necesitan componentes más complejos y accesibles como base. (✅ Enfoque actual: componentes custom con Tailwind)
*   **Librería de Gráficos:** Se considerará **Recharts** o similar cuando se implemente el Dashboard y los Informes (Fase 5). (Planificado)
*   **Manejo de Formularios:** Se utiliza el estado de React y se podría considerar `react-hook-form` para formularios más complejos si es necesario. (Enfoque actual: estado de React)
*   **Notificaciones (Toasts):** `react-toastify` está en uso. (✅ Implementado)

## 8. Consideraciones de UX/UI Generales

*   **Diseño Responsivo:** Es un objetivo continuo. Algunas páginas están más adaptadas que otras. Se necesita una revisión y mejora general para asegurar la completa funcionalidad en móviles. (🚧 En progreso)
*   **Estados de Carga y Error:** Se utilizan `LoadingSpinner` y `Notification` para feedback al usuario. (✅ Implementado, mejora continua)
*   **Accesibilidad (a11y):** Aunque no ha sido un foco principal explícito, se intentará seguir buenas prácticas. El uso futuro de Headless UI podría ayudar. (🚧 A mejorar)
*   **Rendimiento Percibido:** Optimizar la carga de datos y la respuesta de la interfaz. (�� Objetivo continuo) 