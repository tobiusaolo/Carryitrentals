import authService from '../authService';

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
    authService.post('/agents/', agentData, { timeout: 120000 }), // 2 minutes for image uploads
  
  // Update agent
  updateAgent: (agentId, agentData) => 
    authService.put(`/agents/${agentId}`, agentData, { timeout: 120000 }), // 2 minutes for image uploads
  
  // Delete agent
  deleteAgent: (agentId) => 
    authService.delete(`/agents/${agentId}`),
  
  // Update agent performance
  updateAgentPerformance: (agentId, performanceData) => 
    authService.put(`/agents/${agentId}/performance`, performanceData),
  
  // Toggle agent active status
  toggleAgentActive: (agentId) => 
    authService.patch(`/agents/${agentId}/toggle-active`),
};
