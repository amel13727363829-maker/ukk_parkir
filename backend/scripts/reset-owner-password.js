const bcrypt = require('bcryptjs');
const db = require('../src/models');

async function resetOwnerPassword() {
  try {
    const hash = await bcrypt.hash('123456', 10);
    console.log('Hashed password for 123456:', hash);
    
    const result = await db.User.update(
      { password: hash },
      { where: { role: 'owner' } }
    );
    
    console.log('✅ Owner password reset to: 123456');
    
    // Verify
    const owner = await db.User.findOne({ where: { role: 'owner' }, raw: true });
    console.log('Owner user:', { id: owner.id_user, username: owner.username, role: owner.role });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetOwnerPassword();
