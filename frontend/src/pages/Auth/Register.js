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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Divider,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  Home as HomeIcon,
  CheckCircle,
  Business
} from '@mui/icons-material';
import { registerUser, clearError } from '../../store/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      navigate('/login');
    }
  };

  // Password strength calculator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    if (strength < 40) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength < 70) return { strength, label: 'Good', color: '#f59e0b' };
    return { strength, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength();

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
              Join Easy Rentals
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Start Managing Smarter
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, maxWidth: 400 }}>
              Join thousands of property owners who trust Easy Rentals to manage their rental business
            </Typography>

            {/* Benefits */}
            <Box sx={{ mt: 6 }}>
              {[
                '30-day free trial',
                'No credit card required',
                'Cancel anytime',
                'Full feature access'
              ].map((benefit, index) => (
                <Fade in={true} timeout={1000 + (index * 200)} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Slide>
      </Box>

      {/* Right Side - Register Form */}
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
            <Box sx={{ mb: 3, textAlign: 'center' }}>
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
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start your 30-day free trial
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
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="first_name"
                      label="First Name"
                      name="first_name"
                      autoComplete="given-name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="last_name"
                      label="Last Name"
                      name="last_name"
                      autoComplete="family-name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
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
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      label="Phone Number"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="role-label">Account Type</InputLabel>
                      <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formData.role}
                        label="Account Type"
                        onChange={handleChange}
                        disabled={isLoading}
                        startAdornment={
                          <InputAdornment position="start">
                            <Business sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="owner">Property Owner</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
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
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                      helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <Grid item xs={12}>
                      <Fade in={true}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Password Strength
                            </Typography>
                            <Typography 
                              variant="caption" 
                              fontWeight={600}
                              sx={{ color: passwordStrength.color }}
                            >
                              {passwordStrength.label}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={passwordStrength.strength}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: passwordStrength.color,
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                  )}
                </Grid>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || formData.password !== formData.confirmPassword}
                  sx={{
                    mt: 3,
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
                    '&:disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Chip label="OR" size="small" />
                </Divider>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Already have an account?
                  </Typography>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
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
                    Sign In →
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

export default Register;
