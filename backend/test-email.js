require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  console.log('🧪 Probando configuración de email...');
  
  try {
    // Test connection
    const isConnected = await emailService.testConnection();
    if (!isConnected) {
      console.log('❌ Fallo en la conexión SMTP');
      return;
    }
    
    // Test welcome email
    console.log('📧 Enviando email de prueba...');
    
    await emailService.sendWelcomeEmail({
      to: 'comunidadyosoyelpremio@gmail.com', // Enviar a ti mismo para probar
      username: 'TestUser',
      tempPassword: 'TempPass123!',
      resetLink: 'http://localhost:3000/reset-password?token=test-token-123',
    });
    
    console.log('✅ Email de prueba enviado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
  }
  
  process.exit(0);
}

testEmail();