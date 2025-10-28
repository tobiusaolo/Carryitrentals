import React from 'react';
import { Navigate } from 'react-router-dom';

const AgentProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  console.log('AgentProtectedRoute - token exists:', !!token);
  console.log('AgentProtectedRoute - user exists:', !!userStr);

  if (!token || !userStr) {
    console.log('No token/user, redirecting to agent-login');
    return <Navigate to="/agent-login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const roleStr = String(user.role || '').toLowerCase();
    
    console.log('AgentProtectedRoute - user role:', user.role);
    console.log('AgentProtectedRoute - role check:', roleStr);

    // Check if user is an agent
    if (roleStr !== 'agent' && roleStr !== 'userrole.agent') {
      console.log('User is not an agent, redirecting to their dashboard');
      
      // Redirect to appropriate dashboard
      if (roleStr === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }

    console.log('✅ Agent authentication verified');
    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/agent-login" replace />;
  }
};

export default AgentProtectedRoute;

