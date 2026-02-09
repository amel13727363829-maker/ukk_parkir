const bcrypt = require('bcryptjs');
const db = require('../src/models');

async function resetAdminPassword() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Hashed password for admin123:', hash);

    const result = await db.User.update(
      { password: hash },
      { where: { role: 'admin' } }
    );

    console.log('✅ Admin password reset to: admin123');

    // Verify
    const admin = await db.User.findOne({ where: { role: 'admin' }, raw: true });
    console.log('Admin user:', { id: admin.id_user, username: admin.username, role: admin.role });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetAdminPassword();
