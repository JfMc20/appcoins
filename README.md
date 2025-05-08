# AdminCoins - Aplicación de Gestión

Aplicación para monitorear y gestionar la compra/venta de monedas de juegos y productos externos, con cálculo de rentabilidad y gestión de tasas de cambio.

## Estructura del Proyecto

*   `/backend`: API RESTful (Node.js, Express, TypeScript, MongoDB)
*   `/frontend`: Interfaz de usuario (React, TypeScript, Vite)
*   `/roadmap_tibia_app`: Documentos de planificación detallada.

## Configuración y Ejecución

_(Esta sección se completará más adelante con detalles sobre Docker Compose)_

### Backend

1.  Navega a la carpeta `backend`: `cd backend`
2.  Instala dependencias: `npm install`
3.  Ejecuta el servidor de desarrollo (con Nodemon): `npm run dev`
    *   El servidor estará disponible en `http://localhost:3001` (o el puerto definido en `.env`).

### Frontend

1.  Navega a la carpeta `frontend`: `cd frontend`
2.  Instala dependencias: `npm install`
3.  Ejecuta el servidor de desarrollo (Vite): `npm run dev`
    *   La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Scripts Útiles

### Probar Tasas de Cambio (Backend)

Este script contacta la API de CriptoYa para obtener las tasas de cambio actuales para los pares USDT/FIAT definidos.

1.  Asegúrate de estar en la carpeta `backend`.
2.  Ejecuta el comando: `npx ts-node src/scripts/testExchangeRates.ts`
3.  Verás la salida de las tasas en la consola.

---

_(Más secciones se añadirán a medida que el proyecto avance: Despliegue, Contribución, etc.)_ 