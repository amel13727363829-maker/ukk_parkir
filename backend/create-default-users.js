const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    console.log('🔐 Creating default admin user...\n');

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id_user, username FROM m_user WHERE username = ?',
      ['admin']
    );

    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('');
      console.log('Login credentials:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create admin user
      await connection.execute(
        'INSERT INTO m_user (username, password, nama_lengkap, email, role, status_aktif) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'Administrator', 'admin@parkir.local', 'admin', 1]
      );

      console.log('✅ Default admin user created successfully!\n');
      console.log('Login credentials:');
      console.log('  Username: admin');
      console.log('  Password: admin123\n');

      // Create sample operator user
      const operatorPassword = await bcrypt.hash('operator123', 10);
      await connection.execute(
        'INSERT INTO m_user (username, password, nama_lengkap, email, role, status_aktif) VALUES (?, ?, ?, ?, ?, ?)',
        ['operator1', operatorPassword, 'Operator 1', 'operator1@parkir.local', 'operator', 1]
      );

      console.log('✅ Sample operator user created!\n');
      console.log('Operator credentials:');
      console.log('  Username: operator1');
      console.log('  Password: operator123\n');
    }

    // Show all users
    console.log('📋 Current users in database:\n');
    const [users] = await connection.execute(
      'SELECT id_user, username, nama_lengkap, role, status_aktif FROM m_user'
    );
    console.table(users);

    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
