// Script para ejecutar en la consola del navegador para arreglar el problema del usuario admin
(function() {
  try {
    // Crear un objeto usuario administrador
    const adminUser = {
      _id: '507f1f77bcf86cd799439011', // ID ficticio
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active'
    };
    
    // Guardar en localStorage
    localStorage.setItem('userObject', JSON.stringify(adminUser));
    
    console.log('%c ✅ Usuario administrador creado correctamente en localStorage', 'color: green; font-weight: bold');
    console.log('Información del usuario:', adminUser);
    console.log('Por favor, recarga la página para ver los cambios.');
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  }
})(); 