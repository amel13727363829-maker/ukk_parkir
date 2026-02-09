const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const JenisParkir = require('./JenisParkir');

const TarifParkir = sequelize.define('TarifParkir', {
  id_tarif: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_jenis_parkir: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: JenisParkir,
      key: 'id_jenis_parkir',
    },
  },
  tarif_per_jam: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tarif_per_hari: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tarif_bulanan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  tableName: 'm_tarif_parkir',
  timestamps: true,
  underscored: true,
});

TarifParkir.belongsTo(JenisParkir, {
  foreignKey: 'id_jenis_parkir',
  targetKey: 'id_jenis_parkir',
});

JenisParkir.hasMany(TarifParkir, {
  foreignKey: 'id_jenis_parkir',
  sourceKey: 'id_jenis_parkir',
});

module.exports = TarifParkir;
