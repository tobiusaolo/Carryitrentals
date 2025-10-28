import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fade,
  Grow,
  Zoom,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  ImageList,
  ImageListItem,
  Slide,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Bed,
  Bathtub,
  Apartment,
  AttachMoney,
  LocationOn,
  Event as CalendarIcon,
  FilterList,
  Menu as MenuIcon,
  Close as CloseIcon,
  Email,
  Phone,
  Visibility,
  ChevronLeft,
  ChevronRight,
  FavoriteBorder,
  Star
} from '@mui/icons-material';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PublicRentals = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [viewingImages, setViewingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    booking_date: '',
    preferred_time_slot: 'morning',
    message: ''
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    unit_type: '',
    min_price: '',
    max_price: ''
  });

  useEffect(() => {
    loadRentalUnits();
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, units]);

  const loadRentalUnits = async () => {
    try {
      setLoading(true);
      // Public API call - no authentication required
      const response = await axios.get('https://carryit-backend.onrender.com/api/v1/rental-units/public');
      
      // Parse images
      const unitsWithImages = response.data.map(unit => {
        if (unit.images && typeof unit.images === 'string') {
          unit.images = unit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else if (!unit.images) {
          unit.images = [];
        }
        return unit;
      });
      
      // Only show available units
      const availableUnits = unitsWithImages.filter(unit => unit.status === 'available');
      setUnits(availableUnits);
      setFilteredUnits(availableUnits);
    } catch (err) {
      console.error('Error loading rental units:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...units];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(unit =>
        unit.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        unit.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
        unit.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(unit =>
        unit.location?.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    // Unit type filter
    if (filters.unit_type) {
      filtered = filtered.filter(unit => unit.unit_type === filters.unit_type);
    }

    // Price range filter
    if (filters.min_price) {
      filtered = filtered.filter(unit => parseFloat(unit.monthly_rent) >= parseFloat(filters.min_price));
    }
    if (filters.max_price) {
      filtered = filtered.filter(unit => parseFloat(unit.monthly_rent) <= parseFloat(filters.max_price));
    }

    setFilteredUnits(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const validateBookingForm = () => {
    const errors = {};
    
    if (!bookingForm.contact_name || bookingForm.contact_name.length < 2) {
      errors.contact_name = 'Name is required (minimum 2 characters)';
    }
    
    if (!bookingForm.contact_phone || bookingForm.contact_phone.length < 10) {
      errors.contact_phone = 'Valid phone number is required (minimum 10 digits)';
    }
    
    if (!bookingForm.booking_date) {
      errors.booking_date = 'Preferred inspection date is required';
    } else {
      const selectedDate = new Date(bookingForm.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.booking_date = 'Inspection date cannot be in the past';
      }
    }
    
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateBookingForm()) {
      return;
    }
    
    try {
      setSubmittingBooking(true);
      
      // Format date as ISO string for API
      const bookingData = {
        rental_unit_id: selectedUnit.id,
        contact_name: bookingForm.contact_name,
        contact_phone: bookingForm.contact_phone,
        contact_email: bookingForm.contact_email || undefined,
        booking_date: new Date(bookingForm.booking_date).toISOString(),
        preferred_time_slot: bookingForm.preferred_time_slot,
        message: bookingForm.message || undefined
      };
      
      // Call public inspection booking API
      await axios.post('https://carryit-backend.onrender.com/api/v1/rental-units/public/book-inspection', bookingData);
      
      // Success
      setSnackbar({
        open: true,
        message: 'Inspection booked successfully! We will contact you soon.',
        severity: 'success'
      });
      
      // Close dialog and reset form
      setBookingDialog(false);
      setSelectedUnit(null);
      setBookingForm({
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        booking_date: '',
        preferred_time_slot: 'morning',
        message: ''
      });
      setBookingErrors({});
      
      // Reload units to update inspection count
      loadRentalUnits();
    } catch (error) {
      console.error('Error booking inspection:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to book inspection. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleBookingFormChange = (field, value) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (bookingErrors[field]) {
      setBookingErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HomeIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                CarryIT Rentals
              </Typography>
            </Box>

            {/* Menu Items */}
            {!isMobile ? (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button 
                  onClick={() => navigate('/')}
                  sx={{ 
                    color: '#374151',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { color: '#667eea' }
                  }}
                >
                  Rentals
                </Button>
                <Button 
                  onClick={() => navigate('/airbnb')}
                  sx={{ 
                    color: '#374151',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { color: '#667eea' }
                  }}
                >
                  Airbnb
                </Button>
                <Button 
                  onClick={() => navigate('/guidelines')}
                  sx={{ 
                    color: '#374151',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { color: '#667eea' }
                  }}
                >
                  Guidelines
                </Button>
              </Box>
            ) : (
              <IconButton onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Rentals" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/airbnb'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Airbnb" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/guidelines'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Guidelines" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Fade in={true} timeout={800}>
          <Box 
            sx={{ 
              mb: 6,
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              px: { xs: 2, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                pointerEvents: 'none'
              }
            }}
          >
            <Zoom in={true} timeout={1000}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h2" 
                  fontWeight={900} 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    color: 'white',
                    textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                    letterSpacing: '-0.02em',
                    mb: 2
                  }}
                >
                  Discover Your Perfect Home
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    color: 'rgba(255,255,255,0.95)',
                    fontWeight: 400,
                    maxWidth: '800px',
                    mx: 'auto',
                    mb: 3,
                    lineHeight: 1.6
                  }}
                >
                  Explore {filteredUnits.length}+ verified rental properties across East Africa. From modern apartments to spacious family homes.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
                  <Chip 
                    icon={<LocationOn sx={{ color: 'white !important' }} />}
                    label="Uganda, Kenya, Tanzania & More"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      px: 1,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                  <Chip 
                    icon={<Star sx={{ color: 'white !important' }} />}
                    label="Verified Listings"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      px: 1,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                  <Chip 
                    icon={<HomeIcon sx={{ color: 'white !important' }} />}
                    label="Instant Booking"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      px: 1,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                </Box>
              </Box>
            </Zoom>
          </Box>
        </Fade>

        {/* Filters */}
        <Grow in={true} timeout={800}>
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search by location, title..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#667eea' }} />
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
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={filters.country}
                      label="Country"
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Countries</MenuItem>
                      <MenuItem value="Uganda">Uganda</MenuItem>
                      <MenuItem value="Kenya">Kenya</MenuItem>
                      <MenuItem value="Tanzania">Tanzania</MenuItem>
                      <MenuItem value="Rwanda">Rwanda</MenuItem>
                      <MenuItem value="Burundi">Burundi</MenuItem>
                      <MenuItem value="South Sudan">South Sudan</MenuItem>
                      <MenuItem value="Ethiopia">Ethiopia</MenuItem>
                      <MenuItem value="Somalia">Somalia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Unit Type</InputLabel>
                    <Select
                      value={filters.unit_type}
                      label="Unit Type"
                      onChange={(e) => handleFilterChange('unit_type', e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="single">Single Room</MenuItem>
                      <MenuItem value="double">Double Room</MenuItem>
                      <MenuItem value="studio">Studio</MenuItem>
                      <MenuItem value="one_bedroom">1 Bedroom</MenuItem>
                      <MenuItem value="two_bedroom">2 Bedroom</MenuItem>
                      <MenuItem value="three_bedroom">3 Bedroom</MenuItem>
                      <MenuItem value="penthouse">Penthouse</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField
                    fullWidth
                    label="Min Price"
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField
                    fullWidth
                    label="Max Price"
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setFilters({ search: '', country: '', unit_type: '', min_price: '', max_price: '' })}
                    sx={{
                      py: 1.8,
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* No Results */}
        {!loading && filteredUnits.length === 0 && (
          <Fade in={true}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <HomeIcon sx={{ fontSize: 80, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No rental units found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search criteria
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Rental Units Grid */}
        <Grid container spacing={2.5}>
          {filteredUnits.map((unit, index) => (
            <Grid item xs={12} sm={6} md={4} key={unit.id}>
              <Grow in={true} timeout={600 + (index * 100)}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      transform: 'scale(1.02)'
                    }
                  }}
                  onClick={() => navigate(`/rental/${unit.id}`)}
                >
                  {/* Unit Image - Compact Size */}
                  <Box
                    sx={{
                      height: 220,
                      background: unit.images?.[0]
                        ? `url(${unit.images[0]}) center/cover`
                        : 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)',
                      position: 'relative',
                      borderRadius: '16px 16px 0 0'
                    }}
                  >
                    {/* Guest Favorite Badge */}
                    {unit.inspection_bookings_count > 3 && (
                      <Chip
                        label="Popular"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'white',
                          color: '#222',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          borderRadius: '12px',
                          px: 1
                        }}
                      />
                    )}
                    
                    {/* Favorite Heart Icon */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        width: 32,
                        height: 32,
                        '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <FavoriteBorder sx={{ fontSize: 18, color: '#222' }} />
                    </IconButton>

                    {!unit.images?.[0] && (
                      <HomeIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    )}
                  </Box>

                  <CardContent sx={{ p: 2, pb: 2 }}>
                    {/* Property Type & Location */}
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color="#222"
                      sx={{ mb: 0.5 }}
                      noWrap
                    >
                      {unit.unit_type?.replace('_', ' ')} in {unit.location?.split(',')[0] || 'Location'}
                    </Typography>
                    
                    {/* Features - Subtle */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {unit.bedrooms || 0} bedroom{unit.bedrooms !== 1 ? 's' : ''} · {unit.bathrooms || 0} bath{unit.bathrooms !== 1 ? 's' : ''}
                    </Typography>

                    {/* Price & Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1 }}>
                      <Typography variant="body1" fontWeight={700} color="#222">
                        USh{parseInt(unit.monthly_rent || unit.rental_price || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        monthly
                      </Typography>
                      {unit.inspection_bookings_count > 0 && (
                        <>
                          <Typography variant="caption" color="text.secondary" sx={{ mx: 0.3 }}>
                            •
                          </Typography>
                          <Star sx={{ fontSize: 12, color: '#222' }} />
                          <Typography variant="caption" fontWeight={600} color="#222">
                            {(4.5 + Math.random() * 0.5).toFixed(2)}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* No results message in grid */}
        {!loading && filteredUnits.length === 0 && units.length > 0 && (
          <Fade in={true}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FilterList sx={{ fontSize: 60, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No units match your filters
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setFilters({ search: '', unit_type: '', min_price: '', max_price: '' })}
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
              >
                Clear All Filters
              </Button>
            </Box>
          </Fade>
        )}

        {/* Call to Action */}
        {!loading && filteredUnits.length > 0 && (
          <Fade in={true} timeout={1200}>
            <Box 
              sx={{ 
                mt: 6, 
                p: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>
                List Your Property
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Join thousands of property owners managing their rentals with CarryIT
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#f9fafb',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Get Started Free
              </Button>
            </Box>
          </Fade>
        )}
      </Container>

      {/* Unit Detail Dialog */}
      <Dialog
        open={!!selectedUnit}
        onClose={() => {
          setSelectedUnit(null);
          setCurrentImageIndex(0);
        }}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedUnit && (
          <>
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {selectedUnit.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 18 }} />
                    <Typography variant="body1">{selectedUnit.location}</Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={() => {
                    setSelectedUnit(null);
                    setCurrentImageIndex(0);
                  }}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              {/* Image Gallery */}
              {selectedUnit.images && selectedUnit.images.length > 0 && (
                <Box sx={{ position: 'relative', bgcolor: '#000' }}>
                  <Box
                    component="img"
                    src={selectedUnit.images[currentImageIndex]}
                    alt={`${selectedUnit.title} - Image ${currentImageIndex + 1}`}
                    sx={{
                      width: '100%',
                      height: { xs: 300, md: 400 },
                      objectFit: 'contain'
                    }}
                  />
                  
                  {/* Image Navigation */}
                  {selectedUnit.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? selectedUnit.images.length - 1 : prev - 1
                        )}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === selectedUnit.images.length - 1 ? 0 : prev + 1
                        )}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {currentImageIndex + 1} / {selectedUnit.images.length}
                      </Box>
                    </>
                  )}
                </Box>
              )}

              {/* Image Thumbnails */}
              {selectedUnit.images && selectedUnit.images.length > 1 && (
                <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
                  <ImageList cols={5} gap={8} sx={{ m: 0 }}>
                    {selectedUnit.images.map((img, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          cursor: 'pointer',
                          opacity: currentImageIndex === index ? 1 : 0.6,
                          border: currentImageIndex === index ? '3px solid #667eea' : '3px solid transparent',
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          '&:hover': { opacity: 1 }
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* Unit Details */}
              <Box sx={{ p: 3 }}>
                {/* Price */}
                <Box sx={{ mb: 3, textAlign: 'center', py: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                  <Typography variant="h3" fontWeight={800} color="#667eea">
                    {selectedUnit.currency || 'USD'} {selectedUnit.monthly_rent?.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    per month
                  </Typography>
                </Box>

                {/* Unit Info */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                      <Apartment sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedUnit.unit_type?.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                      <Bed sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Bedrooms
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedUnit.bedrooms}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                      <Bathtub sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Bathrooms
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedUnit.bathrooms}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Description */}
                {selectedUnit.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {selectedUnit.description}
                    </Typography>
                  </Box>
                )}

                {/* Amenities */}
                {selectedUnit.amenities && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Amenities
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedUnit.amenities.split(',').map((amenity, index) => (
                        <Chip
                          key={index}
                          label={amenity.trim()}
                          size="small"
                          sx={{
                            bgcolor: '#eff6ff',
                            color: '#3b82f6',
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Inspection Count */}
                {selectedUnit.inspection_bookings_count > 0 && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #3b82f6' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ color: '#3b82f6' }} />
                      <Typography variant="body1" fontWeight={600} color="#3b82f6">
                        {selectedUnit.inspection_bookings_count} inspection{selectedUnit.inspection_bookings_count !== 1 ? 's' : ''} scheduled
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      This is a popular property! Book your inspection today.
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Agent Info */}
                {selectedUnit.agent_name && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Listed by
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#667eea',
                          fontSize: '1.5rem',
                          fontWeight: 700
                        }}
                      >
                        {selectedUnit.agent_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={700}>
                          {selectedUnit.agent_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Property Agent
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => {
                  setSelectedUnit(null);
                  setCurrentImageIndex(0);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Close
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CalendarIcon />}
                onClick={() => {
                  setBookingDialog(true);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                  }
                }}
              >
                Book Inspection
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Booking Form Dialog */}
      <Dialog
        open={bookingDialog}
        onClose={() => {
          setBookingDialog(false);
          setBookingForm({
            contact_name: '',
            contact_phone: '',
            contact_email: '',
            booking_date: '',
            preferred_time_slot: 'morning',
            message: ''
          });
          setBookingErrors({});
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <CalendarIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Book an Inspection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedUnit?.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, pb: 2 }}>
          {/* Pricing Information */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Inspection Fee: UGX 30,000 per property
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Note: If you have multiple properties chosen for inspection, fees will be further negotiated at the day of inspection.
            </Typography>
          </Alert>

          {/* Booking Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Name Field */}
            <TextField
              fullWidth
              label="Full Name *"
              value={bookingForm.contact_name}
              onChange={(e) => handleBookingFormChange('contact_name', e.target.value)}
              error={!!bookingErrors.contact_name}
              helperText={bookingErrors.contact_name}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />

            {/* Phone Field */}
            <TextField
              fullWidth
              label="Phone Number *"
              value={bookingForm.contact_phone}
              onChange={(e) => handleBookingFormChange('contact_phone', e.target.value)}
              error={!!bookingErrors.contact_phone}
              helperText={bookingErrors.contact_phone}
              placeholder="+256 700 000 000"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />

            {/* Email Field (Optional) */}
            <TextField
              fullWidth
              label="Email (Optional)"
              type="email"
              value={bookingForm.contact_email}
              onChange={(e) => handleBookingFormChange('contact_email', e.target.value)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />

            {/* Date Field */}
            <TextField
              fullWidth
              label="Preferred Inspection Date *"
              type="date"
              value={bookingForm.booking_date}
              onChange={(e) => handleBookingFormChange('booking_date', e.target.value)}
              error={!!bookingErrors.booking_date}
              helperText={bookingErrors.booking_date}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split('T')[0]
              }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />

            {/* Time Slot Field */}
            <FormControl fullWidth>
              <InputLabel>Preferred Time Slot</InputLabel>
              <Select
                value={bookingForm.preferred_time_slot}
                label="Preferred Time Slot"
                onChange={(e) => handleBookingFormChange('preferred_time_slot', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="morning">Morning (8:00 AM - 12:00 PM)</MenuItem>
                <MenuItem value="afternoon">Afternoon (12:00 PM - 4:00 PM)</MenuItem>
                <MenuItem value="evening">Evening (4:00 PM - 7:00 PM)</MenuItem>
              </Select>
            </FormControl>

            {/* Message Field */}
            <TextField
              fullWidth
              label="Additional Message (Optional)"
              value={bookingForm.message}
              onChange={(e) => handleBookingFormChange('message', e.target.value)}
              multiline
              rows={3}
              placeholder="Any specific requirements or questions..."
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setBookingDialog(false);
              setBookingForm({
                contact_name: '',
                contact_phone: '',
                contact_email: '',
                booking_date: '',
                preferred_time_slot: 'morning',
                message: ''
              });
              setBookingErrors({});
            }}
            disabled={submittingBooking}
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmitBooking}
            disabled={submittingBooking}
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {submittingBooking ? <CircularProgress size={24} color="inherit" /> : 'Submit Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicRentals;

