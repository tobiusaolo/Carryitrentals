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
  Business,
  Person
} from '@mui/icons-material';
import { registerUser, clearError } from '../../store/slices/authSlice';

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
      navigate('/owner-login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F7F7', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8 }}>
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 5, 
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
                List your Property
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join our network of elite property owners
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {typeof error === 'string' ? error : (error.detail || 'Registration failed')}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="First Name" name="first_name" required
                    value={formData.first_name} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Last Name" name="last_name" required
                    value={formData.last_name} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Desired Username" name="username" required
                    value={formData.username} onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} required
                    value={formData.password} onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Confirm Password" name="confirmPassword" type="password" required
                    value={formData.confirmPassword} onChange={handleChange}
                    error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth type="submit" variant="contained"
                disabled={isLoading || (formData.confirmPassword && formData.password !== formData.confirmPassword)}
                sx={{
                  mt: 4, py: 1.5, borderRadius: '12px', bgcolor: '#222', fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                  '&:hover': { bgcolor: '#444' }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Owner Account'}
              </Button>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an owner account? <Link component={RouterLink} to="/owner-login" sx={{ color: '#222', fontWeight: 800 }}>Sign In</Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default OwnerRegister;
