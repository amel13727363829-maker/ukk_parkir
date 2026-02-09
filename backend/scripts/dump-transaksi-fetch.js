(async()=>{
  try{
    const res = await fetch('http://localhost:5001/api/v1/transaksi?limit=10');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  }catch(e){
    console.error('ERR', e.message);
    if(e?.stack) console.error(e.stack);
  }
})();