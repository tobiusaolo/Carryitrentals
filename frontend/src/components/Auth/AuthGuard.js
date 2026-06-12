import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCurrentUser } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { getLoginPathForRoute } from '../../utils/authRoutes';

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isLoading, token } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          return;
        }
        await authService.ensureValidSession();
        if (!user) {
          const result = await dispatch(getCurrentUser());
          if (result.type === 'auth/getCurrentUser/rejected') {
            const payload = result.payload;
            if (payload?.status === 401) {
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, user, token]);

  const hasStoredUser = !!authService.getStoredUser();
  if (isChecking || isLoading || (token && !user && !hasStoredUser)) {
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

  if (!user || !token) {
    const loginPath = getLoginPathForRoute(location.pathname);
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AuthGuard;
