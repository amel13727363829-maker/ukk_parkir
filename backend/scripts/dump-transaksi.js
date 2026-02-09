const axios = require('axios');
(async()=>{
  try{
    const res = await axios.get('http://localhost:5001/api/v1/transaksi?limit=10');
    console.log(JSON.stringify(res.data, null, 2));
  }catch(e){
    console.error('ERR', e.message);
    if(e.response) console.error('Status', e.response.status, e.response.data);
  }
})();