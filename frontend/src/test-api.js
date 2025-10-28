// Test API call
import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('Testing API call...');
    const response = await axios.post('https://carryit-backend.onrender.com/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testLogin();
