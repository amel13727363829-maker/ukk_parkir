const axios = require('axios');

(async () => {
  console.log('🔍 Testing Login API...\n');
  
  try {
    console.log('📤 Sending login request with credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    
    const response = await axios.post('http://localhost:5001/api/v1/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login SUCCESS!');
    console.log('');
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (err) {
    console.log('❌ Login FAILED!');
    console.log('');
    
    if (err.response) {
      console.log('Status Code:', err.response.status);
      console.log('Status Text:', err.response.statusText);
      console.log('');
      console.log('Error Response:');
      console.log(JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('Error Message:', err.message);
      console.log('');
      console.log('Note: Backend server might not be running on http://localhost:5001');
    }
  }
})();
