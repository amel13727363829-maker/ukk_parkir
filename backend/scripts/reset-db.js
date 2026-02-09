const db = require('../src/models');

const resetDB = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Disable foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    
    // Truncate all tables
    await db.sequelize.query('TRUNCATE TABLE `transaksi`');
    await db.sequelize.query('TRUNCATE TABLE `m_kendaraan`');
    await db.sequelize.query('TRUNCATE TABLE `tb_arf`');
    await db.sequelize.query('TRUNCATE TABLE `m_tarif_parkir`');
    await db.sequelize.query('TRUNCATE TABLE `m_jenis_parkir`');
    await db.sequelize.query('TRUNCATE TABLE `tb_log_aktivitas`');
    await db.sequelize.query('TRUNCATE TABLE `m_user`');
    
    // Re-enable foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    
    console.log('✅ Database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDB();
