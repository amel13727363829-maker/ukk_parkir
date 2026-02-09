const http = require('http');

const postData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

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
  console.log(`\n🔍 Login Test Response\n`);
  console.log(`Status Code: ${res.statusCode}\n`);
  
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw Response:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('\nNote: Make sure the backend server is running on http://localhost:5001');
});

console.log('📤 Sending login request...');
console.log('Username: admin');
console.log('Password: admin123\n');

req.write(postData);
req.end();
