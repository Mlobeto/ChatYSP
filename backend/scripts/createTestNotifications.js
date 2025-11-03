const { Notification, User } = require('../src/models');

/**
 * Script para crear notificaciones de prueba
 */
async function createTestNotifications() {
  try {
    console.log('🔍 Buscando usuarios administradores...');
    
    // Buscar usuarios admin
    const admins = await User.findAll({
      where: { role: 'admin' },
      limit: 3,
    });

    if (admins.length === 0) {
      console.log('❌ No se encontraron usuarios administradores');
      return;
    }

    console.log(`✅ Encontrados ${admins.length} administradores`);

    // Crear notificaciones de diferentes tipos para cada admin
    const notifications = [];

    admins.forEach((admin) => {
      // Notificación de usuario registrado
      notifications.push({
        userId: admin.id,
        type: 'user_registered',
        title: 'Nuevo usuario registrado',
        message: 'María González se ha registrado en la plataforma',
        priority: 'normal',
        metadata: {
          username: 'maria.gonzalez',
          email: 'maria@example.com',
          registrationDate: new Date(),
        },
      });

      // Notificación de tip creado
      notifications.push({
        userId: admin.id,
        type: 'tip_created',
        title: 'Tip creado',
        message: 'Se ha creado un nuevo tip sobre técnicas de comunicación',
        priority: 'normal',
        metadata: {
          tipTitle: 'Técnicas de comunicación efectiva',
          category: 'coaching',
          creatorUsername: 'admin',
        },
      });

      // Notificación urgente del sistema
      notifications.push({
        userId: admin.id,
        type: 'system',
        title: 'Mantenimiento programado',
        message: 'El sistema tendrá mantenimiento el domingo de 02:00 a 04:00',
        priority: 'high',
        metadata: {
          maintenanceDate: '2025-11-10T02:00:00Z',
          duration: '2 horas',
        },
      });

      // Notificación general
      notifications.push({
        userId: admin.id,
        type: 'general',
        title: 'Bienvenido al nuevo sistema de notificaciones',
        message: 'Ahora recibirás notificaciones en tiempo real sobre actividades importantes',
        priority: 'normal',
        metadata: {
          feature: 'notifications',
          version: '1.0',
        },
      });

      // Notificación de tip actualizado (ya leída)
      notifications.push({
        userId: admin.id,
        type: 'tip_updated',
        title: 'Tip actualizado',
        message: 'El tip "Gestión del tiempo" ha sido actualizado con nueva información',
        priority: 'low',
        isRead: true,
        metadata: {
          tipTitle: 'Gestión del tiempo',
          category: 'general',
          updaterUsername: 'moderator',
        },
      });
    });

    console.log(`📝 Creando ${notifications.length} notificaciones de prueba...`);

    // Insertar todas las notificaciones
    const createdNotifications = await Notification.bulkCreate(notifications);

    console.log(`✅ Se crearon ${createdNotifications.length} notificaciones de prueba`);
    
    // Mostrar resumen
    const notificationsByType = {};
    createdNotifications.forEach((notification) => {
      notificationsByType[notification.type] = (notificationsByType[notification.type] || 0) + 1;
    });

    console.log('\n📊 Resumen por tipo:');
    Object.entries(notificationsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} notificaciones`);
    });

    console.log('\n🎉 ¡Notificaciones de prueba creadas exitosamente!');
  } catch (error) {
    console.error('❌ Error creando notificaciones de prueba:', error);
  }
}

// Ejecutar el script
if (require.main === module) {
  createTestNotifications()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createTestNotifications;