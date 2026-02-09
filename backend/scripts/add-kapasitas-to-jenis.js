const mysql = require('mysql2/promise');

async function addKapasitasColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('Connected to database');

    // Check if column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'm_jenis_parkir' AND COLUMN_NAME = 'kapasitas'
    `);

    if (columns.length === 0) {
      console.log('Adding kapasitas column to m_jenis_parkir...');
      await connection.execute(`
        ALTER TABLE m_jenis_parkir ADD COLUMN kapasitas INT DEFAULT 0 AFTER deskripsi
      `);
      console.log('✅ Column kapasitas added successfully');
    } else {
      console.log('✅ Column kapasitas already exists');
    }

    // Show current data
    console.log('\n=== JENIS PARKIR DATA ===');
    const [rows] = await connection.execute('SELECT id_jenis_parkir, nama_jenis, deskripsi, kapasitas FROM m_jenis_parkir');
    console.table(rows);

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addKapasitasColumn();
