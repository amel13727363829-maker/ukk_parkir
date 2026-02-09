const http = require('http');
const mysql = require('mysql2/promise');

async function diagnoseLogin() {
  console.log('\n🔍 LOGIN DIAGNOSIS COMPLETE\n');
  console.log('='.repeat(70));

  // 1. Check Backend Server
  console.log('\n1️⃣ BACKEND SERVER CHECK');
  console.log('-'.repeat(70));
  
  const backendTest = await new Promise((resolve) => {
    const req = http.get('http://localhost:5001/api/v1/health', (res) => {
      resolve(res.statusCode === 200 || true);
    }).on('error', () => {
      resolve(false);
    });
  });

  if (backendTest) {
    console.log('✅ Backend server RUNNING on :5001');
  } else {
    console.log('❌ Backend server NOT RUNNING on :5001');
  }

  // 2. Check Database Connection
  console.log('\n2️⃣ DATABASE CONNECTION CHECK');
  console.log('-'.repeat(70));

  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'parkir_db'
    });
    console.log('✅ Database connection SUCCESS');

    // 3. Check Admin User
    console.log('\n3️⃣ ADMIN USER CHECK');
    console.log('-'.repeat(70));

    const [users] = await connection.execute(
      'SELECT id_user, username, nama_lengkap, role, status_aktif, email FROM m_user WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Admin user FOUND');
      console.log(`   ID: ${user.id_user}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Nama: ${user.nama_lengkap}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status Aktif: ${user.status_aktif ? '✅ YES' : '❌ NO'}`);
      console.log(`   Email: ${user.email}`);

      if (!user.status_aktif) {
        console.log('\n⚠️ WARNING: Admin user is INACTIVE!');
      }
    } else {
      console.log('❌ Admin user NOT FOUND');
    }

    // 4. All Users Check
    console.log('\n4️⃣ ALL USERS IN DATABASE');
    console.log('-'.repeat(70));

    const [allUsers] = await connection.execute(
      'SELECT id_user, username, nama_lengkap, role, status_aktif FROM m_user ORDER BY id_user'
    );

    if (allUsers.length > 0) {
      console.log(`Found ${allUsers.length} user(s):\n`);
      console.table(allUsers);
    } else {
      console.log('❌ NO USERS IN DATABASE!');
    }

    await connection.end();

  } catch (error) {
    console.log('❌ Database error:', error.message);
  }

  // 5. API Test
  console.log('\n5️⃣ API LOGIN TEST');
  console.log('-'.repeat(70));

  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const testLoginAPI = await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: json
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  });

  if (testLoginAPI.error) {
    console.log('❌ API Connection Error:', testLoginAPI.error);
  } else if (testLoginAPI.status === 200 && testLoginAPI.data?.success) {
    console.log('✅ API Login TEST SUCCESS');
    console.log(`   Status: ${testLoginAPI.status}`);
    console.log(`   Token: ${testLoginAPI.data.data.token ? '✅ GENERATED' : '❌ NOT GENERATED'}`);
    console.log(`   User: ${testLoginAPI.data.data.user?.username}`);
  } else {
    console.log('❌ API Login TEST FAILED');
    console.log(`   Status: ${testLoginAPI.status}`);
    console.log(`   Response:`, testLoginAPI.data);
  }

  // 6. Frontend Check
  console.log('\n6️⃣ FRONTEND STATUS');
  console.log('-'.repeat(70));
  console.log('ℹ️ Frontend running on: http://localhost:3000');
  console.log('ℹ️ Login page: http://localhost:3000/login');
  console.log('ℹ️ Diagnostic tool: http://localhost:3000/login-diagnostic.html');

  console.log('\n' + '='.repeat(70));
  console.log('\n📋 TROUBLESHOOTING GUIDE');
  console.log('-'.repeat(70));
  
  if (!backendTest) {
    console.log('1. Start backend: cd c:\\laragon\\www\\parkir\\backend && npm start');
  }

  console.log('\n2. Clear browser localStorage or try incognito mode');
  console.log('3. Check browser console for errors (F12)');
  console.log('4. Try the diagnostic tool at http://localhost:3000/login-diagnostic.html');
  console.log('5. Verify credentials: admin / admin123');

  console.log('\n✅ DIAGNOSIS COMPLETE\n');
}

diagnoseLogin().catch(err => console.error('Error:', err.message));
