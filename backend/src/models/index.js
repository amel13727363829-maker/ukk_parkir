const User = require('./User');
const Kendaraan = require('./Kendaraan');
const JenisParkir = require('./JenisParkir');
const TarifParkir = require('./TarifParkir');
const Arf = require('./Arf');
const Transaksi = require('./Transaksi');
const LogAktivitas = require('./LogAktivitas');
const sequelize = require('../config/database');

// Model associations
const models = {
  User,
  Kendaraan,
  JenisParkir,
  TarifParkir,
  Arf,
  Transaksi,
  LogAktivitas,
  sequelize,
};

module.exports = models;
