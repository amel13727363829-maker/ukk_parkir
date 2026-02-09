const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kendaraan = sequelize.define('Kendaraan', {
  id_kendaraan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  no_polisi: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  jenis_kendaraan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  warna: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  tahun_pembuatan: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tipe_kendaraan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'm_kendaraan',
  timestamps: true,
  underscored: true,
});

module.exports = Kendaraan;
