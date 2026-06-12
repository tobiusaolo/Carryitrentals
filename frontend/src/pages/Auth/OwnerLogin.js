import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Business,
} from '@mui/icons-material';
import { loginUser, getCurrentUser, clearError } from '../../store/slices/authSlice';
import AuthShell from '../../components/Auth/AuthShell';
import { colors } from '../../theme/designTokens';

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: colors.surface },
};

const OwnerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(loginUser(formData));
    if (result.type === 'auth/login/fulfilled') {
      const userResult = await dispatch(getCurrentUser());
      if (userResult.type === 'auth/getCurrentUser/fulfilled') {
        const userRole = userResult.payload?.role;
        if (userRole === 'owner') {
          navigate('/owner/dashboard');
        } else if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    }
  };

  return (
    <AuthShell
      accent={colors.brand}
      accentDark={colors.brandHover}
      panelTitle="Manage your properties with confidence."
      panelSubtitle="The all-in-one platform for property owners to track rent, viewings, and short stays."
      highlights={[
        'Track rent collection and outstanding balances',
        'Manage viewings, tenants and short-stay bookings',
        'Real-time income insights across every property',
      ]}
      badgeIcon={<Business />}
      formTitle="Owner sign in"
      formSubtitle="Welcome back. Enter your details to access your portal."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Owner email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Business sx={{ color: colors.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: colors.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: '12px',
            bgcolor: colors.brand,
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: colors.brandHover, boxShadow: 'none' },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in to portal'}
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: colors.textMuted }}>
          Want to list your property?{' '}
          <Link component={RouterLink} to="/owner-register" sx={{ color: colors.brand, fontWeight: 700 }}>
            Create an account
          </Link>
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <Link component={RouterLink} to="/login" sx={{ color: colors.textMuted, fontSize: '0.8rem' }}>
            Not an owner? Client login
          </Link>
        </Box>
      </Box>
    </AuthShell>
  );
};

export default OwnerLogin;
