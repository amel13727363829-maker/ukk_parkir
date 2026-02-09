const mysql = require('mysql2/promise');
const axios = require('axios');

(async () => {
  try {
    console.log('🧪 Testing Login Flow\n');
    console.log('=' .repeat(50) + '\n');

    // Test 1: Check admin user exists
    console.log('1️⃣  Checking admin user in database...\n');
    
    const dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });

    const [users] = await dbConnection.execute(
      'SELECT id_user, username, nama_lengkap, role FROM m_user WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      console.log('✅ Admin user found in database:');
      console.table(users);
    } else {
      console.log('❌ Admin user not found!');
    }

    await dbConnection.end();

    console.log('\n' + '=' .repeat(50) + '\n');

    // Test 2: Try login via API
    console.log('2️⃣  Testing login via API...\n');
    console.log('Request:');
    console.log('  POST http://localhost:5001/api/v1/auth/login');
    console.log('  Body: { username: "admin", password: "admin123" }\n');

    try {
      const response = await axios.post('http://localhost:5001/api/v1/auth/login', {
        username: 'admin',
        password: 'admin123'
      });

      console.log('✅ Login SUCCESS!\n');
      console.log('Response:');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.success && response.data.data.token) {
        console.log('\n✅ Token received! Ready to use in frontend.');
      }

    } catch (err) {
      console.log('❌ Login FAILED\n');
      if (err.response) {
        console.log('Status:', err.response.status);
        console.log('Error Response:');
        console.log(JSON.stringify(err.response.data, null, 2));
      } else {
        console.log('Error:', err.message);
      }
    }

    console.log('\n' + '=' .repeat(50));

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
