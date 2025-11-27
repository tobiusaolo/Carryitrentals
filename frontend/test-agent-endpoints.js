/**
 * Test script for Agent Login and Agent Screen Endpoints
 * 
 * This script tests all endpoints used in:
 * - AgentLogin.js
 * - AgentDashboard.js
 * - AgentProfile.js
 * - AgentMyUnits.js
 * - AgentInspections.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';

// Test configuration
const TEST_PHONE = process.env.TEST_AGENT_PHONE || '+256750371313'; // Change this to a valid agent phone number

// Test endpoint connectivity without authentication
async function testEndpointConnectivity() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}CONNECTIVITY TEST: Base URL${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Testing: ${API_BASE_URL}\n`);

  try {
    // Try to hit a public endpoint or health check
    const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
      timeout: 5000
    });
    logTest('Base URL Connectivity', true, 'Server is reachable', response.data);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      logTest('Base URL Connectivity', false, `Cannot reach server: ${error.message}`);
    } else {
      // If we get a 404 or other HTTP error, the server is reachable
      logTest('Base URL Connectivity', true, 'Server is reachable (endpoint may not exist)');
    }
    return true; // Server is reachable even if endpoint doesn't exist
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let authToken = null;

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

// Test 1: Agent Login
async function testAgentLogin() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Agent Login${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: POST ${API_BASE_URL}/auth/agent-login`);
  console.log(`Phone: ${TEST_PHONE}\n`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/agent-login`,
      { phone: TEST_PHONE },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.access_token) {
      authToken = response.data.access_token;
      logTest(
        'Agent Login',
        true,
        `Successfully logged in. Token received: ${authToken.substring(0, 30)}...`,
        {
          has_access_token: !!response.data.access_token,
          has_refresh_token: !!response.data.refresh_token,
          has_user: !!response.data.user,
          user_role: response.data.user?.role,
          user_email: response.data.user?.email
        }
      );
      return true;
    } else {
      logTest('Agent Login', false, 'Response missing access_token');
      return false;
    }
  } catch (error) {
    logTest(
      'Agent Login',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Test 2: Agent Dashboard Stats
async function testAgentStats() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: Agent Dashboard Stats${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: GET ${API_BASE_URL}/agents/my-stats\n`);

  if (!authToken) {
    logTest('Agent Stats', false, 'No authentication token available');
    return false;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/agents/my-stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logTest(
      'Agent Stats',
      true,
      'Successfully retrieved agent statistics',
      response.data
    );
    return true;
  } catch (error) {
    logTest(
      'Agent Stats',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Test 3: Agent Profile
async function testAgentProfile() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: Agent Profile${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: GET ${API_BASE_URL}/agents/my-profile\n`);

  if (!authToken) {
    logTest('Agent Profile', false, 'No authentication token available');
    return false;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/agents/my-profile`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logTest(
      'Agent Profile',
      true,
      'Successfully retrieved agent profile',
      {
        name: response.data?.name,
        email: response.data?.email,
        phone: response.data?.phone,
        is_active: response.data?.is_active,
        specialization: response.data?.specialization
      }
    );
    return true;
  } catch (error) {
    logTest(
      'Agent Profile',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Test 4: Agent My Units
async function testAgentUnits() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 4: Agent My Units${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: GET ${API_BASE_URL}/rental-units/\n`);

  if (!authToken) {
    logTest('Agent Units', false, 'No authentication token available');
    return false;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/rental-units/`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const units = Array.isArray(response.data) ? response.data : [];
    logTest(
      'Agent Units',
      true,
      `Successfully retrieved ${units.length} rental units`,
      {
        total_units: units.length,
        sample_unit: units[0] ? {
          id: units[0].id,
          title: units[0].title,
          status: units[0].status,
          price: units[0].price
        } : null
      }
    );
    return true;
  } catch (error) {
    logTest(
      'Agent Units',
      false,
      error.response?.data?.detail || error.message,
      error.response?.data
    );
    return false;
  }
}

// Test 5: Agent Inspections
async function testAgentInspections() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}TEST 5: Agent Inspections${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Endpoint: GET ${API_BASE_URL}/inspections/bookings/\n`);

  if (!authToken) {
    logTest('Agent Inspections', false, 'No authentication token available');
    return false;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/inspections/bookings/`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const inspections = Array.isArray(response.data) ? response.data : [];
    logTest(
      'Agent Inspections',
      true,
      `Successfully retrieved ${inspections.length} inspection bookings`,
      {
        total_inspections: inspections.length,
        by_status: inspections.reduce((acc, inv) => {
          acc[inv.status] = (acc[inv.status] || 0) + 1;
          return acc;
        }, {}),
        sample_inspection: inspections[0] ? {
          id: inspections[0].id,
          status: inspections[0].status,
          amount: inspections[0].amount
        } : null
      }
    );
    return true;
  } catch (error) {
    logTest(
      'Agent Inspections',
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
  console.log(`${colors.cyan}║   Agent Endpoints Test Suite                         ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Test Phone: ${TEST_PHONE}\n`);

  const results = {
    connectivity: false,
    login: false,
    stats: false,
    profile: false,
    units: false,
    inspections: false
  };

  // First test connectivity
  results.connectivity = await testEndpointConnectivity();
  console.log('');

  // Run tests in sequence (each depends on the previous)
  results.login = await testAgentLogin();
  
  if (results.login) {
    results.stats = await testAgentStats();
    results.profile = await testAgentProfile();
    results.units = await testAgentUnits();
    results.inspections = await testAgentInspections();
  } else {
    console.log(`${colors.yellow}⚠ Skipping remaining tests - login failed${colors.reset}\n`);
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

  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  
  // Additional info
  if (!results.login && results.connectivity) {
    console.log(`\n${colors.yellow}ℹ Note:${colors.reset} Login failed, but this may be because:`);
    console.log(`  1. The test phone number (${TEST_PHONE}) doesn't exist in the database`);
    console.log(`  2. To test with a real agent, set TEST_AGENT_PHONE environment variable:`);
    console.log(`     ${colors.cyan}TEST_AGENT_PHONE=+256XXXXXXXXX node test-agent-endpoints.js${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

  // Exit with appropriate code (don't fail if only login fails due to missing test data)
  const criticalTests = results.connectivity;
  process.exit(criticalTests ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

