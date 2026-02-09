const db = require('../src/models');

async function ensureMobilAreas() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    const areas = [
      {
        nama_area: 'Area Mobil Depan',
        kapasitas: 50,
        jenis_parkir_yang_didukung: ['mobil'],
        status: 'aktif',
      },
      {
        nama_area: 'Area Mobil Basement',
        kapasitas: 80,
        jenis_parkir_yang_didukung: ['mobil'],
        status: 'aktif',
      },
    ];

    for (const a of areas) {
      const existing = await db.Arf.findOne({ where: { nama_area: a.nama_area } });
      if (existing) {
        existing.kapasitas = a.kapasitas;
        existing.jenis_parkir_yang_didukung = a.jenis_parkir_yang_didukung;
        existing.status = a.status;
        await existing.save();
        console.log('Updated:', a.nama_area);
      } else {
        await db.Arf.create(a);
        console.log('Created:', a.nama_area);
      }
    }

    const all = await db.Arf.findAll({ order: [['id_arf', 'ASC']] });
    console.log('\nCurrent parking areas:');
    all.forEach(ar => console.log('-', ar.nama_area, JSON.stringify(ar.jenis_parkir_yang_didukung)));

    await db.sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error ensuring mobil areas:', err);
    process.exit(1);
  }
}

ensureMobilAreas();
