#!/usr/bin/env node

/**
 * Migration script: Add harga_awal column to m_jenis_parkir table
 * Run: node scripts/migrate-add-harga-awal.js
 */

const sequelize = require('../src/config/database');

async function migrate() {
  try {
    console.log('\n🔄 Migrating: Adding harga_awal column to m_jenis_parkir...\n');

    // Check if column exists
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('m_jenis_parkir');

    if (columns.harga_awal) {
      console.log('ℹ️  Column harga_awal already exists, skipping...\n');
      process.exit(0);
    }

    // Add column
    await queryInterface.addColumn('m_jenis_parkir', 'harga_awal', {
      type: require('sequelize').DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Tarif awal/entry dalam Rupiah',
    });

    console.log('✅ Column harga_awal added successfully!');

    // Verify
    const updatedColumns = await queryInterface.describeTable('m_jenis_parkir');
    console.log('\n📋 Updated table structure:');
    Object.keys(updatedColumns).forEach((col) => {
      console.log(`   - ${col}`);
    });

    console.log('\n✨ Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrate();
