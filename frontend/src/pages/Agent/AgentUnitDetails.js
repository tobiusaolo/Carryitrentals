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
  Divider,
  CircularProgress,
  ImageList,
  ImageListItem,
  useTheme,
  useMediaQuery,
  Alert,
  Dialog
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  AttachMoney,
  Bed,
  Bathtub,
  Home,
  ArrowForwardIos,
  ArrowBackIos,
  Close
} from '@mui/icons-material';
import authService from '../../services/authService';

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

const AgentUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openImageViewer, setOpenImageViewer] = useState(false);

  useEffect(() => {
    loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = authService.createAxiosInstance();
      const response = await api.get(`/rental-units/${id}`);
      
      const unitData = response.data;
      
      // Parse images
      if (unitData.images && typeof unitData.images === 'string') {
        unitData.images = unitData.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
      } else if (!unitData.images) {
        unitData.images = [];
      }
      
      setUnit(unitData);
    } catch (err) {
      console.error('Error loading unit:', err);
      setError(err.response?.data?.detail || 'Failed to load unit details');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !unit) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Unit not found'}
        </Alert>
        <Button onClick={() => navigate('/agent/my-units')} variant="contained" startIcon={<ArrowBack />}>
          Back to My Units
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/agent/my-units')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#333', fontWeight: 600 }}>
            {unit.title || 'Unit Details'}
          </Typography>
          <Chip
            label={unit.status === 'available' ? 'Available' : unit.status}
            color={unit.status === 'available' ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
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

            {/* Features & Amenities */}
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

          {/* Sidebar */}
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

              {/* Inspection Fee */}
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
                </Alert>
              </Box>

              {/* Additional Info */}
              {unit.floor && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Floor
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {unit.floor}
                  </Typography>
                </Box>
              )}

              {/* Edit Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate(`/agent/add-unit?edit=${unit.id}`)}
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
                Edit Unit
              </Button>
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
    </Box>
  );
};

export default AgentUnitDetails;

