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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  AttachMoney,
  Bed,
  Bathtub,
  People as GuestsIcon,
  ArrowForwardIos,
  ArrowBackIos,
  Close,
  CheckCircle,
  Phone,
  CreditCard,
  Wifi,
  LocalParking,
  Pool,
  AcUnit,
  Tv,
  Kitchen,
  CalendarToday,
  Radio as RadioIcon
} from '@mui/icons-material';
import axios from 'axios';

const AirbnbDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [airbnb, setAirbnb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openImageViewer, setOpenImageViewer] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1=Guest Info, 2=Review & Submit
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_username: '',
    guest_date_of_birth: '',
    check_in: '',
    check_out: '',
    number_of_guests: 1,
    special_requests: ''
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    loadAirbnb();
  }, [id]);

  const loadAirbnb = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://carryit-backend.onrender.com/api/v1/airbnb/public`);
      const foundAirbnb = response.data.find(a => a.id === parseInt(id));
      
      if (foundAirbnb) {
        // Parse images
        if (foundAirbnb.images && typeof foundAirbnb.images === 'string') {
          foundAirbnb.images = foundAirbnb.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else if (!foundAirbnb.images) {
          foundAirbnb.images = [];
        }
        setAirbnb(foundAirbnb);
      } else {
        showAlert('error', 'Property not found');
        setTimeout(() => navigate('/airbnb'), 2000);
      }
    } catch (error) {
      console.error('Error loading Airbnb:', error);
      showAlert('error', 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? (airbnb?.images?.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === (airbnb?.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const calculateBookingCost = () => {
    if (!airbnb || !bookingData.check_in || !bookingData.check_out) {
      return null;
    }
    
    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights < 1) {
      return null;
    }
    
    const pricePerNight = parseFloat(airbnb.price_per_night);
    const totalAmount = pricePerNight * nights;
    const prepaymentAmount = totalAmount * 0.5;
    const remainingAmount = totalAmount - prepaymentAmount;
    
    return {
      nights,
      pricePerNight,
      totalAmount,
      prepaymentAmount,
      remainingAmount,
      currency: airbnb.currency
    };
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!bookingData.guest_name || bookingData.guest_name.length < 2) {
      errors.guest_name = 'Full name is required';
    }
    if (!bookingData.guest_phone || bookingData.guest_phone.length < 10) {
      errors.guest_phone = 'Valid phone number is required';
    }
    if (!bookingData.guest_email) {
      errors.guest_email = 'Email is required';
    }
    if (!bookingData.check_in) {
      errors.check_in = 'Check-in date is required';
    }
    if (!bookingData.check_out) {
      errors.check_out = 'Check-out date is required';
    }
    
    const cost = calculateBookingCost();
    if (!cost || cost.nights < 1) {
      errors.dates = 'Check-out must be after check-in';
    }
    
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (bookingStep === 1 && validateStep1()) {
      setBookingStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (bookingStep === 2) {
      setBookingStep(1);
      setBookingErrors({});
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Create booking
      const response = await axios.post('https://carryit-backend.onrender.com/api/v1/airbnb/bookings', {
        airbnb_id: airbnb.id,
        guest_name: bookingData.guest_name,
        guest_email: bookingData.guest_email,
        guest_phone: bookingData.guest_phone,
        guest_username: bookingData.guest_username || null,
        guest_date_of_birth: bookingData.guest_date_of_birth || null,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        number_of_guests: parseInt(bookingData.number_of_guests),
        special_requests: bookingData.special_requests || null,
        payment_timing: 'pay_later',
        payment_method: 'pending',
        payment_method_type: 'pending'
      });
      
      setCreatedBookingId(response.data.id);
      showAlert('success', `Booking request submitted! Booking ID: ${response.data.id}. CarryIT will contact you shortly.`);
      
      // Reset form
      setBookingDialog(false);
      setBookingStep(1);
      setBookingData({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_username: '',
        guest_date_of_birth: '',
        check_in: '',
        check_out: '',
        number_of_guests: 1,
        special_requests: ''
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      showAlert('error', error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi />;
    if (lower.includes('parking')) return <LocalParking />;
    if (lower.includes('pool')) return <Pool />;
    if (lower.includes('ac') || lower.includes('air')) return <AcUnit />;
    if (lower.includes('tv')) return <Tv />;
    if (lower.includes('kitchen')) return <Kitchen />;
    return <CheckCircle />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!airbnb) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Property not found</Typography>
        <Button onClick={() => navigate('/airbnb')} sx={{ mt: 2 }}>Go Back</Button>
      </Container>
    );
  }

  const cost = calculateBookingCost();

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/airbnb')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#333', fontWeight: 600 }}>
            {airbnb.title}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setBookingDialog(true)}
            disabled={airbnb.is_booked}
            sx={{
              background: airbnb.is_booked ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {airbnb.is_booked ? 'Booked' : 'Book Now'}
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
              {airbnb.images && airbnb.images.length > 0 ? (
                <>
                  <Box
                    component="img"
                    src={airbnb.images[currentImageIndex]}
                    alt={airbnb.title}
                    sx={{
                      width: '100%',
                      height: isMobile ? 300 : 500,
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => setOpenImageViewer(true)}
                  />
                  {airbnb.images.length > 1 && (
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
                        {currentImageIndex + 1} / {airbnb.images.length}
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
                  <Bed sx={{ fontSize: 100, color: '#999' }} />
                </Box>
              )}
            </Paper>

            {/* Thumbnail Gallery */}
            {airbnb.images && airbnb.images.length > 1 && (
              <Box sx={{ mt: 2 }}>
                <ImageList cols={isMobile ? 4 : 6} gap={8}>
                  {airbnb.images.map((image, index) => (
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
                        alt={`${airbnb.title} ${index + 1}`}
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
                {airbnb.description}
              </Typography>
            </Paper>

            {/* Features & Amenities */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Property Features
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Bed sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Bedrooms
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {airbnb.bedrooms}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Bathtub sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Bathrooms
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {airbnb.bathrooms}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GuestsIcon sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Max Guests
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {airbnb.max_guests}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {airbnb.amenities && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Amenities
                  </Typography>
                  <List>
                    {airbnb.amenities.split(',').map((amenity, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ color: '#667eea' }}>
                          {getAmenityIcon(amenity)}
                        </ListItemIcon>
                        <ListItemText primary={amenity.trim()} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>

            {/* House Rules */}
            {airbnb.house_rules && (
              <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  House Rules
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {airbnb.house_rules}
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Price Card */}
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 80 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {airbnb.currency} {parseFloat(airbnb.price_per_night).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /night
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={airbnb.is_available}
                  color={airbnb.is_available === 'available' ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
                {airbnb.is_booked && (
                  <Chip
                    label="Booked"
                    sx={{
                      bgcolor: '#ff5722',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(255,87,34,0.4)'
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ color: '#667eea' }} />
                <Typography variant="body2" color="text.secondary">
                  {airbnb.location}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={600} gutterBottom>
                Payment Details
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>50% Prepayment Required</strong>
                </Typography>
                <Typography variant="caption">
                  Remaining 50% paid at check-in
                </Typography>
              </Alert>

              {airbnb.is_booked ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    This property is currently booked
                  </Typography>
                  <Typography variant="caption">
                    Check back later or browse other available properties
                  </Typography>
                </Alert>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setBookingDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5
                  }}
                >
                  Book This Property
                </Button>
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
            zIndex: 1,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <Close />
        </IconButton>
        <Box sx={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          {airbnb.images && airbnb.images[currentImageIndex] && (
            <img
              src={airbnb.images[currentImageIndex]}
              alt={airbnb.title}
              style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain' }}
            />
          )}
          {airbnb.images && airbnb.images.length > 1 && (
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

      {/* Booking Dialog - Complete 3-Step Form */}
      <Dialog open={bookingDialog} onClose={() => { setBookingDialog(false); setBookingStep(1); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 50, color: '#667eea', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {bookingStep === 1 ? 'Guest Information' : 'Review & Submit'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {airbnb.title}
              </Typography>
            </Box>
          </Box>
          
          {/* Step Indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
            {[1, 2].map((step) => (
              <Box
                key={step}
                sx={{
                  width: 60,
                  height: 4,
                  bgcolor: bookingStep >= step ? '#667eea' : '#e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {/* STEP 1: Guest Information */}
          {bookingStep === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  50% Prepayment Required
                </Typography>
                <Typography variant="caption">
                  You'll need to pay 50% upfront to confirm your booking. The remaining amount is paid at check-in.
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={bookingData.guest_name}
                    onChange={(e) => setBookingData({...bookingData, guest_name: e.target.value})}
                    error={!!bookingErrors.guest_name}
                    helperText={bookingErrors.guest_name}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username or ID"
                    value={bookingData.guest_username}
                    onChange={(e) => setBookingData({...bookingData, guest_username: e.target.value})}
                    helperText="Optional: Passport number, ID, or username"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={bookingData.guest_date_of_birth}
                    onChange={(e) => setBookingData({...bookingData, guest_date_of_birth: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: new Date().toISOString().split('T')[0] }}
                    helperText="Optional"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={bookingData.guest_phone}
                    onChange={(e) => setBookingData({...bookingData, guest_phone: e.target.value})}
                    error={!!bookingErrors.guest_phone}
                    helperText={bookingErrors.guest_phone}
                    placeholder="+256 700 000 000"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={bookingData.guest_email}
                    onChange={(e) => setBookingData({...bookingData, guest_email: e.target.value})}
                    error={!!bookingErrors.guest_email}
                    helperText={bookingErrors.guest_email}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Check-in Date *"
                    type="date"
                    value={bookingData.check_in}
                    onChange={(e) => setBookingData({...bookingData, check_in: e.target.value})}
                    error={!!bookingErrors.check_in}
                    helperText={bookingErrors.check_in}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Check-out Date *"
                    type="date"
                    value={bookingData.check_out}
                    onChange={(e) => setBookingData({...bookingData, check_out: e.target.value})}
                    error={!!bookingErrors.check_out}
                    helperText={bookingErrors.check_out}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: bookingData.check_in || new Date().toISOString().split('T')[0] }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Number of Guests *"
                    type="number"
                    value={bookingData.number_of_guests}
                    onChange={(e) => setBookingData({...bookingData, number_of_guests: e.target.value})}
                    error={!!bookingErrors.number_of_guests}
                    helperText={bookingErrors.number_of_guests || `Maximum: ${airbnb?.max_guests || 0} guests`}
                    inputProps={{ min: 1, max: airbnb?.max_guests || 10 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Requests (Optional)"
                    multiline
                    rows={3}
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({...bookingData, special_requests: e.target.value})}
                    placeholder="Any special requirements or requests..."
                  />
                </Grid>
              </Grid>

              {/* Cost Preview */}
              {bookingData.check_in && bookingData.check_out && (() => {
                const cost = calculateBookingCost();
                return cost && cost.nights >= 1 ? (
                  <Paper sx={{ p: 2, mt: 3, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Booking Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {cost.nights} night{cost.nights > 1 ? 's' : ''} × {cost.currency} {cost.pricePerNight.toLocaleString()}/night
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {cost.currency} {cost.totalAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="primary">
                        Prepayment (50%) *
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {cost.currency} {cost.prepaymentAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining (at check-in)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cost.currency} {cost.remainingAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ) : null;
              })()}
            </Box>
          )}

          {/* STEP 2: Payment Method */}
          {bookingStep === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  Review your booking details and submit your request
                </Typography>
                <Typography variant="caption">
                  CarryIT will contact you via email to complete the payment process (50% prepayment required)
                </Typography>
              </Alert>

              <Paper sx={{ p: 3, mb: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  Guest Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Name:</Typography>
                    <Typography variant="body2" fontWeight={600}>{bookingData.guest_name}</Typography>
                  </Grid>
                  {bookingData.guest_username && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Username/ID:</Typography>
                      <Typography variant="body2" fontWeight={600}>{bookingData.guest_username}</Typography>
                    </Grid>
                  )}
                  {bookingData.guest_date_of_birth && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Date of Birth:</Typography>
                      <Typography variant="body2" fontWeight={600}>{bookingData.guest_date_of_birth}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Phone:</Typography>
                    <Typography variant="body2" fontWeight={600}>{bookingData.guest_phone}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Email:</Typography>
                    <Typography variant="body2" fontWeight={600}>{bookingData.guest_email}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3, mb: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  Booking Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Check-in:</Typography>
                    <Typography variant="body2" fontWeight={600}>{bookingData.check_in}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Check-out:</Typography>
                    <Typography variant="body2" fontWeight={600}>{bookingData.check_out}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Number of Guests:</Typography>
                    <Typography variant="body2" fontWeight={600}>{bookingData.number_of_guests}</Typography>
                  </Grid>
                  {(() => {
                    const cost = calculateBookingCost();
                    return cost ? (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Number of Nights:</Typography>
                        <Typography variant="body2" fontWeight={600}>{cost.nights}</Typography>
                      </Grid>
                    ) : null;
                  })()}
                </Grid>
                {bookingData.special_requests && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Special Requests:</Typography>
                    <Typography variant="body2">{bookingData.special_requests}</Typography>
                  </Box>
                )}
              </Paper>

              <Paper sx={{ p: 3, mb: 2, bgcolor: '#e8f5e9' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="success.main">
                  Payment Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  CarryIT will contact you to arrange payment of 50% prepayment to confirm your booking.
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  Contact: stuartkevinz852@gmail.com | carryit@gmail.com | +256754577922
                </Typography>
              </Paper>

              {(() => {
                const cost = calculateBookingCost();
                return cost ? (
                  <Paper sx={{ p: 3, bgcolor: '#fff3e0' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom color="warning.main">
                      Cost Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Amount:</Typography>
                      <Typography variant="body2" fontWeight={600}>{cost.currency} {cost.totalAmount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Prepayment (50%):</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary">{cost.currency} {cost.prepaymentAmount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Remaining:</Typography>
                      <Typography variant="body2" fontWeight={600}>{cost.currency} {cost.remainingAmount.toLocaleString()}</Typography>
                    </Box>
                  </Paper>
                ) : null;
              })()}
            </Box>
          )}

        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={bookingStep === 1 ? () => { setBookingDialog(false); setBookingStep(1); } : handlePreviousStep} 
            sx={{ textTransform: 'none' }}
            disabled={submitting}
          >
            {bookingStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {bookingStep === 1 ? (
            <Button
              variant="contained"
              onClick={handleNextStep}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 4
              }}
            >
              Next: Review & Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleBookingSubmit}
              disabled={submitting}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 4
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Booking Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AirbnbDetails;

