'use client';

import { useState } from 'react';

export default function CheckoutTestPage() {
  const [nomor_plat, setNomorPlat] = useState('');
  const [metode, setMetode] = useState('tunai');

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>✅ Checkout Test Page</h1>
      <p>If you see this, checkout page logic works.</p>

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '5px', marginTop: '20px' }}>
        <h2>Test Form</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Nomor Plat:</label><br />
          <input
            type="text"
            value={nomor_plat}
            onChange={(e) => setNomorPlat(e.target.value)}
            placeholder="Ketik nomor plat..."
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Metode Pembayaran:</label><br />
          <select
            value={metode}
            onChange={(e) => setMetode(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
          >
            <option value="tunai">💵 CASH</option>
            <option value="qris">📱 QRIS</option>
          </select>
        </div>

        <button
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#ff7f00',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🧮 Hitung Tarif
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
        <p><strong>Debug Info:</strong></p>
        <p>Nomor Plat: {nomor_plat || '(kosong)'}</p>
        <p>Metode: {metode}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard/petugas" style={{ color: '#0066cc', textDecoration: 'underline' }}>← Back to Check-in</a>
      </div>
    </div>
  );
}
