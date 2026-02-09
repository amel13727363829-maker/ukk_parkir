const mysql = require('mysql2/promise');

async function updateCapacity() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('Connected to database');

    // First, let's see current areas
    console.log('\n=== CURRENT PARKING AREAS ===');
    const [currentAreas] = await connection.execute(
      'SELECT id_arf, nama_area, kapasitas FROM tb_arf ORDER BY id_arf'
    );
    console.table(currentAreas);

    // Update areas with new capacities
    const updates = [
      { nama_area: 'Area Motor Depan', kapasitas: 350 },
      { nama_area: 'Area Mobil Basement', kapasitas: 300 },
      { nama_area: 'Area VIP', kapasitas: 390 }
    ];

    console.log('\n=== UPDATING CAPACITIES ===');
    for (const update of updates) {
      const [result] = await connection.execute(
        'UPDATE tb_arf SET kapasitas = ? WHERE nama_area = ?',
        [update.kapasitas, update.nama_area]
      );
      console.log(`✓ Updated "${update.nama_area}": ${update.kapasitas} slots`);
      if (result.affectedRows === 0) {
        console.warn(`  ⚠ Area "${update.nama_area}" not found!`);
      }
    }

    // Show updated areas
    console.log('\n=== UPDATED PARKING AREAS ===');
    const [updatedAreas] = await connection.execute(
      'SELECT id_arf, nama_area, kapasitas FROM tb_arf ORDER BY id_arf'
    );
    console.table(updatedAreas);

    console.log('\n✅ Capacity update completed!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

updateCapacity();
