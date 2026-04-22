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
  Close,
  Share,
  FavoriteBorder,
} from '@mui/icons-material';
import axios from 'axios';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend-su8h.onrender.com/api/v1';

const RentalUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    booking_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/rental-units/public`);
      const foundUnit = response.data.find(u => String(u.id) === String(id));
      
      if (foundUnit) {
        if (foundUnit.images && typeof foundUnit.images === 'string') {
          foundUnit.images = foundUnit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else if (!foundUnit.images) {
          foundUnit.images = [];
        }
        setUnit(foundUnit);
      } else {
        setSnackbar({ open: true, message: 'Property not found', severity: 'error' });
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Error loading unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!bookingForm.contact_name || !bookingForm.contact_phone) {
      setSnackbar({ open: true, message: 'Please fill in required fields.', severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        rental_unit_id: unit.id,
        ...bookingForm,
        booking_date: new Date(bookingForm.booking_date).toISOString()
      };
      await axios.post(`${API_BASE_URL}/rental-units/public/book-inspection`, bookingData);
      setSnackbar({ open: true, message: 'Inspection booked successfully!', severity: 'success' });
      setBookingDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to book inspection.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (!unit) return null;

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
          {unit.title || unit.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: 'underline' }}>
              {unit.location}
            </Typography>
          </Box>
        </Box>

        {/* Premium Image Gallery Grid (Airbnb Style) */}
        <Grid container spacing={1} sx={{ height: { xs: 300, md: 500 }, mb: 4, borderRadius: '16px', overflow: 'hidden' }}>
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Box 
              component="img" 
              src={unit.images?.[0] || 'https://via.placeholder.com/800x600'} 
              sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
            />
          </Grid>
          {!isMobile && (
            <Grid item md={6} sx={{ height: '100%' }}>
              <Grid container spacing={1} sx={{ height: '100%' }}>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={unit.images?.[1] || unit.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={unit.images?.[2] || unit.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={unit.images?.[3] || unit.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Box component="img" src={unit.images?.[4] || unit.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>

        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Entire {unit.unit_type?.replace('_', ' ') || 'unit'} hosted by CarryIT
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {unit.bedrooms || 0} bedrooms • {unit.bathrooms || 0} bathrooms
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Description</Typography>
              <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8 }}>
                {unit.description || 'No description available for this property.'}
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>What this place offers</Typography>
              <Grid container spacing={2}>
                {(unit.amenities || 'Parking, Water, Security').split(',').map((amenity, i) => (
                  <Grid item xs={6} key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Home sx={{ color: '#717171' }} />
                      <Typography variant="body1">{amenity.trim()}</Typography>
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
                  {unit.currency || 'UGX'} {parseInt(unit.monthly_rent || 0).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ display: 'inline', color: 'text.secondary', ml: 1 }}>
                  / month
                </Typography>
              </Box>

              <Box sx={{ border: '1px solid #B0B0B0', borderRadius: '8px', mb: 3 }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid #B0B0B0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>INSPECTION FEE</Typography>
                  <Typography variant="body1">{unit.currency || 'UGX'} {parseInt(unit.inspection_fee || 30000).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>AVAILABILITY</Typography>
                  <Typography variant="body1" sx={{ color: unit.status === 'available' ? 'green' : 'red', fontWeight: 600 }}>
                    {unit.status === 'available' ? 'Available now' : 'Occupied'}
                  </Typography>
                </Box>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                onClick={() => setBookingDialog(true)}
                sx={{ 
                  py: 1.5, 
                  borderRadius: '8px', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a6fd8' }
                }}
              >
                Book Inspection
              </Button>
              
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                You won't be charged yet
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ textDecoration: 'underline' }}>Service fee</Typography>
                  <Typography variant="body1">UGX 0</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>Total</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>{unit.currency || 'UGX'} {parseInt(unit.monthly_rent || 0).toLocaleString()}</Typography>
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
          Confirm Inspection
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Our agent will contact you to schedule the viewing for {unit.title}.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Full Name" 
                variant="outlined"
                value={bookingForm.contact_name}
                onChange={(e) => setBookingForm({...bookingForm, contact_name: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Phone" 
                variant="outlined"
                value={bookingForm.contact_phone}
                onChange={(e) => setBookingForm({...bookingForm, contact_phone: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Inspection Date" 
                type="date" 
                InputLabelProps={{ shrink: true }}
                value={bookingForm.booking_date}
                onChange={(e) => setBookingForm({...bookingForm, booking_date: e.target.value})}
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
            sx={{ px: 4, borderRadius: '12px', fontWeight: 700, bgcolor: '#667eea' }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Book Now'}
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

export default RentalUnitDetails;
