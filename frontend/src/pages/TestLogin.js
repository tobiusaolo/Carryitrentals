import React, { useState } from 'react';
import axios from 'axios';

const TestLogin = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing login...');
      const response = await axios.post('https://carryit-backend.onrender.com/api/v1/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('Success:', response.data);
      setResult({ success: true, data: response.data });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setResult({ success: false, error: error.response?.data || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Login</h1>
      <button onClick={testLogin} disabled={loading}>
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestLogin;
