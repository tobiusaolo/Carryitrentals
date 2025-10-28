import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Alert,
  Grow,
  Fade,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Home as HomeIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteImageIcon,
  Event as CalendarIcon,
  Bed,
  Bathtub,
  People as GuestsIcon,
  LocationOn,
  TrendingUp,
  AttachMoney,
  EventAvailable,
  CheckCircle,
  Cancel,
  Pending
} from '@mui/icons-material';
import api from '../../services/api/api';
import NotificationSystem from '../../components/UI/NotificationSystem';
import { PropertyCardSkeleton } from '../../components/UI/LoadingSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';

const OwnerAirbnb = () => {
  const [airbnbs, setAirbnbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAirbnb, setEditingAirbnb] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalBookings: 0,
    totalIncome: 0,
    monthlyIncome: 0,
    availableListings: 0,
    bookedListings: 0
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    currency: 'USD',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: '',
    house_rules: '',
    is_available: 'available'
  });

  useEffect(() => {
    loadAirbnbs();
    loadAllBookings();
  }, []);

  const loadAirbnbs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/airbnb/');
      
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
      calculateStats(airbnbsWithImages);
    } catch (err) {
      console.error('Error loading Airbnbs:', err);
      setNotification({
        open: true,
        message: 'Failed to load Airbnb listings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllBookings = async () => {
    try {
      // Get bookings for all owner's Airbnbs
      const airbnbsResponse = await api.get('/airbnb/');
      const allBookings = [];
      
      for (const airbnb of airbnbsResponse.data) {
        try {
          const bookingsResponse = await api.get(`/airbnb/${airbnb.id}/bookings`);
          const bookingsWithAirbnb = bookingsResponse.data.map(booking => ({
            ...booking,
            airbnb_title: airbnb.title,
            airbnb_location: airbnb.location
          }));
          allBookings.push(...bookingsWithAirbnb);
        } catch (err) {
          console.error(`Error loading bookings for Airbnb ${airbnb.id}:`, err);
        }
      }
      
      setBookings(allBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  const calculateStats = (airbnbList) => {
    const totalListings = airbnbList.length;
    const availableListings = airbnbList.filter(a => a.is_available === 'available').length;
    const bookedListings = airbnbList.filter(a => a.is_available === 'booked').length;
    
    // Calculate total bookings and income from bookings state
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalIncome = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    
    // Calculate monthly income (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBookings = confirmedBookings.filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    const monthlyIncome = monthlyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    
    setStats({
      totalListings,
      totalBookings,
      totalIncome,
      monthlyIncome,
      availableListings,
      bookedListings
    });
  };

  // Recalculate stats when bookings change
  useEffect(() => {
    if (airbnbs.length > 0) {
      calculateStats(airbnbs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, airbnbs.length]);

  const handleOpenDialog = (airbnb = null) => {
    if (airbnb) {
      setEditingAirbnb(airbnb);
      setFormData({
        title: airbnb.title || '',
        description: airbnb.description || '',
        location: airbnb.location || '',
        price_per_night: airbnb.price_per_night || '',
        currency: airbnb.currency || 'USD',
        max_guests: airbnb.max_guests || 2,
        bedrooms: airbnb.bedrooms || 1,
        bathrooms: airbnb.bathrooms || 1,
        amenities: airbnb.amenities || '',
        house_rules: airbnb.house_rules || '',
        is_available: airbnb.is_available || 'available'
      });
      setSelectedImages(airbnb.images || []);
    } else {
      setEditingAirbnb(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        price_per_night: '',
        currency: 'USD',
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: '',
        house_rules: '',
        is_available: 'available'
      });
      setSelectedImages([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAirbnb(null);
    setSelectedImages([]);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (selectedImages.length + files.length > 10) {
      setNotification({
        open: true,
        message: 'Maximum 10 images allowed',
        severity: 'error'
      });
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaveLoading(true);
    try {
      // Convert images to base64
      let imageStrings = [];
      for (const file of selectedImages) {
        if (typeof file === 'string') {
          imageStrings.push(file);
        } else {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          imageStrings.push(base64);
        }
      }

      const airbnbData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        max_guests: parseInt(formData.max_guests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        images: imageStrings.length > 0 ? imageStrings.join('|||IMAGE_SEPARATOR|||') : null
      };

      if (editingAirbnb) {
        await api.put(`/airbnb/${editingAirbnb.id}`, airbnbData);
        setNotification({
          open: true,
          message: 'Airbnb listing updated successfully!',
          severity: 'success'
        });
      } else {
        await api.post('/airbnb/', airbnbData);
        setNotification({
          open: true,
          message: 'Airbnb listing created successfully!',
          severity: 'success'
        });
      }

      handleCloseDialog();
      loadAirbnbs();
    } catch (err) {
      console.error('Error saving Airbnb:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to save Airbnb listing',
        severity: 'error'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Airbnb listing?')) {
      try {
        await api.delete(`/airbnb/${id}`);
        setNotification({
          open: true,
          message: 'Airbnb listing deleted successfully!',
          severity: 'success'
        });
        loadAirbnbs();
        loadAllBookings();
      } catch (err) {
        console.error('Error deleting Airbnb:', err);
        setNotification({
          open: true,
          message: 'Failed to delete Airbnb listing',
          severity: 'error'
        });
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/airbnb/bookings/${bookingId}`, { status: newStatus });
      setNotification({
        open: true,
        message: `Booking ${newStatus} successfully!`,
        severity: 'success'
      });
      loadAllBookings();
    } catch (err) {
      console.error('Error updating booking:', err);
      setNotification({
        open: true,
        message: 'Failed to update booking status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle sx={{ fontSize: 18 }} />;
      case 'completed':
        return <EventAvailable sx={{ fontSize: 18 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 18 }} />;
      default:
        return <Pending sx={{ fontSize: 18 }} />;
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
            <PropertyCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Fade in={true} timeout={600}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Airbnb Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your short-term rental listings and bookings
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Add Listing
          </Button>
        </Box>
      </Fade>

      {/* Statistics - Always show */}
      <Fade in={true} timeout={800}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Listings"
              value={stats.totalListings}
              icon={<HomeIcon />}
              color="#667eea"
              subtitle={`${stats.availableListings} available, ${stats.bookedListings} booked`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={<CalendarIcon />}
              color="#3b82f6"
              subtitle="All-time bookings"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Monthly Income"
              value={`$${stats.monthlyIncome.toFixed(2)}`}
              icon={<TrendingUp />}
              color="#10b981"
              trend={stats.monthlyIncome > 0 ? 'up' : 'neutral'}
              subtitle="Current month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Income"
              value={`$${stats.totalIncome.toFixed(2)}`}
              icon={<AttachMoney />}
              color="#f59e0b"
              subtitle="All-time earnings"
            />
          </Grid>
        </Grid>
      </Fade>

      {/* Empty State or Content */}
      {airbnbs.length === 0 ? (
        <EmptyState
          type="properties"
          title="No Airbnb Listings Yet"
          message="Start by creating your first Airbnb listing. Share your property with travelers worldwide!"
          actionText="Add Airbnb Listing"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <>
          {/* Tabs for Listings and Bookings */}
          <Paper sx={{ borderRadius: 3, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2
              }}
            >
              <Tab label={`Listings (${airbnbs.length})`} />
              <Tab label={`Bookings (${bookings.length})`} />
            </Tabs>
          </Paper>

          {/* Listings Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {airbnbs.map((airbnb, index) => (
                <Grid item xs={12} md={6} lg={4} key={airbnb.id}>
                  <Grow in={true} timeout={600 + (index * 100)}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)',
                          borderColor: '#667eea'
                        }
                      }}
                    >
                      {/* Image */}
                      <Box
                        sx={{
                          height: 200,
                          background: airbnb.images?.[0]
                            ? `url(${airbnb.images[0]}) center/cover`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                      >
                        {!airbnb.images?.[0] && (
                          <HomeIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.5)' }} />
                        )}
                        <Chip
                          label={airbnb.is_available}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: airbnb.is_available === 'available' ? '#10b981' : '#6b7280',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                          {airbnb.title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                          <LocationOn sx={{ fontSize: 18, color: '#6b7280' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {airbnb.location}
                          </Typography>
                        </Box>

                        {/* Details */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<GuestsIcon sx={{ fontSize: 16 }} />}
                            label={`${airbnb.max_guests} Guests`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<Bed sx={{ fontSize: 16 }} />}
                            label={`${airbnb.bedrooms} Beds`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<Bathtub sx={{ fontSize: 16 }} />}
                            label={`${airbnb.bathrooms} Baths`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                            label={`${airbnb.bookings_count || 0} Bookings`}
                            size="small"
                            sx={{
                              bgcolor: airbnb.bookings_count > 0 ? '#eff6ff' : '#f9fafb',
                              color: airbnb.bookings_count > 0 ? '#3b82f6' : '#6b7280',
                              fontWeight: 600
                            }}
                          />
                        </Box>

                        {/* Price and Actions */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pt: 2,
                            borderTop: '1px solid #e5e7eb'
                          }}
                        >
                          <Box>
                            <Typography variant="h5" fontWeight={800} color="#667eea">
                              {airbnb.currency} {airbnb.price_per_night}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              per night
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(airbnb)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(airbnb.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Bookings Tab */}
          {activeTab === 1 && (
            <Fade in={true} timeout={600}>
              <Paper sx={{ borderRadius: 3 }}>
                {bookings.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 80, color: '#e5e7eb', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Bookings Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bookings will appear here when guests book your Airbnb listings
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f9fafb' }}>
                          <TableCell><strong>Property</strong></TableCell>
                          <TableCell><strong>Guest</strong></TableCell>
                          <TableCell><strong>Check-in</strong></TableCell>
                          <TableCell><strong>Check-out</strong></TableCell>
                          <TableCell><strong>Guests</strong></TableCell>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {booking.airbnb_title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {booking.airbnb_location}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {booking.guest_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {booking.guest_email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(booking.check_in_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(booking.check_out_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<GuestsIcon />}
                                label={booking.number_of_guests}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700} color="#667eea">
                                ${booking.total_amount?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(booking.status)}
                                label={booking.status}
                                size="small"
                                sx={{
                                  bgcolor: `${getStatusColor(booking.status)}20`,
                                  color: getStatusColor(booking.status),
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {booking.status === 'pending' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              )}
                              {booking.status === 'confirmed' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                  Complete
                                </Button>
                              )}
                              {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                <Typography variant="caption" color="text.secondary">
                                  No actions
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Fade>
          )}
        </>
      )}

      {/* Add/Edit Dialog - Always available */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingAirbnb ? 'Edit Airbnb Listing' : 'Add New Airbnb Listing'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Cozy Beach House"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Zanzibar, Tanzania"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Price per Night"
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currency}
                    label="Currency"
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="UGX">UGX</MenuItem>
                    <MenuItem value="KES">KES</MenuItem>
                    <MenuItem value="TZS">TZS</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.is_available}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.value })}
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="booked">Booked</MenuItem>
                    <MenuItem value="unavailable">Unavailable</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Max Guests"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your Airbnb property..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amenities"
                  multiline
                  rows={2}
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="e.g., WiFi, Pool, Kitchen, Parking, AC"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="House Rules"
                  multiline
                  rows={2}
                  value={formData.house_rules}
                  onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
                  placeholder="e.g., No smoking, No pets, Check-in after 2PM"
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Images (5-10 required)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="airbnb-image-upload"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="airbnb-image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {selectedImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                  </Button>
                </label>

                {selectedImages.length > 0 && (
                  <>
                    <Alert severity={selectedImages.length >= 5 ? "success" : "info"} sx={{ mb: 2 }}>
                      {selectedImages.length} / 10 images selected
                      {selectedImages.length >= 5 && ' ✓ Ready to submit'}
                    </Alert>
                    <ImageList cols={3} gap={8}>
                      {selectedImages.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Property ${index + 1}`}
                            loading="lazy"
                            style={{ height: 150, objectFit: 'cover' }}
                          />
                          <ImageListItemBar
                            actionIcon={
                              <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <DeleteImageIcon />
                              </IconButton>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </>
                )}

                {uploadingImages && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Processing images...
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saveLoading || selectedImages.length < 5}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {saveLoading ? 'Saving...' : (editingAirbnb ? 'Update' : 'Create') + ' Listing'}
            </Button>
          </DialogActions>
        </Dialog>

        <NotificationSystem
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        />
      </Box>
    );
  };

export default OwnerAirbnb;
