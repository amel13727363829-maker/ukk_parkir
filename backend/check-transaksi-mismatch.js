const mysql = require('mysql2/promise');

async function checkTransaksiMismatch() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('🔍 CHECKING TRANSAKSI MISMATCH\n');
    console.log('='.repeat(60));

    // 1. Total vehicles recorded
    const [vehicleCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM m_kendaraan'
    );
    console.log('\n📊 TOTAL KENDARAAN TERCATAT:');
    console.log(`   ${vehicleCount[0].total} kendaraan`);

    // 2. Total transactions
    const [transactionCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM transaksi'
    );
    console.log('\n📊 TOTAL TRANSAKSI:');
    console.log(`   ${transactionCount[0].total} transaksi`);

    // 3. Vehicles currently parked (check-in without check-out)
    const [currentlyParked] = await connection.execute(
      'SELECT COUNT(*) as total FROM transaksi WHERE waktu_keluar IS NULL'
    );
    console.log('\n🅿️ KENDARAAN YANG MASIH PARKIR (Belum Keluar):');
    console.log(`   ${currentlyParked[0].total} kendaraan`);

    // 4. Detailed vehicles currently parked
    const [parkedDetails] = await connection.execute(`
      SELECT 
        t.id_transaksi,
        k.no_polisi,
        k.jenis_kendaraan,
        jp.nama_jenis,
        a.nama_area,
        t.waktu_masuk
      FROM transaksi t
      JOIN m_kendaraan k ON t.id_kendaraan = k.id_kendaraan
      JOIN m_jenis_parkir jp ON t.id_jenis_parkir = jp.id_jenis_parkir
      JOIN tb_arf a ON t.id_arf = a.id_arf
      WHERE t.waktu_keluar IS NULL
      ORDER BY t.waktu_masuk DESC
    `);

    if (parkedDetails.length > 0) {
      console.log('\n📋 DETAIL KENDARAAN YANG MASIH PARKIR:');
      console.table(parkedDetails);
    }

    // 5. Check for vehicles without transactions
    const [orphanVehicles] = await connection.execute(`
      SELECT 
        k.id_kendaraan,
        k.no_polisi,
        k.jenis_kendaraan,
        COUNT(t.id_transaksi) as jumlah_transaksi
      FROM m_kendaraan k
      LEFT JOIN transaksi t ON k.id_kendaraan = t.id_kendaraan
      WHERE t.id_transaksi IS NULL
      GROUP BY k.id_kendaraan, k.no_polisi, k.jenis_kendaraan
    `);

    console.log('\n⚠️ KENDARAAN TANPA TRANSAKSI:');
    if (orphanVehicles.length > 0) {
      console.log(`   ${orphanVehicles.length} kendaraan tanpa transaksi`);
      console.table(orphanVehicles);
    } else {
      console.log('   Semua kendaraan memiliki transaksi');
    }

    // 6. All vehicles detail
    console.log('\n🚗 SEMUA KENDARAAN DENGAN STATUS TRANSAKSI:');
    const [allVehicles] = await connection.execute(`
      SELECT 
        k.id_kendaraan,
        k.no_polisi,
        k.jenis_kendaraan,
        COALESCE(COUNT(DISTINCT t.id_transaksi), 0) as total_transaksi,
        SUM(CASE WHEN t.waktu_keluar IS NULL THEN 1 ELSE 0 END) as masih_parkir
      FROM m_kendaraan k
      LEFT JOIN transaksi t ON k.id_kendaraan = t.id_kendaraan
      GROUP BY k.id_kendaraan, k.no_polisi, k.jenis_kendaraan
      ORDER BY k.id_kendaraan
    `);

    console.table(allVehicles);

    console.log('\n' + '='.repeat(60));
    
    // Summary
    console.log('\n📊 RINGKASAN MASALAH:');
    console.log(`   Total kendaraan: ${vehicleCount[0].total}`);
    console.log(`   Total transaksi: ${transactionCount[0].total}`);
    console.log(`   Selisih: ${vehicleCount[0].total - transactionCount[0].total} (kendaraan tanpa transaksi)`);
    console.log(`   Kendaraan masih parkir: ${currentlyParked[0].total}`);
    
    if (orphanVehicles.length > 0) {
      console.log(`\n⚠️ PERLU DITAMBAHKAN TRANSAKSI UNTUK ${orphanVehicles.length} KENDARAAN INI:`);
      orphanVehicles.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.no_polisi} (${v.jenis_kendaraan})`);
      });
    }

    console.log('\n✅ ANALISIS SELESAI\n');

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTransaksiMismatch();
