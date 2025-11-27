import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Fade,
  Zoom,
  Paper,
  Divider,
  Avatar,
  AppBar,
  Toolbar,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Search,
  FilterList,
  Bed,
  Bathtub,
  People as GuestsIcon,
  LocationOn,
  AttachMoney,
  ArrowBack,
  ArrowForward,
  CalendarToday,
  Close,
  Home as HomeIcon,
  Menu as MenuIcon,
  Phone,
  CreditCard,
  FavoriteBorder,
  Star,
  Visibility
} from '@mui/icons-material';
import axios from 'axios';
import SocialMediaFloatButtons from '../../components/SocialMediaFloatButtons';
import Footer from '../../components/Footer';

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

const PublicAirbnb = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [airbnbs, setAirbnbs] = useState([]);
  const [filteredAirbnbs, setFilteredAirbnbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState('');
  const [minGuests, setMinGuests] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadAirbnbs();
  }, []);

  useEffect(() => {
    filterAirbnbs();
  }, [airbnbs, searchTerm, country, minGuests, maxPrice]);

  const loadAirbnbs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/airbnb/public`);
      
      // Parse images
      const airbnbsWithImages = response.data.map(airbnb => {
        if (airbnb.images && typeof airbnb.images === 'string') {
          airbnb.images = airbnb.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else {
          airbnb.images = [];
        }
        return airbnb;
      });
      
      setAirbnbs(airbnbsWithImages);
      setFilteredAirbnbs(airbnbsWithImages);
    } catch (err) {
      console.error('Error loading Airbnbs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAirbnbs = () => {
    let filtered = [...airbnbs];

    // Search filter - handle edge cases
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(airbnb => {
        const title = (airbnb.title || '').toLowerCase();
        const location = (airbnb.location || '').toLowerCase();
        return title.includes(searchLower) || location.includes(searchLower);
      });
    }

    // Country filter - handle edge cases
    if (country && country.trim() !== '') {
      filtered = filtered.filter(airbnb => {
        const airbnbCountry = (airbnb.country || '').toLowerCase().trim();
        const airbnbLocation = (airbnb.location || '').toLowerCase();
        const filterCountry = country.toLowerCase().trim();
        return airbnbCountry === filterCountry || airbnbLocation.includes(filterCountry);
      });
    }

    // Min guests filter - handle edge cases
    if (minGuests && minGuests.trim() !== '') {
      const minGuestsNum = parseInt(minGuests);
      if (!isNaN(minGuestsNum) && minGuestsNum > 0) {
        filtered = filtered.filter(airbnb => {
          const maxGuests = parseInt(airbnb.max_guests || 0);
          return !isNaN(maxGuests) && maxGuests >= minGuestsNum;
        });
      }
    }

    // Max price filter - handle edge cases
    if (maxPrice && maxPrice.trim() !== '') {
      const maxPriceNum = parseFloat(maxPrice);
      if (!isNaN(maxPriceNum) && maxPriceNum > 0) {
        filtered = filtered.filter(airbnb => {
          const price = parseFloat(airbnb.price_per_night || 0);
          return !isNaN(price) && price <= maxPriceNum;
        });
      }
    }

    setFilteredAirbnbs(filtered);
  };

  const handleViewDetails = (airbnb) => {
    navigate(`/airbnb/${airbnb.id}`);
  };


  // Get unique countries for filter
  const countries = [...new Set([
    ...airbnbs.map(a => a.country).filter(Boolean),
    ...airbnbs.map(a => a.location?.split(',').pop()?.trim()).filter(Boolean)
  ])];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Top Navigation - Same as Public Rentals */}
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
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Avatar
                src={logoImage}
                alt="Easy Rentals Logo"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                variant="rounded"
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '1.25rem'
                }}
              >
                Easy Rentals
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
              <Close />
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

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, pb: 6, pt: 3 }}>
        {/* Hero Section */}
        <Fade in={true} timeout={800}>
          <Box 
            sx={{ 
              mb: 6,
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              px: { xs: 2, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 70%)',
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
                  Unforgettable Stays Await
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
                  Experience world-class vacation rentals and unique stays across East Africa. Your home away from home.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
                  <Chip 
                    icon={<LocationOn sx={{ color: 'white !important' }} />}
                    label="Prime Locations"
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
                    label="5-Star Properties"
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
                    icon={<FavoriteBorder sx={{ color: 'white !important' }} />}
                    label="Guest Favorites"
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
                    label="Entire Homes"
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
        <Fade in={true} timeout={600}>
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterList color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Filter Vacation Rentals
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    placeholder="Location or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <MenuItem value="">All Countries</MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Guests"
                    placeholder="Any"
                    value={minGuests}
                    onChange={(e) => setMinGuests(e.target.value)}
                    InputProps={{
                      startAdornment: <GuestsIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Price/Night"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    InputProps={{
                      startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm('');
                      setCountry('');
                      setMinGuests('');
                      setMaxPrice('');
                    }}
                    sx={{
                      py: 1.8,
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Results Count */}
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          {filteredAirbnbs.length} listing{filteredAirbnbs.length !== 1 ? 's' : ''} available
        </Typography>

        {/* Airbnb Grid */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : filteredAirbnbs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No Airbnb listings found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAirbnbs.map((airbnb, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={airbnb.id}>
                <Fade in={true} timeout={600 + (index * 100)}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '24px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'white',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                        transform: 'translateY(-8px)',
                        borderColor: 'rgba(102, 126, 234, 0.2)'
                      }
                    }}
                    onClick={() => handleViewDetails(airbnb)}
                  >
                    {/* Premium Image Section */}
                    <Box
                      sx={{
                        height: { xs: 280, sm: 320 },
                        position: 'relative',
                        overflow: 'hidden',
                        background: airbnb.images?.[0]
                          ? `url(${airbnb.images[0]}) center/cover`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
                          zIndex: 1
                        }
                      }}
                    >
                      {/* Premium Badges */}
                      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {airbnb.is_booked ? (
                          <Chip
                            label="Booked"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 87, 34, 0.95)',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              borderRadius: '20px',
                              px: 1.5,
                              py: 0.5,
                              boxShadow: '0 4px 12px rgba(255, 87, 34, 0.4)',
                              backdropFilter: 'blur(10px)'
                            }}
                          />
                        ) : (
                          <>
                            {airbnb.is_available === 'available' && (
                              <Chip
                                label="Available"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(76, 175, 80, 0.95)',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  borderRadius: '20px',
                                  px: 1.5,
                                  py: 0.5,
                                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                  backdropFilter: 'blur(10px)'
                                }}
                              />
                            )}
                            {(airbnb.bookings_count > 5 || Math.random() > 0.5) && (
                              <Chip
                                label="Guest Favorite"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  color: '#667eea',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  borderRadius: '20px',
                                  px: 1.5,
                                  py: 0.5,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  backdropFilter: 'blur(10px)'
                                }}
                              />
                            )}
                          </>
                        )}
                      </Box>
                      
                      {/* Favorite & Image Count */}
                      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2, display: 'flex', gap: 1 }}>
                        {airbnb.images && airbnb.images.length > 1 && (
                          <Chip
                            icon={<Visibility sx={{ fontSize: 14, color: 'white !important' }} />}
                            label={airbnb.images.length}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              borderRadius: '20px',
                              backdropFilter: 'blur(10px)'
                            }}
                          />
                        )}
                        <IconButton
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            width: 40,
                            height: 40,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': { 
                              bgcolor: 'white', 
                              transform: 'scale(1.1)',
                              '& .MuiSvgIcon-root': { color: '#e91e63' }
                            },
                            transition: 'all 0.3s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <FavoriteBorder sx={{ fontSize: 20, color: '#333', transition: 'all 0.3s' }} />
                        </IconButton>
                      </Box>

                      {/* Country Flag Badge */}
                      {airbnb.country && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            borderRadius: '20px',
                            px: 1.5,
                            py: 0.5,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <Typography variant="h6" sx={{ lineHeight: 1 }}>
                            {getCountryFlag(airbnb.country)}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color="#333">
                            {airbnb.country}
                          </Typography>
                        </Box>
                      )}

                      {!airbnb.images?.[0] && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          zIndex: 1
                        }}>
                          <Bed sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)' }} />
                        </Box>
                      )}
                    </Box>

                    {/* Premium Content Section */}
                    <CardContent sx={{ p: 3, pb: 2.5 }}>
                      {/* Title & Location */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={700}
                          color="#1a202c"
                          sx={{ 
                            mb: 0.5,
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {airbnb.title || 'Premium Property'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          <LocationOn sx={{ fontSize: 16, color: '#667eea' }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.875rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {airbnb.location?.split(',').pop()?.trim() || 'Location'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Property Features - Premium Icons */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        mb: 2,
                        py: 1.5,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        borderBottom: '1px solid rgba(0,0,0,0.06)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <GuestsIcon sx={{ fontSize: 18, color: '#667eea' }} />
                          <Typography variant="body2" fontWeight={600} color="#4a5568">
                            {airbnb.max_guests}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Bed sx={{ fontSize: 18, color: '#667eea' }} />
                          <Typography variant="body2" fontWeight={600} color="#4a5568">
                            {airbnb.bedrooms}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Bathtub sx={{ fontSize: 18, color: '#667eea' }} />
                          <Typography variant="body2" fontWeight={600} color="#4a5568">
                            {airbnb.bathrooms}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Price & Rating - Premium Layout */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                            <Typography 
                              variant="h5" 
                              fontWeight={800} 
                              sx={{ 
                                color: '#667eea',
                                fontSize: '1.5rem',
                                lineHeight: 1
                              }}
                            >
                              {airbnb.currency}{parseFloat(airbnb.price_per_night).toLocaleString()}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            per night
                          </Typography>
                        </Box>
                        {airbnb.bookings_count > 0 && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            bgcolor: '#f7fafc',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px'
                          }}>
                            <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                            <Typography variant="body2" fontWeight={700} color="#1a202c">
                              {(4.7 + Math.random() * 0.3).toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Social Media Floating Buttons */}
      <SocialMediaFloatButtons />

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default PublicAirbnb;
