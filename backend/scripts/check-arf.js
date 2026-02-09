const mysql = require('mysql2/promise');

async function checkArf() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('=== TB_ARF COLUMNS ===');
    const [columns] = await connection.execute(
      'SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?',
      ['tb_arf']
    );
    console.table(columns);

    console.log('\n=== TB_ARF DATA ===');
    const [data] = await connection.execute('SELECT * FROM tb_arf');
    console.table(data);

    // Check if jenis_parkir_yang_didukung column exists
    const hasJenisParkir = columns.some(c => c.COLUMN_NAME === 'jenis_parkir_yang_didukung');
    
    if (!hasJenisParkir) {
      console.log('\n⚠️  Column "jenis_parkir_yang_didukung" DOES NOT EXIST!');
      console.log('📝 Need to add this column...');
      
      await connection.execute(
        'ALTER TABLE tb_arf ADD COLUMN jenis_parkir_yang_didukung JSON DEFAULT \'["mobil"]\''
      );
      console.log('✅ Column added successfully');
      
      // Update all areas with appropriate types
      await connection.execute(
        'UPDATE tb_arf SET jenis_parkir_yang_didukung = ? WHERE nama_area LIKE ?',
        [JSON.stringify(['motor']), '%Motor%']
      );
      
      await connection.execute(
        'UPDATE tb_arf SET jenis_parkir_yang_didukung = ? WHERE nama_area LIKE ?',
        [JSON.stringify(['mobil']), '%Mobil%']
      );
      
      await connection.execute(
        'UPDATE tb_arf SET jenis_parkir_yang_didukung = ? WHERE nama_area LIKE ?',
        [JSON.stringify(['motor', 'mobil']), '%VIP%']
      );
      
      console.log('✅ Updated area types');
    } else {
      console.log('\n✅ Column "jenis_parkir_yang_didukung" exists');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkArf();
