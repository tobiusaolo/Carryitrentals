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
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  AttachMoney,
  Bed,
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
    preferred_date: '',
    preferred_time: 'morning',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://carryit-backend.onrender.com/api/v1/rental-units/public`);
      const foundUnit = response.data.find(u => u.id === parseInt(id));
      
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

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? (unit?.images?.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === (unit?.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const handleBookingSubmit = async () => {
    if (!bookingData.full_name || !bookingData.phone_number || !bookingData.preferred_date) {
      showAlert('error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('https://carryit-backend.onrender.com/api/v1/inspection-bookings/public', {
        rental_unit_id: unit.id,
        contact_name: bookingData.full_name,
        contact_phone: bookingData.phone_number,
        contact_email: bookingData.email || null,
        booking_date: new Date(bookingData.preferred_date).toISOString(),
        preferred_time_slot: bookingData.preferred_time,
        message: bookingData.message || null
      });

      showAlert('success', 'Inspection booking submitted successfully! We will contact you soon.');
      setBookingDialog(false);
      setBookingData({
        full_name: '',
        phone_number: '',
        email: '',
        preferred_date: '',
        preferred_time: 'morning',
        message: ''
      });
    } catch (error) {
      showAlert('error', error.response?.data?.detail || 'Failed to submit booking');
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

            {/* Features */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Property Features
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Bed sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Bedrooms
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {unit.bedrooms || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {unit.unit_type || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ color: '#667eea' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Inspections
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {unit.inspection_bookings_count || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Price Card */}
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 80 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  UGX {parseInt(unit.rental_price).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /month
                </Typography>
              </Box>

              <Chip
                label={unit.status}
                color={unit.status === 'available' ? 'success' : 'default'}
                sx={{ mb: 3, fontWeight: 600 }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ color: '#667eea' }} />
                <Typography variant="body2" color="text.secondary">
                  {unit.location || 'Location not specified'}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={600} gutterBottom>
                Inspection Fee
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>UGX 30,000</strong> per house
                </Typography>
                <Typography variant="caption">
                  Fees for multiple houses are negotiable
                </Typography>
              </Alert>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setBookingDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  mb: 2
                }}
              >
                Book Inspection Now
              </Button>

              {/* Agent Info */}
              {unit.agent_name && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Contact Agent
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {unit.agent_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
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
            <Typography variant="body2">
              <strong>Inspection Fee: UGX 30,000</strong>
            </Typography>
            <Typography variant="caption">
              Fees for multiple houses are negotiable
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name *"
                value={bookingData.full_name}
                onChange={(e) => setBookingData({ ...bookingData, full_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={bookingData.phone_number}
                onChange={(e) => setBookingData({ ...bookingData, phone_number: e.target.value })}
                placeholder="+256 700 000 000"
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
              <TextField
                fullWidth
                label="Preferred Date *"
                type="date"
                value={bookingData.preferred_date}
                onChange={(e) => setBookingData({ ...bookingData, preferred_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
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

