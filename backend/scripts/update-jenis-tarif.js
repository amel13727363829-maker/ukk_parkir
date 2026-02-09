#!/usr/bin/env node

/**
 * Script to update Jenis Parkir harga_per_jam values
 * Run: node scripts/update-jenis-tarif.js
 */

const sequelize = require('../src/config/database');
const { JenisParkir } = require('../src/models');

const updates = [
  { nama_jenis: 'Parkir Motor', harga_per_jam: 1000 },
  { nama_jenis: 'Parkir Mobil', harga_per_jam: 2000 },
  { nama_jenis: 'Parkir VIP', harga_per_jam: 10000 },
  { nama_jenis: 'Parkir Mobil Muatan', harga_per_jam: 10000 },
];

async function updateJenisTarif() {
  try {
    console.log('\n🔄 Starting Jenis Parkir Tarif Update...\n');

    for (const update of updates) {
      const jenis = await JenisParkir.findOne({
        where: { nama_jenis: update.nama_jenis },
        raw: false,
      });

      if (jenis) {
        const oldTarif = jenis.harga_per_jam || 0;
        jenis.harga_per_jam = update.harga_per_jam;
        await jenis.save();
        console.log(
          `✅ ${update.nama_jenis}: Rp ${oldTarif.toLocaleString('id-ID')} → Rp ${update.harga_per_jam.toLocaleString('id-ID')}/jam`
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
        `   ${jenis.id_jenis_parkir}. ${jenis.nama_jenis} — Rp ${(jenis.harga_per_jam || 0).toLocaleString('id-ID')}/jam | ${jenis.kapasitas || 0} slot`
      );
    });

    console.log('\n✨ Update completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating jenis tarif:', error.message);
    process.exit(1);
  }
}

updateJenisTarif();
