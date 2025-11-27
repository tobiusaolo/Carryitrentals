import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  AttachMoney,
  Bed,
  Bathtub,
  Home,
  Event as CalendarIcon,
  Person,
  Phone,
  Email,
  ArrowForwardIos,
  ArrowBackIos,
  Close
} from '@mui/icons-material';
import axios from 'axios';
import additionalServicesAPI from '../../services/api/additionalServicesAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';

// Country to flag emoji mapping
const getCountryFlag = (country) => {
  if (!country) return '';
  const flagMap = {
    'Uganda': '🇺🇬',
    'Kenya': '🇰🇪',
    'Tanzania': '🇹🇿',
    'Rwanda': '🇷🇼',
    'Burundi': '🇧🇮',
    'South Sudan': '🇸🇸',
    'Ethiopia': '🇪🇹',
    'Somalia': '🇸🇴',
    'Djibouti': '🇩🇯',
    'Eritrea': '🇪🇷',
    'Sudan': '🇸🇩',
    'Other': '🌍'
  };
  return flagMap[country] || '🌍';
};

const RentalUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openImageViewer, setOpenImageViewer] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    contact_country: 'Uganda',
    preferred_date: '',
    preferred_time: 'morning',
    message: '',
    additional_service_ids: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [additionalServices, setAdditionalServices] = useState([]);

  useEffect(() => {
    loadUnit();
    loadAdditionalServices();
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/rental-units/public`);
      // Firestore uses string IDs, so compare as strings
      const foundUnit = response.data.find(u => String(u.id) === String(id));
      
      if (foundUnit) {
        // Parse images
        if (foundUnit.images && typeof foundUnit.images === 'string') {
          foundUnit.images = foundUnit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else if (!foundUnit.images) {
          foundUnit.images = [];
        }
        setUnit(foundUnit);
      } else {
        showAlert('error', 'Unit not found');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Error loading unit:', error);
      showAlert('error', 'Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalServices = async () => {
    try {
      console.log('Loading additional services...');
      // Use the correct API base URL instead of hardcoded production URL
      const response = await axios.get(`${API_BASE_URL}/additional-services/?active_only=true`);
      console.log('Additional services loaded:', response.data);
      
      // Handle both array and object responses
      const services = Array.isArray(response.data) ? response.data : [];
      setAdditionalServices(services);
      
      if (services.length === 0) {
        console.warn('No active additional services found');
      }
    } catch (err) {
      console.error('Error loading additional services:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      // Set empty array so form doesn't break
      setAdditionalServices([]);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? (unit?.images?.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === (unit?.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const handleBookingSubmit = async () => {
    // Validation
    if (!bookingData.full_name || !bookingData.full_name.trim()) {
      showAlert('error', 'Please enter your full name');
      return;
    }

    if (!bookingData.phone_number || !bookingData.phone_number.trim()) {
      showAlert('error', 'Please enter your phone number');
      return;
    }

    if (!bookingData.preferred_date) {
      showAlert('error', 'Please select a preferred date');
      return;
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(bookingData.phone_number.replace(/\s/g, ''))) {
      showAlert('error', 'Please enter a valid phone number');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(bookingData.preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showAlert('error', 'Please select a date in the future');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare booking data
      const bookingPayload = {
        rental_unit_id: String(unit.id), // Ensure it's a string
        contact_name: bookingData.full_name.trim(),
        contact_phone: bookingData.phone_number.trim(),
        contact_email: bookingData.email?.trim() || null,
        contact_country: bookingData.contact_country || 'Uganda',
        booking_date: new Date(bookingData.preferred_date).toISOString(),
        preferred_time_slot: bookingData.preferred_time || 'morning',
        message: bookingData.message?.trim() || null,
        additional_service_ids: bookingData.additional_service_ids && bookingData.additional_service_ids.length > 0 
          ? bookingData.additional_service_ids.map(id => String(id)) 
          : [] // Ensure all IDs are strings, default to empty array
      };

      console.log('Submitting inspection booking:', bookingPayload);
      console.log('API URL:', `${API_BASE_URL}/inspection-bookings/public`);

      const response = await axios.post(`${API_BASE_URL}/inspection-bookings/public`, bookingPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Booking response status:', response.status);
      console.log('Booking response data:', response.data);

      if (response.status === 201 || response.status === 200) {
        showAlert('success', 'Inspection booking submitted successfully! We will contact you soon.');
        setBookingDialog(false);
        
        // Reset form
        setBookingData({
          full_name: '',
          phone_number: '',
          email: '',
          contact_country: 'Uganda',
          preferred_date: '',
          preferred_time: 'morning',
          message: '',
          additional_service_ids: []
        });
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      let errorMessage = 'Failed to submit booking. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for network errors
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!unit) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Unit not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#333', fontWeight: 600 }}>
            {unit.title}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setBookingDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Book Inspection
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Alert */}
        {alert.show && (
          <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Image Gallery */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
              {unit.images && unit.images.length > 0 ? (
                <>
                  <Box
                    component="img"
                    src={unit.images[currentImageIndex]}
                    alt={unit.title}
                    sx={{
                      width: '100%',
                      height: isMobile ? 300 : 500,
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => setOpenImageViewer(true)}
                  />
                  {unit.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <ArrowBackIos sx={{ ml: 1 }} />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <ArrowForwardIos />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2
                        }}
                      >
                        {currentImageIndex + 1} / {unit.images.length}
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: isMobile ? 300 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#e0e0e0'
                  }}
                >
                  <Home sx={{ fontSize: 100, color: '#999' }} />
                </Box>
              )}
            </Paper>

            {/* Thumbnail Gallery */}
            {unit.images && unit.images.length > 1 && (
              <Box sx={{ mt: 2 }}>
                <ImageList cols={isMobile ? 4 : 6} gap={8}>
                  {unit.images.map((image, index) => (
                    <ImageListItem
                      key={index}
                      sx={{
                        cursor: 'pointer',
                        border: currentImageIndex === index ? '3px solid #667eea' : '3px solid transparent',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${unit.title} ${index + 1}`}
                        style={{ height: 80, objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* Description */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                About This Property
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {unit.description || 'No description available'}
              </Typography>
            </Paper>

            {/* Features & Amenities - World Class Design */}
            <Paper sx={{ p: 4, mt: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3, color: '#1a202c' }}>
                Property Features & Amenities
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {/* Basic Features */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#f7fafc',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#edf2f7',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.15)'
                    }
                  }}>
                    <Bed sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700} color="#667eea">
                      {unit.bedrooms || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Bedrooms
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#f7fafc',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#edf2f7',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.15)'
                    }
                  }}>
                    <Bathtub sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700} color="#667eea">
                      {unit.bathrooms || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Bathrooms
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#f7fafc',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#edf2f7',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.15)'
                    }
                  }}>
                    <Home sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                    <Typography variant="body1" fontWeight={700} color="#667eea" sx={{ textTransform: 'capitalize', textAlign: 'center' }}>
                      {unit.unit_type?.replace('_', ' ') || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Unit Type
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Amenities Section */}
              {unit.amenities && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, color: '#1a202c' }}>
                    Amenities
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1.5 
                  }}>
                    {unit.amenities.split(',').map((amenity, index) => (
                      <Chip
                        key={index}
                        label={amenity.trim()}
                        sx={{
                          bgcolor: '#eff6ff',
                          color: '#3b82f6',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          py: 2.5,
                          px: 1,
                          borderRadius: '12px',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          '&:hover': {
                            bgcolor: '#dbeafe',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s'
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Sidebar - Premium Booking Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: 4, 
              position: 'sticky', 
              top: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              bgcolor: 'white'
            }}>
              {/* Price Section */}
              <Box sx={{ mb: 3, pb: 3, borderBottom: '2px solid #f7fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography variant="h3" fontWeight={800} sx={{ 
                    color: '#667eea',
                    fontSize: '2rem'
                  }}>
                    {unit.currency || 'UGX'} {parseInt(unit.monthly_rent || unit.rental_price || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    /month
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Monthly rental rate
                </Typography>
              </Box>

              {/* Status Badge */}
              <Chip
                label={unit.status === 'available' ? 'Available Now' : unit.status}
                color={unit.status === 'available' ? 'success' : 'default'}
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  py: 2.5,
                  px: 1,
                  width: '100%',
                  justifyContent: 'center'
                }}
              />

              {/* Location with Flag */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 1, 
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: '#f7fafc'
              }}>
                <LocationOn sx={{ color: '#667eea', fontSize: 20, mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#1a202c">
                    {unit.location || 'Location not specified'}
                  </Typography>
                  {unit.country && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="h6" sx={{ lineHeight: 1 }}>
                        {getCountryFlag(unit.country)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {unit.country}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Inspection Fee - Premium */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, color: '#1a202c' }}>
                  Inspection Fee
                </Typography>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: '#eff6ff',
                    border: '1px solid #bae6fd'
                  }}
                >
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0284c7' }}>
                    {unit.currency || 'UGX'} {unit.inspection_fee ? parseFloat(unit.inspection_fee).toLocaleString() : '30,000'}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                    This fee covers:
                  </Typography>
                  <Box sx={{ pl: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      ✓ Physical inspection of the property
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      ✓ Video view for the property
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#64748b' }}>
                    Note: Fees for multiple houses are negotiable
                  </Typography>
                </Alert>
              </Box>

              {/* Booking Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setBookingDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: 2,
                  mb: 3,
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Book Inspection Now
              </Button>

              {/* Agent Info - Premium */}
              {unit.agent_name && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, color: '#1a202c' }}>
                    Contact Agent
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: '#f7fafc',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: '#667eea', 
                      width: 56, 
                      height: 56,
                      fontSize: '1.25rem',
                      fontWeight: 700
                    }}>
                      {unit.agent_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={700} color="#1a202c">
                        {unit.agent_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Inspection Agent
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Image Viewer Dialog */}
      <Dialog
        open={openImageViewer}
        onClose={() => setOpenImageViewer(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'black' } }}
      >
        <IconButton
          onClick={() => setOpenImageViewer(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <Close />
        </IconButton>
        <Box sx={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          {unit.images && unit.images[currentImageIndex] && (
            <img
              src={unit.images[currentImageIndex]}
              alt={unit.title}
              style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain' }}
            />
          )}
          {unit.images && unit.images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ArrowBackIos sx={{ ml: 1 }} />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}
        </Box>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog 
        open={bookingDialog} 
        onClose={() => {
          setBookingDialog(false);
          // Reset form when dialog closes
          setBookingData({
            full_name: '',
            phone_number: '',
            email: '',
            contact_country: 'Uganda',
            preferred_date: '',
            preferred_time: 'morning',
            message: '',
            additional_service_ids: []
          });
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Book Inspection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unit.title}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              <strong>Inspection Fee: {unit.currency || 'UGX'} {unit.inspection_fee ? parseFloat(unit.inspection_fee).toLocaleString() : '30,000'}</strong>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, mb: 0.5 }}>
              This fee covers: Physical inspection & Video view for the property
            </Typography>
            <Typography variant="caption">
              Fees for multiple houses are negotiable
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Full Name *"
                value={bookingData.full_name}
                onChange={(e) => setBookingData({ ...bookingData, full_name: e.target.value })}
                error={!bookingData.full_name && submitting}
                helperText={!bookingData.full_name && submitting ? 'Full name is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Phone Number *"
                value={bookingData.phone_number}
                onChange={(e) => setBookingData({ ...bookingData, phone_number: e.target.value })}
                placeholder="+256 700 000 000"
                error={!bookingData.phone_number && submitting}
                helperText={!bookingData.phone_number && submitting ? 'Phone number is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={bookingData.email}
                onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country *</InputLabel>
                <Select
                  value={bookingData.contact_country}
                  onChange={(e) => setBookingData({ ...bookingData, contact_country: e.target.value })}
                  label="Country *"
                >
                  <MenuItem value="Uganda">🇺🇬 Uganda</MenuItem>
                  <MenuItem value="Kenya">🇰🇪 Kenya</MenuItem>
                  <MenuItem value="Tanzania">🇹🇿 Tanzania</MenuItem>
                  <MenuItem value="Rwanda">🇷🇼 Rwanda</MenuItem>
                  <MenuItem value="Burundi">🇧🇮 Burundi</MenuItem>
                  <MenuItem value="South Sudan">🇸🇸 South Sudan</MenuItem>
                  <MenuItem value="Ethiopia">🇪🇹 Ethiopia</MenuItem>
                  <MenuItem value="Somalia">🇸🇴 Somalia</MenuItem>
                  <MenuItem value="Djibouti">🇩🇯 Djibouti</MenuItem>
                  <MenuItem value="Eritrea">🇪🇷 Eritrea</MenuItem>
                  <MenuItem value="Sudan">🇸🇩 Sudan</MenuItem>
                  <MenuItem value="Other">🌍 Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Preferred Date *"
                type="date"
                value={bookingData.preferred_date}
                onChange={(e) => setBookingData({ ...bookingData, preferred_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                error={!bookingData.preferred_date && submitting}
                helperText={!bookingData.preferred_date && submitting ? 'Preferred date is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Preferred Time"
                value={bookingData.preferred_time}
                onChange={(e) => setBookingData({ ...bookingData, preferred_time: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (Optional)"
                multiline
                rows={3}
                value={bookingData.message}
                onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                placeholder="Any special requirements..."
              />
            </Grid>

            {/* Additional Services */}
            {additionalServices.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Additional Services (Optional)
                </Typography>
                <FormGroup>
                  {additionalServices.map((service) => (
                    <FormControlLabel
                      key={service.id}
                      control={
                        <Checkbox
                          checked={bookingData.additional_service_ids.map(id => String(id)).includes(String(service.id))}
                          onChange={(e) => {
                            const serviceId = String(service.id);
                            if (e.target.checked) {
                              setBookingData({
                                ...bookingData,
                                additional_service_ids: [
                                  ...bookingData.additional_service_ids,
                                  serviceId
                                ]
                              });
                            } else {
                              setBookingData({
                                ...bookingData,
                                additional_service_ids: bookingData.additional_service_ids.filter(
                                  id => String(id) !== serviceId
                                )
                              });
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {service.name}
                          </Typography>
                          {service.description && (
                            <Typography variant="caption" color="text.secondary">
                              {service.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalUnitDetails;

