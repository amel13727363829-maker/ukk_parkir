#!/usr/bin/env node

/**
 * Script to update Area Parkir (ARF) kapasitas values
 * Run: node scripts/update-arf-kapasitas.js
 */

const sequelize = require('../src/config/database');
const { Arf } = require('../src/models');

const updates = [
  { nama_area: 'Area Motor Depan', kapasitas: 150 },
  { nama_area: 'Area Mobil Basement', kapasitas: 129 },
  { nama_area: 'Area VIP', kapasitas: 90 },
  { nama_area: 'Area Outdoor', kapasitas: 81 },
];

async function updateArfKapasitas() {
  try {
    console.log('\n🔄 Starting ARF Kapasitas Update...\n');

    for (const update of updates) {
      const area = await Arf.findOne({
        where: { nama_area: update.nama_area },
        raw: false,
      });

      if (area) {
        const oldCapacity = area.kapasitas;
        area.kapasitas = update.kapasitas;
        await area.save();
        console.log(
          `✅ ${update.nama_area}: ${oldCapacity} → ${update.kapasitas} slot`
        );
      } else {
        console.log(`⚠️  ${update.nama_area}: NOT FOUND (skipped)`);
      }
    }

    console.log('\n📋 Final State:\n');
    const allAreas = await Arf.findAll({
      where: { status: 'aktif' },
      order: [['id_arf', 'ASC']],
      raw: true,
    });

    allAreas.forEach((area) => {
      console.log(
        `   ${area.id_arf}. ${area.nama_area} — ${area.kapasitas} slot`
      );
    });

    console.log('\n✨ Update completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating ARF kapasitas:', error.message);
    process.exit(1);
  }
}

updateArfKapasitas();
