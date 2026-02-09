const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  no_telepon: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'operator', 'manager', 'owner', 'petugas'),
    defaultValue: 'operator',
  },
  status_aktif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'm_user',
  timestamps: true,
  underscored: false,
});

module.exports = User;
