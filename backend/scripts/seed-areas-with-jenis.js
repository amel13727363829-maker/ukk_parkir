const db = require('../src/models');

const seedAreasWithJenis = async () => {
  try {
    console.log('🌱 Starting parking areas seeding with jenis parkir...');

    // Get parking types that already exist
    const jenisParkir = await db.JenisParkir.findAll();
    
    if (jenisParkir.length === 0) {
      console.log('Creating parking types first...');
      await db.JenisParkir.create({
        nama_jenis: 'Parkir Mobil',
        deskripsi: 'Area parkir untuk mobil penumpang',
      });
      await db.JenisParkir.create({
        nama_jenis: 'Parkir Motor',
        deskripsi: 'Area parkir untuk sepeda motor',
      });
    }

    // Clear existing areas
    await db.Arf.destroy({ where: {} });
    console.log('✅ Cleared existing parking areas');

    // Create parking areas with jenis_parkir_yang_didukung
    const areas = [
      {
        nama_area: 'Area A - Lantai 1',
        kapasitas: 50,
        jenis_parkir_yang_didukung: ['motor', 'mobil'],
        status: 'aktif',
      },
      {
        nama_area: 'Area B - Lantai 2',
        kapasitas: 50,
        jenis_parkir_yang_didukung: ['motor', 'mobil'],
        status: 'aktif',
      },
      {
        nama_area: 'Area C - Lantai 3',
        kapasitas: 40,
        jenis_parkir_yang_didukung: ['motor', 'mobil'],
        status: 'aktif',
      },
      {
        nama_area: 'Area D - Outdoor',
        kapasitas: 100,
        jenis_parkir_yang_didukung: ['motor', 'mobil'],
        status: 'aktif',
      },
      {
        nama_area: 'Area E - VIP',
        kapasitas: 20,
        jenis_parkir_yang_didukung: ['mobil'],
        status: 'aktif',
      },
    ];

    for (const area of areas) {
      await db.Arf.create(area);
      console.log(`✅ Created: ${area.nama_area}`);
    }

    console.log('\n✨ Parking areas seeding completed!');
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedAreasWithJenis();
