#!/usr/bin/env node

/**
 * Script untuk update kapasitas jenis parkir sesuai data terbaru
 */

const db = require('../src/config/database');

const kapasitasUpdate = [
  { nama_jenis: 'Parkir Mobil Muatan', kapasitas: 81 },
  { nama_jenis: 'Parkir VIP', kapasitas: 90 },
  { nama_jenis: 'Parkir Motor', kapasitas: 150 },
  { nama_jenis: 'Parkir Mobil', kapasitas: 129 },
];

async function updateKapasitas() {
  try {
    console.log('🔄 Mulai update kapasitas jenis parkir...');

    for (const update of kapasitasUpdate) {
      const [rows] = await db.query(
        'UPDATE m_jenis_parkir SET kapasitas = ? WHERE nama_jenis = ?',
        [update.kapasitas, update.nama_jenis]
      );

      if (rows.affectedRows > 0) {
        console.log(`✅ ${update.nama_jenis}: updated to ${update.kapasitas} slot`);
      } else {
        console.warn(`⚠️ ${update.nama_jenis}: not found, inserting...`);
        // If not found, insert it
        await db.query(
          'INSERT INTO m_jenis_parkir (nama_jenis, deskripsi, kapasitas) VALUES (?, ?, ?)',
          [update.nama_jenis, update.nama_jenis, update.kapasitas]
        );
        console.log(`✅ ${update.nama_jenis}: inserted with ${update.kapasitas} slot`);
      }
    }

    // Verify hasil
    const [results] = await db.query('SELECT id_jenis_parkir, nama_jenis, kapasitas FROM m_jenis_parkir');
    console.log('\n📋 Final state:');
    results.forEach((row) => {
      console.log(`  - ${row.nama_jenis}: ${row.kapasitas} slot`);
    });

    console.log('\n✅ Update kapasitas selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateKapasitas();
