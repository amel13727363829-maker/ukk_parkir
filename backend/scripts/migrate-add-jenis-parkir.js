const sequelize = require('../src/config/database');
const Arf = require('../src/models/Arf');

async function addJenisParkirColumn() {
  try {
    console.log('Starting database migration...');

    // Sync database with model (will add missing columns)
    await sequelize.sync({ alter: true });
    console.log('✓ Database synchronized');

    // Get all areas and update with default jenis_parkir_yang_didukung
    const areas = await Arf.findAll();
    console.log(`Found ${areas.length} areas`);

    for (const area of areas) {
      if (!area.jenis_parkir_yang_didukung || 
          (typeof area.jenis_parkir_yang_didukung === 'string' && 
           area.jenis_parkir_yang_didukung === '["mobil"]')) {
        // Set both motor and mobil as default
        area.jenis_parkir_yang_didukung = ['motor', 'mobil'];
        await area.save();
        console.log(`✓ Updated ${area.nama_area}`);
      }
    }

    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

addJenisParkirColumn();
