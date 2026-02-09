const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'parkir_db'
    });

    console.log('Connected to database');

    // Alter the role enum to include new values
    await connection.execute(
      "ALTER TABLE m_user MODIFY COLUMN role ENUM('admin', 'operator', 'manager', 'owner', 'petugas') DEFAULT 'operator'"
    );
    
    console.log('✓ Successfully updated m_user table role enum');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
