const mysql = require('mysql2/promise');
const { hashPassword } = require('./src/utils/tokenGenerator');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('✅ Database Connected\n');

    // Check existing users
    console.log('📋 Checking existing users...\n');
    const [users] = await connection.execute(
      'SELECT id_user, username, nama_lengkap, role, status_aktif FROM tb_user'
    );

    if (users.length === 0) {
      console.log('❌ No users found in database\n');
      console.log('Creating default admin user...\n');

      const hashedPassword = await hashPassword('admin123');
      
      await connection.execute(
        'INSERT INTO tb_user (username, password, nama_lengkap, email, role, status_aktif) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'Admin', 'admin@parkir.local', 'admin', 1]
      );

      console.log('✅ Default admin user created successfully!\n');
      console.log('Login credentials:');
      console.log('  Username: admin');
      console.log('  Password: admin123\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      console.table(users);
    }

    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
