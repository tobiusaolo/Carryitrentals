import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCurrentUser, refreshToken, logout } from '../../store/slices/authSlice';
import { isTokenValid } from '../../services/api/api';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoading, user } = useSelector((state) => state.auth);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refresh_token');

        if (storedToken && isTokenValid()) {
          // Token is valid, get user data if not already loaded
          if (!user) {
            await dispatch(getCurrentUser());
          }
        } else if (storedRefreshToken) {
          // Token expired, try to refresh
          await dispatch(refreshToken(storedRefreshToken));
          // After refresh, get user data if still not loaded
          if (!user) {
            await dispatch(getCurrentUser());
          }
        } else {
          // No valid tokens, logout
          dispatch(logout());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch(logout());
      } finally {
        setIsAuthChecked(true);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout, proceeding anyway');
      setIsAuthChecked(true);
    }, 5000); // 5 second timeout

    initializeAuth();

    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount

  // Show loading while initializing
  if (!isAuthChecked || isLoading) {
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
          Initializing application...
        </Typography>
      </Box>
    );
  }

  return children;
};

export default AuthInitializer;
