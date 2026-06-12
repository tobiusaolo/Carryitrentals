import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { loginUser, getCurrentUser, clearError } from '../../store/slices/authSlice';
import AuthShell from '../../components/Auth/AuthShell';
import { colors } from '../../theme/designTokens';

const ADMIN_ACCENT = '#1f2937';
const ADMIN_ACCENT_DARK = '#111827';

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: colors.surface },
};

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [accessDenied, setAccessDenied] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setAccessDenied('');

    const result = await dispatch(loginUser(formData));
    if (result.type === 'auth/login/fulfilled') {
      const userResult = await dispatch(getCurrentUser());
      if (userResult.type === 'auth/getCurrentUser/fulfilled') {
        const userRole = userResult.payload?.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          setAccessDenied(`This account is "${userRole}", not admin. Use the correct portal from /portals.`);
          setFormData({ email: '', password: '' });
        }
      }
    }
  };

  return (
    <AuthShell
      accent={ADMIN_ACCENT}
      accentDark={ADMIN_ACCENT_DARK}
      eyebrow="CarryIT Admin"
      panelTitle="Secure administrator console."
      panelSubtitle="Oversee the entire platform — owners, properties, payments and system health from one place."
      highlights={[
        'Full oversight of owners, agents and listings',
        'Monitor payments, inspections and analytics',
        'Restricted, audited administrative access',
      ]}
      footnote="Authorized personnel only. Activity is monitored."
      badgeIcon={<AdminIcon />}
      formTitle="Administrator sign in"
      formSubtitle="Restricted access. Enter your admin credentials."
    >
      {accessDenied && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          {accessDenied}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Admin email"
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
                <EmailIcon sx={{ color: colors.textMuted, fontSize: 20 }} />
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
            bgcolor: ADMIN_ACCENT,
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: ADMIN_ACCENT_DARK, boxShadow: 'none' },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in to admin'}
        </Button>
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: colors.surfaceMuted,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block' }}>
          <strong>Note:</strong> Admin credentials are restricted and access is logged.
        </Typography>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link component={RouterLink} to="/owner-login" sx={{ color: colors.text, fontWeight: 600, fontSize: '0.85rem' }}>
          Return to owner login
        </Link>
      </Box>
    </AuthShell>
  );
};

export default AdminLoginPage;
