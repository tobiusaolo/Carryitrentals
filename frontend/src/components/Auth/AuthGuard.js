import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCurrentUser, logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has valid token
        if (!authService.isAuthenticated()) {
          console.log('No authentication token found, redirecting to login');
          authService.logout();
          return;
        }

        // If user is not loaded, get current user
        if (!user) {
          console.log('Getting current user...');
          await dispatch(getCurrentUser());
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authService.logout();
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, user]);

  // Show loading while checking authentication
  if (isChecking || isLoading) {
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
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If no user after checking, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    authService.logout();
    return null;
  }

  return children;
};

export default AuthGuard;
