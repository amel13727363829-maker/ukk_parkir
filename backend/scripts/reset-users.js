const mysql = require('mysql2/promise');
const { hashPassword } = require('../src/utils/tokenGenerator');

async function resetUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'parkir_db',
  });

  try {
    // Hash passwords
    const adminPassword = await hashPassword('admin123');
    const petugasPassword = await hashPassword('password');

    // Delete existing users
    await connection.execute('DELETE FROM m_user WHERE username IN ("admin", "petugas2", "owner")');

    // Insert new users with correct passwords
    await connection.execute(
      `INSERT INTO m_user (username, password, nama_lengkap, email, no_telepon, role, status_aktif, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      ['admin', adminPassword, 'Administrator', 'admin@parkir.app', '081234567890', 'admin']
    );

    await connection.execute(
      `INSERT INTO m_user (username, password, nama_lengkap, email, no_telepon, role, status_aktif, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      ['petugas2', petugasPassword, 'Petugas 2', 'petugas2@parkir.app', '081234567891', 'operator']
    );

    console.log('✅ Users reset dengan password:');
    console.log('  - admin: admin123');
    console.log('  - petugas2: password');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

resetUsers();
