const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log('🔄 Updating parking areas...\n');

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('1️⃣  Checking current areas...\n');
    const [currentAreas] = await connection.execute(
      'SELECT id_arf, nama_area, kapasitas FROM tb_arf ORDER BY id_arf'
    );
    
    console.log('Current areas:');
    console.table(currentAreas);
    console.log('');

    // Delete Area A, B, C (assuming they have id_arf 2, 3, 4 based on common patterns)
    console.log('2️⃣  Deleting Area A, B, C...\n');
    
    const [toDelete] = await connection.execute(
      "SELECT id_arf, nama_area FROM tb_arf WHERE nama_area LIKE '%Area A%' OR nama_area LIKE '%Area B%' OR nama_area LIKE '%Area C%'"
    );

    for (const area of toDelete) {
      await connection.execute('DELETE FROM tb_arf WHERE id_arf = ?', [area.id_arf]);
      console.log(`✅ Deleted: ${area.nama_area} (ID: ${area.id_arf})`);
    }

    console.log('');
    console.log('3️⃣  Updating Area D to "Area Outdoor"...\n');
    
    const [areaD] = await connection.execute(
      "SELECT id_arf FROM tb_arf WHERE nama_area LIKE '%Area D%'"
    );

    if (areaD.length > 0) {
      await connection.execute(
        'UPDATE tb_arf SET nama_area = ? WHERE id_arf = ?',
        ['Area Outdoor', areaD[0].id_arf]
      );
      console.log(`✅ Updated Area D → Area Outdoor`);
    }

    console.log('');
    console.log('4️⃣  Updating Area E to "Area VIP"...\n');
    
    const [areaE] = await connection.execute(
      "SELECT id_arf FROM tb_arf WHERE nama_area LIKE '%Area E%'"
    );

    if (areaE.length > 0) {
      await connection.execute(
        'UPDATE tb_arf SET nama_area = ? WHERE id_arf = ?',
        ['Area VIP', areaE[0].id_arf]
      );
      console.log(`✅ Updated Area E → Area VIP`);
    }

    console.log('');
    console.log('5️⃣  Final areas list:\n');
    
    const [finalAreas] = await connection.execute(
      'SELECT id_arf, nama_area, kapasitas FROM tb_arf ORDER BY id_arf'
    );
    
    console.table(finalAreas);

    await connection.end();
    console.log('\n✅ Parking areas updated successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
