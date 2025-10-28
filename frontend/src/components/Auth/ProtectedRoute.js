import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCurrentUser, refreshToken } from '../../store/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, token, refreshTokenValue, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch current user
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
    
    // If we have a refresh token but no access token, try to refresh
    if (!token && refreshTokenValue && !isLoading) {
      dispatch(refreshToken(refreshTokenValue));
    }
  }, [dispatch, token, refreshTokenValue, user, isLoading]);

  // Show loading while checking authentication
  if (isLoading || (token && !user)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !token) {
    // Determine which login page to redirect to based on current path
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/agent')) {
      return <Navigate to="/agent-login" replace />;
    } else if (currentPath.startsWith('/admin')) {
      return <Navigate to="/admin-login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

