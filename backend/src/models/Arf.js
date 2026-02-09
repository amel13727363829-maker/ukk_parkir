const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Arf = sequelize.define('Arf', {
  id_arf: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_area: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  kapasitas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  jenis_parkir_yang_didukung: {
    type: DataTypes.JSON,
    defaultValue: ['mobil'],
    comment: 'Array of supported parking types: motor, mobil, truk, bus',
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'aktif',
  },
}, {
  tableName: 'tb_arf',
  timestamps: true,
  underscored: true,
});

module.exports = Arf;
