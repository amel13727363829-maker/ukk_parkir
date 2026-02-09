const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // First, create database if it doesn't exist
    const sequelizeAdmin = new Sequelize(
      'mysql',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
      }
    );

    try {
      await sequelizeAdmin.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'parkir_db'}\` 
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log('✅ Database created/verified');
    } catch (error) {
      console.log('ℹ️  Database already exists');
    } finally {
      await sequelizeAdmin.close();
    }

    // Now connect to the actual database
    const db = require('../src/models');

    // Sync database with models
    await db.sequelize.sync({ alter: false });
    console.log('✅ Database synced');

    // Check if data already exists
    const userCount = await db.User.count();
    if (userCount > 0) {
      console.log('⚠️  Database already seeded. Skipping...');
      await db.sequelize.close();
      process.exit(0);
    }

    // Create admin user with hashed password
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.User.create({
      username: 'admin',
      password: adminPassword,
      nama_lengkap: 'Administrator',
      email: 'admin@parkir.app',
      no_telepon: '081234567890',
      role: 'admin',
      status_aktif: true,
    });

    const operatorPassword = await bcrypt.hash('password', 10);
    await db.User.create({
      username: 'petugas2',
      password: operatorPassword,
      nama_lengkap: 'Petugas 2',
      email: 'petugas2@parkir.app',
      no_telepon: '081234567891',
      role: 'operator',
      status_aktif: true,
    });

    const managerPassword = await bcrypt.hash('123456', 10);
    await db.User.create({
      username: 'owner',
      password: managerPassword,
      nama_lengkap: 'Owner',
      email: 'owner@parkir.app',
      no_telepon: '081234567892',
      role: 'manager',
      status_aktif: true,
    });

    console.log('✅ Users created');

    // Create parking types
    const parkirMobil = await db.JenisParkir.create({
      nama_jenis: 'Parkir Mobil',
      deskripsi: 'Area parkir untuk mobil penumpang',
    });

    const parkirMotor = await db.JenisParkir.create({
      nama_jenis: 'Parkir Motor',
      deskripsi: 'Area parkir untuk sepeda motor',
    });

    const parkirTruk = await db.JenisParkir.create({
      nama_jenis: 'Parkir Truk',
      deskripsi: 'Area parkir untuk truk dan kendaraan besar',
    });

    const parkirBus = await db.JenisParkir.create({
      nama_jenis: 'Parkir Bus',
      deskripsi: 'Area parkir khusus untuk bus',
    });

    console.log('✅ Parking types created');

    // Create pricing for each parking type
    await db.TarifParkir.create({
      id_jenis_parkir: parkirMobil.id_jenis_parkir,
      tarif_per_jam: 5000,
      tarif_per_hari: 30000,
      tarif_bulanan: 400000,
      status: 'aktif',
    });

    await db.TarifParkir.create({
      id_jenis_parkir: parkirMotor.id_jenis_parkir,
      tarif_per_jam: 2000,
      tarif_per_hari: 15000,
      tarif_bulanan: 200000,
      status: 'aktif',
    });

    await db.TarifParkir.create({
      id_jenis_parkir: parkirTruk.id_jenis_parkir,
      tarif_per_jam: 10000,
      tarif_per_hari: 60000,
      tarif_bulanan: 800000,
      status: 'aktif',
    });

    await db.TarifParkir.create({
      id_jenis_parkir: parkirBus.id_jenis_parkir,
      tarif_per_jam: 15000,
      tarif_per_hari: 100000,
      tarif_bulanan: 1200000,
      status: 'aktif',
    });

    console.log('✅ Pricing tiers created');

    // Create parking areas
    await db.Arf.create({
      nama_area: 'Area Motor Depan',
      kapasitas: 100,
      status: 'aktif',
    });

    await db.Arf.create({
      nama_area: 'Area Mobil Basement',
      kapasitas: 80,
      status: 'aktif',
    });

    console.log('✅ Parking areas created');

    // Create sample vehicles
    await db.Kendaraan.create({
      no_polisi: 'B 1234 ABC',
      jenis_kendaraan: 'mobil',
      warna: 'Putih',
      tahun_pembuatan: 2022,
      tipe_kendaraan: 'Toyota Avanza',
      pemilik_nama: 'Budi Santoso',
      pemilik_no_telepon: '081234567890',
    });

    await db.Kendaraan.create({
      no_polisi: 'B 5678 DEF',
      jenis_kendaraan: 'motor',
      warna: 'Hitam',
      tahun_pembuatan: 2023,
      tipe_kendaraan: 'Honda Vario',
      pemilik_nama: 'Ahmad Riyana',
      pemilik_no_telepon: '081234567891',
    });

    await db.Kendaraan.create({
      no_polisi: 'B 9012 GHI',
      jenis_kendaraan: 'mobil',
      warna: 'Silver',
      tahun_pembuatan: 2021,
      tipe_kendaraan: 'Daihatsu Xenia',
      pemilik_nama: 'Siti Nurhaliza',
      pemilik_no_telepon: '081234567892',
    });

    console.log('✅ Sample vehicles created');

    // Create activity log entry
    const admin = await db.User.findOne({ where: { role: 'admin' } });
    await db.LogAktivitas.create({
      id_user: admin.id_user,
      deskripsi_aksi: 'Database initialized and seeded with initial data',
    });

    console.log('✅ Activity log created');

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Operator: operator1 / operator123');
    console.log('   Manager: manager1 / manager123');

    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding
seed();
