const { User } = require('./src/models');

(async () => {
  try {
    const admin = await User.findOne({ where: { email: 'admin@chatysp.com' } });
    if (admin) {
      console.log('✅ Admin encontrado:', {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        hasPassword: !!admin.password
      });
      
      // Test password
      const isValid = await admin.comparePassword('admin123');
      console.log('🔑 Password test:', isValid ? 'VÁLIDA' : 'INVÁLIDA');
    } else {
      console.log('❌ Admin no encontrado');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();