const sequelize = require('../src/config/database');

async function addColumn() {
  try {
    // Add column jenis_parkir_yang_didukung to tb_arf
    await sequelize.query(`
      ALTER TABLE tb_arf 
      ADD COLUMN jenis_parkir_yang_didukung JSON 
      COMMENT 'Array of supported parking types: motor, mobil, truk, bus'
    `);
    
    console.log('✅ Column jenis_parkir_yang_didukung added to tb_arf');
    
    // Update Area Mobil Basement untuk support mobil dan motor
    await sequelize.query(`
      UPDATE tb_arf 
      SET jenis_parkir_yang_didukung = '["mobil", "motor"]'
      WHERE nama_area = 'Area Mobil Basement'
    `);
    
    console.log('✅ Area Mobil Basement updated to support both mobil and motor');
    
    process.exit(0);
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ Column already exists, skipping creation');
      // Proceed to update anyway
      await sequelize.query(`
        UPDATE tb_arf 
        SET jenis_parkir_yang_didukung = '["mobil", "motor"]'
        WHERE nama_area = 'Area Mobil Basement'
      `);
      console.log('✅ Area Mobil Basement updated');
      process.exit(0);
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

addColumn();
