const sequelize = require('../src/config/database');
const { Arf } = require('../src/models');

async function updateAreaParkir() {
  try {
    // Update Area Mobil Basement untuk support mobil dan motor
    await Arf.update(
      { jenis_parkir_yang_didukung: ['mobil', 'motor'] },
      { where: { nama_area: 'Area Mobil Basement' } }
    );
    
    console.log('✅ Area Mobil Basement updated to support both mobil and motor');
    
    // Jika ingin update area lain juga
    // Motor area support motor
    await Arf.update(
      { jenis_parkir_yang_didukung: ['motor'] },
      { where: { nama_area: { [sequelize.Op.like]: '%Motor%' } } }
    );
    
    console.log('✅ All motor areas updated');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating areas:', error);
    process.exit(1);
  }
}

updateAreaParkir();
