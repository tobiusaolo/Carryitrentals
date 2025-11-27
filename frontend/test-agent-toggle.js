/**
 * Test script for Agent Toggle Active Endpoint
 */

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';

// Test configuration - Admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'carryitadmin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let adminToken = null;
let testAgentId = null;

// Helper function to log test results
function logTest(testName, success, message = '', data = null) {
  const status = success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`${status} ${testName}`);
  if (message) {
    console.log(`  ${colors.cyan}→${colors.reset} ${message}`);
  }
  if (data && success) {
    console.log(`  ${colors.blue}Data:${colors.reset}`, JSON.stringify(data, null, 2));
  }
  if (!success && message) {
    console.log(`  ${colors.red}Error:${colors.reset} ${message}`);
  }
  console.log('');
}

// Test 1: Admin Login
async function testAdminLogin() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Admin Login${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: POST ${API_BASE_URL}/auth/login`);
  console.log(`Email: ${ADMIN_EMAIL}\n`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    );

    if (response.data && response.data.access_token) {
      adminToken = response.data.access_token;
      logTest(
        'Admin Login',
        true,
        `Successfully logged in. Token received: ${adminToken.substring(0, 30)}...`,
        {
          has_access_token: !!response.data.access_token,
          user_role: response.data.user?.role
        }
      );
      return true;
    } else {
      logTest('Admin Login', false, 'Response missing access_token');
      return false;
    }
  } catch (error) {
    logTest(
      'Admin Login',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Test 2: Get Agents
async function testGetAgents() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: Get Agents${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: GET ${API_BASE_URL}/agents/\n`);

  if (!adminToken) {
    logTest('Get Agents', false, 'No authentication token available');
    return false;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/agents/`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const agents = Array.isArray(response.data) ? response.data : [];
    if (agents.length > 0) {
      testAgentId = agents[0].id;
      logTest(
        'Get Agents',
        true,
        `Successfully retrieved ${agents.length} agents. Using first agent for toggle test.`,
        {
          total_agents: agents.length,
          test_agent_id: testAgentId,
          test_agent_name: agents[0].name,
          test_agent_is_active: agents[0].is_active
        }
      );
      return true;
    } else {
      logTest('Get Agents', false, 'No agents found in database');
      return false;
    }
  } catch (error) {
    logTest(
      'Get Agents',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Test 3: Toggle Agent Active Status
async function testToggleAgentActive() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: Toggle Agent Active Status${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: PATCH ${API_BASE_URL}/agents/${testAgentId}/toggle-active\n`);

  if (!adminToken || !testAgentId) {
    logTest('Toggle Agent Active', false, 'Missing token or agent ID');
    return false;
  }

  try {
    // Get current status first
    const getResponse = await axios.get(
      `${API_BASE_URL}/agents/${testAgentId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const currentStatus = getResponse.data.is_active;
    console.log(`  Current status: ${currentStatus ? 'Active' : 'Inactive'}`);

    // Toggle the status
    const response = await axios.patch(
      `${API_BASE_URL}/agents/${testAgentId}/toggle-active`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const newStatus = response.data.is_active;
    logTest(
      'Toggle Agent Active',
      true,
      `Successfully toggled agent status from ${currentStatus ? 'Active' : 'Inactive'} to ${newStatus ? 'Active' : 'Inactive'}`,
      response.data
    );

    // Verify the change
    const verifyResponse = await axios.get(
      `${API_BASE_URL}/agents/${testAgentId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (verifyResponse.data.is_active === newStatus) {
      logTest('Verify Toggle', true, 'Status change verified in database');
      return true;
    } else {
      logTest('Verify Toggle', false, 'Status change not reflected in database');
      return false;
    }
  } catch (error) {
    logTest(
      'Toggle Agent Active',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Agent Toggle Active Endpoint Test                  ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}\n`);

  const results = {
    login: false,
    getAgents: false,
    toggleActive: false
  };

  // Run tests in sequence
  results.login = await testAdminLogin();
  
  if (results.login) {
    results.getAgents = await testGetAgents();
    
    if (results.getAgents) {
      results.toggleActive = await testToggleAgentActive();
    }
  }

  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}\n`);
  
  console.log('Results:');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`  ${status} - ${test}`);
  });

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

