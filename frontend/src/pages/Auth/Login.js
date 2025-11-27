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
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Home as HomeIcon,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import { loginUser, getCurrentUser, clearError } from '../../store/slices/authSlice';

const Login = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(loginUser(formData));
    if (result.type === 'auth/login/fulfilled') {
      // Fetch user data after successful login
      const userResult = await dispatch(getCurrentUser());
      if (userResult.type === 'auth/getCurrentUser/fulfilled') {
        // Redirect based on user role
        const userRole = userResult.payload?.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/owner/dashboard');
        }
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f5f7fa' }}>
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          p: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />

        <Slide direction="right" in={true} timeout={800}>
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              <HomeIcon sx={{ fontSize: 60 }} />
            </Box>
            <Avatar
              src={logoImage}
              alt="Easy Rentals Logo"
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                mb: 2
              }}
              variant="rounded"
            />
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Easy Rentals
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Property Management Platform
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, maxWidth: 400 }}>
              Manage your properties, tenants, and finances all in one powerful platform
            </Typography>

            {/* Features */}
            <Box sx={{ mt: 6 }}>
              {[
                'Automated rent collection',
                'Real-time financial reports',
                'Tenant communication tools',
                'Secure & encrypted'
              ].map((feature, index) => (
                <Fade in={true} timeout={1000 + (index * 200)} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    <Typography variant="body1">{feature}</Typography>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Slide>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 }
        }}
      >
        <Fade in={true} timeout={1000}>
          <Container maxWidth="sm">
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              {/* Mobile Logo */}
              <Avatar
                src={logoImage}
                alt="Easy Rentals Logo"
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  display: { xs: 'flex', md: 'none' },
                  mx: 'auto',
                  mb: 2
                }}
                variant="rounded"
              />

              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to manage your properties
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              {error && (
                <Slide direction="down" in={true}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2
                    }}
                  >
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                  </Alert>
                </Slide>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                />

                <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
                  <Link 
                    component={RouterLink} 
                    to="/forgot-password" 
                    variant="body2"
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={!isLoading && <ArrowForward />}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Chip label="OR" size="small" />
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Don't have an account?
                  </Typography>
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    variant="body1"
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 700,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Create Account →
                  </Link>
                </Box>
              </Box>
            </Paper>

            {/* Back to Home Link */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Link 
                component={RouterLink} 
                to="/" 
                variant="body2"
                sx={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#667eea'
                  }
                }}
              >
                ← Back to Home
              </Link>
            </Box>
          </Container>
        </Fade>
      </Box>
    </Box>
  );
};

export default Login;
