import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCurrentUser, refreshToken } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { getLoginPathForRoute, getHomePathForRole } from '../../utils/authRoutes';

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading, token, refreshTokenValue, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token && refreshTokenValue && !isLoading) {
        await dispatch(refreshToken(refreshTokenValue));
      }
      if ((token || refreshTokenValue) && !user && !isLoading) {
        dispatch(getCurrentUser());
      }
    };
    bootstrap();
  }, [dispatch, token, refreshTokenValue, user, isLoading]);

  const hasStoredUser = !!authService.getStoredUser();
  if (isLoading || (token && !user && !hasStoredUser)) {
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

  if (!isAuthenticated || !token) {
    const loginPath = getLoginPathForRoute(location.pathname);
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (requiredRoles && user?.role && !requiredRoles.includes(user.role)) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
