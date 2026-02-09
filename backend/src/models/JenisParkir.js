const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JenisParkir = sequelize.define('JenisParkir', {
  id_jenis_parkir: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_jenis: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  kapasitas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  harga_per_jam: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Tarif per jam dalam Rupiah',
  },
  harga_awal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Tarif awal/entry dalam Rupiah',
  },
}, {
  tableName: 'm_jenis_parkir',
  timestamps: true,
  underscored: true,
});

module.exports = JenisParkir;
