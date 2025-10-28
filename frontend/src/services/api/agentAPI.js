import authService from '../authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com';

export const agentAPI = {
  // Get all agents
  getAgents: (skip = 0, limit = 100) => 
    authService.get(`/agents/?skip=${skip}&limit=${limit}`),
  
  // Get active agents only
  getActiveAgents: () => 
    authService.get('/agents/active'),
  
  // Get agent by ID
  getAgent: (agentId) => 
    authService.get(`/agents/${agentId}`),
  
  // Create new agent
  createAgent: (agentData) => 
    authService.post('/agents/', agentData),
  
  // Update agent
  updateAgent: (agentId, agentData) => 
    authService.put(`/agents/${agentId}`, agentData),
  
  // Delete agent
  deleteAgent: (agentId) => 
    authService.delete(`/agents/${agentId}`),
  
  // Update agent performance
  updateAgentPerformance: (agentId, performanceData) => 
    authService.put(`/agents/${agentId}/performance`, performanceData),
};
