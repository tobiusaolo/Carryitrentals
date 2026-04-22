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
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Bed,
  Bathtub,
  Home,
  Share,
  FavoriteBorder,
  Wifi,
  Kitchen,
  AcUnit,
  Tv,
} from '@mui/icons-material';
import axios from 'axios';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend-su8h.onrender.com/api/v1';

const AirbnbDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [airbnb, setAirbnb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    number_of_guests: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadAirbnb();
  }, [id]);

  const loadAirbnb = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/airbnb/public`);
      const foundAirbnb = response.data.find(a => String(a.id) === String(id));
      
      if (foundAirbnb) {
        if (foundAirbnb.images && typeof foundAirbnb.images === 'string') {
          foundAirbnb.images = foundAirbnb.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else if (!foundAirbnb.images) {
          foundAirbnb.images = [];
        }
        setAirbnb(foundAirbnb);
      } else {
        setSnackbar({ open: true, message: 'Stay not found', severity: 'error' });
        setTimeout(() => navigate('/airbnb'), 2000);
      }
    } catch (error) {
      console.error('Error loading airbnb:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!bookingForm.guest_name || !bookingForm.guest_phone || !bookingForm.check_in || !bookingForm.check_out) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        airbnb_id: airbnb.id,
        ...bookingForm,
        payment_timing: 'pay_later',
        payment_method: 'pending'
      };
      await axios.post(`${API_BASE_URL}/airbnb/bookings`, bookingData);
      setSnackbar({ open: true, message: 'Booking request sent successfully!', severity: 'success' });
      setBookingDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send booking request.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={5} color="secondary" />
      </Box>
    );
  }

  if (!airbnb) return null;

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      <PublicHeader />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            sx={{ color: '#222', textTransform: 'none', fontWeight: 600 }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<Share />} sx={{ color: '#222', textTransform: 'none', fontWeight: 600 }}>Share</Button>
            <Button startIcon={<FavoriteBorder />} sx={{ color: '#222', textTransform: 'none', fontWeight: 600 }}>Save</Button>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#222' }}>
          {airbnb.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ★ 5.0 • 12 reviews
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: 'underline' }}>
              {airbnb.location}
            </Typography>
          </Box>
        </Box>

        {/* Premium Image Gallery Grid */}
        <Grid container spacing={1} sx={{ height: { xs: 300, md: 500 }, mb: 4, borderRadius: '16px', overflow: 'hidden' }}>
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Box 
              component="img" 
              src={airbnb.images?.[0] || 'https://via.placeholder.com/800x600'} 
              sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
            />
          </Grid>
          {!isMobile && (
            <Grid item md={6} sx={{ height: '100%' }}>
              <Grid container spacing={1} sx={{ height: '100%' }}>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={airbnb.images?.[1] || airbnb.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={airbnb.images?.[2] || airbnb.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={airbnb.images?.[3] || airbnb.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={airbnb.images?.[4] || airbnb.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>

        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Entire {airbnb.property_type || 'home'} hosted by CarryIT
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {airbnb.max_guests || 1} guests • {airbnb.bedrooms || 0} bedrooms • {airbnb.bathrooms || 0} bathrooms
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>About this place</Typography>
              <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                {airbnb.description || 'Welcome to this beautiful vacation home. Experience comfort and style in the heart of Uganda.'}
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>What this place offers</Typography>
              <Grid container spacing={2}>
                {[
                  { icon: <Wifi />, label: 'Fast Wifi' },
                  { icon: <Kitchen />, label: 'Fully equipped kitchen' },
                  { icon: <AcUnit />, label: 'Air conditioning' },
                  { icon: <Tv />, label: 'Smart TV' },
                ].map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.icon}
                      <Typography variant="body1">{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Sticky Booking Widget */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '16px', 
                border: '1px solid #DDD', 
                position: 'sticky', 
                top: 100,
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, display: 'inline' }}>
                  {airbnb.currency || '$'}{parseInt(airbnb.price_per_night || 0).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ display: 'inline', color: 'text.secondary', ml: 1 }}>
                  / night
                </Typography>
              </Box>

              <Box sx={{ border: '1px solid #B0B0B0', borderRadius: '8px', mb: 3 }}>
                <Grid container>
                  <Grid item xs={6} sx={{ p: 1.5, borderRight: '1px solid #B0B0B0', borderBottom: '1px solid #B0B0B0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>CHECK-IN</Typography>
                    <Typography variant="body2">Add date</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ p: 1.5, borderBottom: '1px solid #B0B0B0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>CHECKOUT</Typography>
                    <Typography variant="body2">Add date</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>GUESTS</Typography>
                    <Typography variant="body2">{airbnb.max_guests || 1} guest</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                onClick={() => setBookingDialog(true)}
                disabled={airbnb.is_booked}
                sx={{ 
                  py: 1.5, 
                  borderRadius: '8px', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  bgcolor: '#ff385c',
                  '&:hover': { bgcolor: '#e31c5f' }
                }}
              >
                {airbnb.is_booked ? 'Already Booked' : 'Reserve'}
              </Button>
              
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                You won't be charged yet
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ textDecoration: 'underline' }}>Service fee</Typography>
                  <Typography variant="body1">$0</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>Total before taxes</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>{airbnb.currency || '$'}{parseInt(airbnb.price_per_night || 0).toLocaleString()}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Booking Dialog */}
      <Dialog 
        open={bookingDialog} 
        onClose={() => setBookingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
          Confirm Reservation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send a booking request for {airbnb.title}.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Full Name" 
                variant="outlined"
                value={bookingForm.guest_name}
                onChange={(e) => setBookingForm({...bookingForm, guest_name: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Phone" 
                variant="outlined"
                value={bookingForm.guest_phone}
                onChange={(e) => setBookingForm({...bookingForm, guest_phone: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Guests" 
                type="number"
                variant="outlined"
                value={bookingForm.number_of_guests}
                onChange={(e) => setBookingForm({...bookingForm, number_of_guests: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Check-in" 
                type="date" 
                InputLabelProps={{ shrink: true }}
                value={bookingForm.check_in}
                onChange={(e) => setBookingForm({...bookingForm, check_in: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Check-out" 
                type="date" 
                InputLabelProps={{ shrink: true }}
                value={bookingForm.check_out}
                onChange={(e) => setBookingForm({...bookingForm, check_out: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setBookingDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleBookingSubmit}
            disabled={submitting}
            sx={{ px: 4, borderRadius: '12px', fontWeight: 700, bgcolor: '#ff385c' }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Request to Book'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AirbnbDetails;
