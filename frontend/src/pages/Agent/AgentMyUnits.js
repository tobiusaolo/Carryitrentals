import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Fab,
  Grow,
  Zoom,
  Fade,
  Slide
} from '@mui/material';
import {
  Add,
  Visibility,
  Home,
  Apartment,
  Bed,
  Bathtub,
  Event as CalendarIcon
} from '@mui/icons-material';
import StatusBadge from '../../components/UI/StatusBadge';
import EmptyState from '../../components/UI/EmptyState';
import { PropertyCardSkeleton } from '../../components/UI/LoadingSkeleton';
import api from '../../services/api/api';

const AgentMyUnits = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyUnits();
  }, []);

  const loadMyUnits = async () => {
    try {
      setLoading(true);
      // Get units uploaded by or assigned to this agent
      const response = await api.get('/rental-units/');
      
      // Parse images from string to array for each unit
      const unitsWithImages = response.data.map(unit => {
        if (unit.images && typeof unit.images === 'string') {
          // Split images by separator and filter empty strings
          unit.images = unit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
          console.log(`Unit ${unit.id} has ${unit.images.length} images`);
        } else if (!unit.images) {
          unit.images = [];
          console.log(`Unit ${unit.id} has no images`);
        }
        return unit;
      });
      
      // Sort units: available first, then by creation date (newest first)
      const sortedUnits = unitsWithImages.sort((a, b) => {
        // Available units first
        if (a.status === 'available' && b.status !== 'available') return -1;
        if (a.status !== 'available' && b.status === 'available') return 1;
        
        // Then sort by created_at (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setUnits(sortedUnits);
    } catch (err) {
      console.error('Error loading units:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <PropertyCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (units.length === 0) {
    return (
      <EmptyState
        type="properties"
        title="No Rental Units Yet"
        message="Start by adding your first rental unit to the platform. Click the button below to get started!"
        actionText="Add Your First Unit"
        onAction={() => navigate('/agent/add-unit')}
      />
    );
  }

  // Separate units by availability
  const availableUnits = units.filter(unit => unit.status === 'available');
  const occupiedUnits = units.filter(unit => unit.status === 'occupied');
  const maintenanceUnits = units.filter(unit => unit.status === 'maintenance');

  return (
    <Box>
      <Fade in={true} timeout={600}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              My Rental Units
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {units.length} unit{units.length !== 1 ? 's' : ''} total • {availableUnits.length} available • {occupiedUnits.length} occupied
            </Typography>
          </Box>
          <Zoom in={true} timeout={800}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/agent/add-unit')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                display: { xs: 'none', sm: 'flex' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Unit
            </Button>
          </Zoom>
        </Box>
      </Fade>

      {/* Available Units Section */}
      {availableUnits.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={`${availableUnits.length} Available`}
              color="success"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Grid container spacing={2}>
            {availableUnits.map((unit, index) => (
              <Grid item xs={12} sm={6} md={4} key={unit.id}>
                <Grow in={true} timeout={600 + (index * 100)}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '2px solid',
                      borderColor: 'success.light',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.15)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 30px rgba(76, 175, 80, 0.25)',
                        borderColor: 'success.main'
                      }
                    }}
                    onClick={() => navigate(`/agent/unit/${unit.id}`)}
                  >
                  {/* Unit Image */}
                  <Box
                    sx={{
                      height: 180,
                      background: unit.images?.[0]
                        ? `url(${unit.images[0]}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    {!unit.images?.[0] && (
                      <Home sx={{ fontSize: 60, color: 'rgba(255,255,255,0.5)' }} />
                    )}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <StatusBadge status={unit.status} />
                    </Box>
                  </Box>

                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {unit.title || unit.unit_type || 'Rental Unit'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {unit.location || 'Location not specified'}
                    </Typography>

                    {/* Unit Details */}
                    <Box sx={{ display: 'flex', gap: 1.5, my: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Apartment sx={{ fontSize: 16 }} />}
                        label={unit.unit_type?.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Bed sx={{ fontSize: 16 }} />}
                        label={`${unit.bedrooms || 0} Beds`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Bathtub sx={{ fontSize: 16 }} />}
                        label={`${unit.bathrooms || 0} Baths`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                        label={`${unit.inspection_bookings_count || 0} Inspections`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {/* Rent Amount */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {unit.currency || 'USD'} {unit.monthly_rent?.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /month
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/agent/unit/${unit.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Occupied Units Section */}
      {occupiedUnits.length > 0 && (
        <Fade in={true} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`${occupiedUnits.length} Occupied`}
                color="default"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            <Grid container spacing={2}>
              {occupiedUnits.map((unit, index) => (
                <Grid item xs={12} sm={6} md={4} key={unit.id}>
                  <Grow in={true} timeout={800 + (index * 100)}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: 0.9,
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.01)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          opacity: 1
                        }
                      }}
                      onClick={() => navigate(`/agent/unit/${unit.id}`)}
                    >
                  {/* Unit Image */}
                  <Box
                    sx={{
                      height: 180,
                      background: unit.images?.[0]
                        ? `url(${unit.images[0]}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    {!unit.images?.[0] && (
                      <Home sx={{ fontSize: 60, color: 'rgba(255,255,255,0.5)' }} />
                    )}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <StatusBadge status={unit.status} />
                    </Box>
                  </Box>

                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {unit.title || unit.unit_type || 'Rental Unit'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {unit.location || 'Location not specified'}
                    </Typography>

                    {/* Unit Details */}
                    <Box sx={{ display: 'flex', gap: 1.5, my: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Apartment sx={{ fontSize: 16 }} />}
                        label={unit.unit_type?.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Bed sx={{ fontSize: 16 }} />}
                        label={`${unit.bedrooms || 0} Beds`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Bathtub sx={{ fontSize: 16 }} />}
                        label={`${unit.bathrooms || 0} Baths`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                        label={`${unit.inspection_bookings_count || 0} Inspections`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {/* Rent Amount */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {unit.currency || 'USD'} {unit.monthly_rent?.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /month
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/agent/unit/${unit.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Maintenance Units Section */}
      {maintenanceUnits.length > 0 && (
        <Fade in={true} timeout={1200}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`${maintenanceUnits.length} Under Maintenance`}
                color="warning"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            <Grid container spacing={2}>
              {maintenanceUnits.map((unit, index) => (
                <Grid item xs={12} sm={6} md={4} key={unit.id}>
                  <Grow in={true} timeout={1000 + (index * 100)}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(255, 152, 0, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.01)',
                          boxShadow: '0 8px 25px rgba(255, 152, 0, 0.2)'
                        }
                      }}
                      onClick={() => navigate(`/agent/unit/${unit.id}`)}
                    >
                  {/* Unit Image */}
                  <Box
                    sx={{
                      height: 180,
                      background: unit.images?.[0]
                        ? `url(${unit.images[0]}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    {!unit.images?.[0] && (
                      <Home sx={{ fontSize: 60, color: 'rgba(255,255,255,0.5)' }} />
                    )}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <StatusBadge status={unit.status} />
                    </Box>
                  </Box>

                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {unit.title || unit.unit_type || 'Rental Unit'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {unit.location || 'Location not specified'}
                    </Typography>

                    {/* Unit Details */}
                    <Box sx={{ display: 'flex', gap: 1.5, my: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Apartment sx={{ fontSize: 16 }} />}
                        label={unit.unit_type?.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Bed sx={{ fontSize: 16 }} />}
                        label={`${unit.bedrooms || 0} Beds`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Bathtub sx={{ fontSize: 16 }} />}
                        label={`${unit.bathrooms || 0} Baths`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                        label={`${unit.inspection_bookings_count || 0} Inspections`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {/* Rent Amount */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {unit.currency || 'USD'} {unit.monthly_rent?.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /month
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/agent/unit/${unit.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Mobile FAB */}
      <Zoom in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => navigate('/agent/add-unit')}
        >
          <Add />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default AgentMyUnits;

