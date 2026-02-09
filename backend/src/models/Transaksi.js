const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Kendaraan = require('./Kendaraan');
const JenisParkir = require('./JenisParkir');
const Arf = require('./Arf');

const Transaksi = sequelize.define('Transaksi', {
  id_transaksi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_kendaraan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Kendaraan,
      key: 'id_kendaraan',
    },
  },
  id_jenis_parkir: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: JenisParkir,
      key: 'id_jenis_parkir',
    },
  },
  id_arf: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Arf,
      key: 'id_arf',
    },
  },
  waktu_masuk: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  waktu_keluar: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lama_parkir: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durasi dalam menit',
  },
  tarif_parkir: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  total_bayar: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  metode_pembayaran: {
    type: DataTypes.ENUM('tunai', 'qris'),
    allowNull: true,
  },
  status_pembayaran: {
    type: DataTypes.ENUM('belum_bayar', 'lunas', 'paid', 'unpaid', 'pending'),
    defaultValue: 'belum_bayar',
  },
}, {
  tableName: 'transaksi',
  timestamps: true,
  underscored: true,
});

Transaksi.belongsTo(Kendaraan, {
  foreignKey: 'id_kendaraan',
  targetKey: 'id_kendaraan',
});

Transaksi.belongsTo(JenisParkir, {
  foreignKey: 'id_jenis_parkir',
  targetKey: 'id_jenis_parkir',
});

Transaksi.belongsTo(Arf, {
  foreignKey: 'id_arf',
  targetKey: 'id_arf',
});

Kendaraan.hasMany(Transaksi, {
  foreignKey: 'id_kendaraan',
  sourceKey: 'id_kendaraan',
});

JenisParkir.hasMany(Transaksi, {
  foreignKey: 'id_jenis_parkir',
  sourceKey: 'id_jenis_parkir',
});

Arf.hasMany(Transaksi, {
  foreignKey: 'id_arf',
  sourceKey: 'id_arf',
});

module.exports = Transaksi;
