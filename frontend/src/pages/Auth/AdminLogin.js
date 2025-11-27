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
  Container,
  Paper,
  Divider,
  Link,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Avatar,
  Chip
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  CheckCircle,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { loginUser, clearError } from '../../store/slices/authSlice';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    try {
      const result = await dispatch(loginUser(formData));
      
      if (result.payload) {
        // Check if user is admin
        if (result.payload.role === 'admin') {
          navigate('/admin');
        } else {
          // Show error for non-admin users
          dispatch(clearError());
          setFormData({ email: '', password: '' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
        py: 3,
        px: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 0
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Slide direction="down" in={true} timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Paper
              elevation={10}
              sx={{
                borderRadius: '50%',
                width: 100,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                bgcolor: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              <AdminIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Paper>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}
            >
              Admin Portal
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={logoImage}
                alt="Easy Rentals Logo"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
                variant="rounded"
              />
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Easy Rentals Property Management System
            </Typography>
          </Box>
        </Slide>

        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            {/* Admin Badge */}
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: 1.5,
                px: 3,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <ShieldIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" fontWeight="bold">
                System Administrator Access
              </Typography>
              <CheckCircle sx={{ fontSize: 20 }} />
            </Box>

            <Box sx={{ p: 4 }}>
              {error && (
                <Slide direction="down" in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Slide>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Secure Admin Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your administrator credentials to access the system
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" sx={{ fontSize: 24 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1rem',
                      '& input': {
                        py: 1.5
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" sx={{ fontSize: 24 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1rem',
                      '& input': {
                        py: 1.5
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading || !formData.email || !formData.password}
                  startIcon={!isLoading && <LoginIcon />}
                  sx={{
                    py: 1.8,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: isLoading || !formData.email || !formData.password
                      ? 'grey.400'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: isLoading || !formData.email || !formData.password
                      ? 'none'
                      : '0 4px 15px 0 rgba(118, 75, 162, 0.4)',
                    '&:hover': {
                      background: isLoading || !formData.email || !formData.password
                        ? 'grey.400'
                        : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: isLoading || !formData.email || !formData.password
                        ? 'none'
                        : '0 6px 20px 0 rgba(118, 75, 162, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                      Signing In...
                    </>
                  ) : (
                    'Sign In as Admin'
                  )}
                </Button>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Chip
                  icon={<ShieldIcon />}
                  label="Secure Access"
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Admin Only"
                  color="secondary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Are you a property owner?
                </Typography>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                  Go to Owner Login
                </Link>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="text.primary" gutterBottom>
                  Admin Credentials:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email: carryitadmin@gmail.com
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Password: admin123
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2025 Easy Rentals. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin;
