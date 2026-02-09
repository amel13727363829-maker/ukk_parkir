const sequelize = require('../src/config/database');

async function setDefaults() {
  try {
    await sequelize.query(`
      UPDATE tb_arf 
      SET jenis_parkir_yang_didukung = '["mobil"]'
      WHERE jenis_parkir_yang_didukung IS NULL
    `);
    console.log('✅ Default values set for all areas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setDefaults();
