'use client';

export default function SimplePage() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>🎉 Frontend is Working!</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>If you see this text, Next.js is running properly.</p>
      
      <button 
        onClick={() => window.location.href = '/login'}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Go to Login →
      </button>
    </div>
  );
}
