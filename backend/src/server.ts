import dotenv from 'dotenv';
dotenv.config(); // Cargar variables de entorno desde .env

import app from './app';
import connectDB from './config/database'; // Importar la función de conexión

const PORT: string | number = process.env.PORT || 3001; // Usar el puerto de .env o 3001 por defecto

// Función autoejecutable asíncrona para manejar la conexión a la BD y luego iniciar el servidor
const startServer = async () => {
  await connectDB(); // Conectar a la base de datos

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer().catch(error => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
}); 