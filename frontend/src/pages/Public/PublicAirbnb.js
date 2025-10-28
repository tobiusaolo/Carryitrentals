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
  Star
} from '@mui/icons-material';
import axios from 'axios';

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
      const response = await axios.get('https://carryit-backend.onrender.com/api/v1/airbnb/public');
      
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(airbnb =>
        airbnb.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airbnb.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (country) {
      filtered = filtered.filter(airbnb =>
        airbnb.location?.toLowerCase().includes(country.toLowerCase())
      );
    }

    // Min guests filter
    if (minGuests) {
      filtered = filtered.filter(airbnb => airbnb.max_guests >= parseInt(minGuests));
    }

    // Max price filter
    if (maxPrice) {
      filtered = filtered.filter(airbnb => airbnb.price_per_night <= parseFloat(maxPrice));
    }

    setFilteredAirbnbs(filtered);
  };

  const handleViewDetails = (airbnb) => {
    navigate(`/airbnb/${airbnb.id}`);
  };


  // Get unique countries for filter
  const countries = [...new Set(airbnbs.map(a => a.location?.split(',').pop()?.trim()).filter(Boolean))];

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
                CarryIT Airbnb
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
          <Grid container spacing={2.5}>
            {filteredAirbnbs.map((airbnb, index) => (
              <Grid item xs={12} sm={6} md={4} key={airbnb.id}>
                <Fade in={true} timeout={600 + (index * 100)}>
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
                    onClick={() => handleViewDetails(airbnb)}
                  >
                    {/* Airbnb Image - Compact Size */}
                    <Box
                      sx={{
                        height: 220,
                        background: airbnb.images?.[0]
                          ? `url(${airbnb.images[0]}) center/cover`
                          : 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)',
                        position: 'relative',
                        borderRadius: '16px 16px 0 0'
                      }}
                    >
                      {/* Booked Badge (Priority) */}
                      {airbnb.is_booked ? (
                        <Chip
                          label="Booked"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: '#ff5722',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: '12px',
                            px: 1.5,
                            boxShadow: '0 2px 8px rgba(255,87,34,0.4)'
                          }}
                        />
                      ) : (
                        /* Guest Favorite Badge */
                        (airbnb.bookings_count > 5 || Math.random() > 0.5) && (
                          <Chip
                            label="Guest favorite"
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
                              px: 1.5
                            }}
                          />
                        )
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

                      {!airbnb.images?.[0] && (
                        <Bed sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
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
                        {airbnb.title?.split(' ').slice(0, 3).join(' ')} in {airbnb.location?.split(',').pop()?.trim() || 'Location'}
                      </Typography>
                      
                      {/* Features - Subtle */}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {airbnb.max_guests} guest{airbnb.max_guests !== 1 ? 's' : ''} · {airbnb.bedrooms} bedroom{airbnb.bedrooms !== 1 ? 's' : ''} · {airbnb.bathrooms} bath{airbnb.bathrooms !== 1 ? 's' : ''}
                      </Typography>

                      {/* Price & Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1 }}>
                        <Typography variant="body1" fontWeight={700} color="#222">
                          {airbnb.currency}{parseFloat(airbnb.price_per_night).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          night
                        </Typography>
                        {airbnb.bookings_count > 0 && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ mx: 0.3 }}>
                              •
                            </Typography>
                            <Star sx={{ fontSize: 12, color: '#222' }} />
                            <Typography variant="caption" fontWeight={600} color="#222">
                              {(4.7 + Math.random() * 0.3).toFixed(2)}
                            </Typography>
                          </>
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

    </Box>
  );
};

export default PublicAirbnb;
