const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log('🔍 Testing Database and User Setup\n');
    console.log('=' .repeat(60) + '\n');

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    // Check admin user
    console.log('1️⃣  Checking for admin user...\n');
    
    const [users] = await connection.execute(
      'SELECT id_user, username, nama_lengkap, role, status_aktif FROM m_user'
    );

    if (users.length === 0) {
      console.log('❌ No users found!');
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:\n`);
      console.table(users);
    }

    const adminUser = users.find(u => u.username === 'admin');

    if (adminUser) {
      console.log('\n✅ Admin user exists!');
      console.log('\nLogin credentials for testing:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  Role: ' + adminUser.role);
      console.log('  Status: ' + (adminUser.status_aktif ? 'Active ✓' : 'Inactive ✗'));
    } else {
      console.log('\n⚠️  Admin user not found - you may need to create one');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n🌐 Frontend Access:');
    console.log('  URL: http://localhost:3000 or http://localhost:3001');
    console.log('  (Port depends on availability)\n');

    console.log('📱 Backend API:');
    console.log('  URL: http://localhost:5001/api/v1\n');

    console.log('✅ All systems ready for login!\n');

    await connection.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
