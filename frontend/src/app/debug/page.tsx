'use client';

export default function DebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>✅ Frontend Working</h1>
      <p>If you see this, the frontend is properly running.</p>
      
      <h2>Test Links:</h2>
      <ul>
        <li><a href="/login">Go to Login</a></li>
        <li><a href="/register">Go to Register</a></li>
        <li><a href="/dashboard">Go to Dashboard</a></li>
      </ul>

      <h2>Diagnostics:</h2>
      <p>API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Timestamp: {new Date().toISOString()}</p>

      <h2>Browser Console Check:</h2>
      <p>Press F12 and check the Console tab for any JavaScript errors.</p>
    </div>
  );
}
