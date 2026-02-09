const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('🔧 Setting up database...\n');

    // First connection (without database selection) to create database
    const setupConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });

    console.log('1️⃣  Creating database if not exists...');
    await setupConnection.execute('CREATE DATABASE IF NOT EXISTS parkir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database created/verified\n');

    await setupConnection.end();

    // Second connection (with database selection) to run schema
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    console.log('2️⃣  Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by ; and execute each statement
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.execute(statements[i]);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (err) {
        // Ignore duplicate errors for existing tables
        if (!err.message.includes('already exists')) {
          console.error(`❌ Statement ${i + 1} failed:`, err.message);
        }
      }
    }

    console.log('\n3️⃣  Verifying tables...');
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='parkir_db'"
    );

    console.log(`✅ Database has ${tables.length} tables:\n`);
    tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));

    await connection.end();
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  }
})();
