const mysql = require('mysql2/promise');

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'parkir_db',
  });

  try {
    console.log('🔄 Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    
    console.log('🔄 Dropping m_user table...');
    await connection.execute('DROP TABLE IF EXISTS m_user');
    console.log('✅ m_user table dropped');

    console.log('🔄 Recreating m_user table...');
    await connection.execute(`
      CREATE TABLE m_user (
        id_user INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nama_lengkap VARCHAR(100),
        email VARCHAR(100),
        no_telepon VARCHAR(20),
        role ENUM('admin', 'operator', 'manager') DEFAULT 'operator',
        status_aktif TINYINT(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_username (username),
        KEY idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ m_user table recreated');
    console.log('🔄 Enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

fixDatabase();
