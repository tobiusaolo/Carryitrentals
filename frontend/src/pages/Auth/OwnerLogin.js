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
  InputAdornment,
  IconButton,
  Fade,
  Divider,
  Avatar,
  LinearProgress
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Business
} from '@mui/icons-material';
import { loginUser, getCurrentUser, clearError } from '../../store/slices/authSlice';

const OwnerLogin = () => {
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F7F7', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Container maxWidth="xs">
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: '24px', 
              border: '1px solid #DDD',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                src={logoImage}
                alt="CarryIT"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                }}
                variant="rounded"
              />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#222' }}>
                Owner Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your properties and earnings
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Owner Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: '#222', fontSize: 20 }} />
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#222', fontSize: 20 }} />
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
                  mt: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#222',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#444' }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In as Owner'}
              </Button>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Want to list your property? <Link component={RouterLink} to="/owner-register" sx={{ color: '#222', fontWeight: 800 }}>Join now</Link>
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/login" sx={{ color: '#717171', fontSize: '0.8rem' }}>Not an owner? Client Login</Link>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default OwnerLogin;
