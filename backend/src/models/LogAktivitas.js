const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const LogAktivitas = sequelize.define('LogAktivitas', {
  id_log: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id_user',
    },
  },
  deskripsi_aksi: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  waktu_aksi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tb_log_aktivitas',
  timestamps: false,
  underscored: true,
});

LogAktivitas.belongsTo(User, {
  foreignKey: 'id_user',
  targetKey: 'id_user',
});

User.hasMany(LogAktivitas, {
  foreignKey: 'id_user',
  sourceKey: 'id_user',
});

module.exports = LogAktivitas;
