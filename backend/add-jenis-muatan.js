const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('🔍 Checking existing jenis parkir...');
    const [rows] = await connection.execute("SELECT id_jenis_parkir, nama_jenis FROM m_jenis_parkir WHERE nama_jenis = ?", ['Parkir Mobil Muatan Khusus']);

    if (rows.length === 0) {
      console.log('➕ Inserting new jenis parkir: Parkir Mobil Muatan Khusus');
      const [res] = await connection.execute(
        "INSERT INTO m_jenis_parkir (nama_jenis, deskripsi, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        ['Parkir Mobil Muatan Khusus', 'Parkir untuk mobil muatan khusus']
      );
      const newId = res.insertId;
      console.log(`✅ Inserted with id_jenis_parkir = ${newId}`);
    } else {
      console.log('⚠️ Jenis parkir sudah ada:', rows[0].nama_jenis);
    }

    // Update Area Outdoor to include support for mobil muatan khusus
    console.log('\n🔁 Updating Area Outdoor support list...');
    const [areas] = await connection.execute("SELECT id_arf, nama_area, jenis_parkir_yang_didukung FROM tb_arf WHERE nama_area LIKE '%Outdoor%'");
    if (areas.length === 0) {
      console.log('❌ Area Outdoor not found');
    } else {
      for (const a of areas) {
        let supported = [];
        if (Array.isArray(a.jenis_parkir_yang_didukung)) supported = a.jenis_parkir_yang_didukung;
        else if (a.jenis_parkir_yang_didukung) {
          try { supported = JSON.parse(a.jenis_parkir_yang_didukung); } catch(e) { supported = []; }
        }

        // Ensure 'mobil' is present and add a specific tag 'mobil_muatan_khusus'
        if (!supported.includes('mobil')) supported.push('mobil');
        if (!supported.includes('mobil_muatan_khusus')) supported.push('mobil_muatan_khusus');

        await connection.execute('UPDATE tb_arf SET jenis_parkir_yang_didukung = ? WHERE id_arf = ?', [JSON.stringify(supported), a.id_arf]);
        console.log(`✅ Area '${a.nama_area}' (ID ${a.id_arf}) updated: ${JSON.stringify(supported)}`);
      }
    }

    // Show final list
    console.log('\n📋 Final jenis parkir:');
    const [jenis] = await connection.execute('SELECT id_jenis_parkir, nama_jenis, deskripsi FROM m_jenis_parkir');
    console.table(jenis);

    console.log('\n📋 Final areas:');
    const [finalAreas] = await connection.execute('SELECT id_arf, nama_area, jenis_parkir_yang_didukung FROM tb_arf');
    for (const fa of finalAreas) {
      let j = fa.jenis_parkir_yang_didukung;
      try { if (typeof j === 'string') j = JSON.parse(j); } catch(e) {}
      console.log(`- ${fa.nama_area} => ${JSON.stringify(j)}`);
    }

    await connection.end();
    console.log('\n✅ Done');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
