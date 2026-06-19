// Test API call
import axios from 'axios';
import { DEPLOYED_API_BASE_URL } from './config/api';

const testLogin = async () => {
  try {
    console.log('Testing API call...');
    const response = await axios.post(`${DEPLOYED_API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testLogin();
