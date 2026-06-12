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
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
} from '@mui/icons-material';
import { registerUser, clearError } from '../../store/slices/authSlice';
import AuthShell from '../../components/Auth/AuthShell';
import { colors } from '../../theme/designTokens';

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: colors.surface },
};

const OwnerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'owner',
  });

  const passwordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await dispatch(registerUser(userData));

    if (result.type === 'auth/register/fulfilled') {
      navigate('/owner-login');
    }
  };

  return (
    <AuthShell
      wide
      accent={colors.brand}
      accentDark={colors.brandHover}
      panelTitle="List your property. Reach more tenants."
      panelSubtitle="Join a growing network of property owners and start earning with CarryIT today."
      highlights={[
        'Free to list — only pay when you earn',
        'Reach verified tenants and short-stay guests',
        'Built-in payments, viewings and reporting tools',
      ]}
      badgeIcon={<Business />}
      formTitle="Create owner account"
      formSubtitle="Set up your account in less than a minute."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {typeof error === 'string' ? error : error.detail || 'Registration failed'}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First name"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last name"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone (optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm password"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(passwordMismatch)}
              helperText={passwordMismatch ? 'Passwords do not match' : ' '}
              sx={inputSx}
            />
          </Grid>
        </Grid>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading || Boolean(passwordMismatch)}
          sx={{
            mt: 2,
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
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create account'}
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: colors.textMuted }}>
          Already have an owner account?{' '}
          <Link component={RouterLink} to="/owner-login" sx={{ color: colors.brand, fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
};

export default OwnerRegister;
