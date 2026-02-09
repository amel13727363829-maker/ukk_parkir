#!/usr/bin/env node

/**
 * Script to update Jenis Parkir harga_awal values
 * Run: node scripts/update-jenis-harga-awal.js
 */

const sequelize = require('../src/config/database');
const { JenisParkir } = require('../src/models');

const updates = [
  { nama_jenis: 'Parkir Motor', harga_awal: 2000 },
  { nama_jenis: 'Parkir Mobil', harga_awal: 5000 },
  { nama_jenis: 'Parkir VIP', harga_awal: 50000 },
  { nama_jenis: 'Parkir Mobil Muatan', harga_awal: 10000 },
];

async function updateHargaAwal() {
  try {
    console.log('\n🔄 Starting Jenis Parkir Harga Awal Update...\n');

    for (const update of updates) {
      const jenis = await JenisParkir.findOne({
        where: { nama_jenis: update.nama_jenis },
        raw: false,
      });

      if (jenis) {
        const oldHarga = jenis.harga_awal || 0;
        jenis.harga_awal = update.harga_awal;
        await jenis.save();
        console.log(
          `✅ ${update.nama_jenis}: Rp ${oldHarga.toLocaleString('id-ID')} → Rp ${update.harga_awal.toLocaleString('id-ID')}`
        );
      } else {
        console.log(`⚠️  ${update.nama_jenis}: NOT FOUND (skipped)`);
      }
    }

    console.log('\n📋 Final State:\n');
    const allJenis = await JenisParkir.findAll({
      order: [['id_jenis_parkir', 'ASC']],
      raw: true,
    });

    allJenis.forEach((jenis) => {
      console.log(
        `   ${jenis.id_jenis_parkir}. ${jenis.nama_jenis}`
      );
      console.log(
        `       • Tarif Awal: Rp ${(jenis.harga_awal || 0).toLocaleString('id-ID')}`
      );
      console.log(
        `       • Tarif/Jam: Rp ${(jenis.harga_per_jam || 0).toLocaleString('id-ID')}`
      );
      console.log(
        `       • Kapasitas: ${jenis.kapasitas || 0} slot\n`
      );
    });

    console.log('✨ Update completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating harga awal:', error.message);
    process.exit(1);
  }
}

updateHargaAwal();
