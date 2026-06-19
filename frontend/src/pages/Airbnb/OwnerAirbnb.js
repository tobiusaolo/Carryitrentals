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
import { propertyAPI } from '../../services/api/propertyAPI';
import NotificationSystem from '../../components/UI/NotificationSystem';
import { PropertyCardSkeleton } from '../../components/UI/LoadingSkeleton';
import EmptyState from '../../components/UI/EmptyState';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';
import AirbnbListingFormFields from '../../components/Forms/AirbnbListingFormFields';
import DisplayPrice from '../../components/Public/DisplayPrice';
import {
  emptyAirbnbFormState,
  MIN_AIRBNB_IMAGES,
  MAX_AIRBNB_IMAGES,
  getBookingStatusMeta,
  getAirbnbPropertyTypeLabel,
} from '../../constants/airbnb';
import OwnerDataTable from '../../components/Owner/OwnerDataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import { formatMoney } from '../../utils/formatMoney';
import { colors, getOwnerStatColor } from '../../theme/designTokens';
import AirbnbCalendarDialog from '../../components/Airbnb/AirbnbCalendarDialog';

const OwnerAirbnb = ({ embedded = false }) => {
  const [airbnbs, setAirbnbs] = useState([]);
  const [properties, setProperties] = useState([]);
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
  
  const [formData, setFormData] = useState(emptyAirbnbFormState());
  const [calendarListing, setCalendarListing] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    loadAirbnbs();
    loadAllBookings();
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyAPI.getAllProperties();
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  };

  const handlePropertyChange = (propertyId) => {
    const prop = properties.find((p) => String(p.id) === String(propertyId));
    setFormData((prev) => ({
      ...prev,
      property_id: propertyId,
      location: prop ? [prop.address, prop.city].filter(Boolean).join(', ') || prev.location : prev.location,
      country: prop?.country || prev.country,
    }));
  };

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
        ...emptyAirbnbFormState(),
        title: airbnb.title || '',
        description: airbnb.description || '',
        location: airbnb.location || '',
        country: airbnb.country || emptyAirbnbFormState().country,
        property_type: airbnb.property_type || emptyAirbnbFormState().property_type,
        price_per_night: airbnb.price_per_night || '',
        currency: airbnb.currency || emptyAirbnbFormState().currency,
        max_guests: airbnb.max_guests || 2,
        bedrooms: airbnb.bedrooms || 1,
        bathrooms: airbnb.bathrooms || 1,
        amenities: airbnb.amenities || '',
        house_rules: airbnb.house_rules || '',
        is_available: airbnb.is_available || 'available',
        property_id: airbnb.property_id || '',
      });
      setSelectedImages(airbnb.images || []);
    } else {
      setEditingAirbnb(null);
      setFormData(emptyAirbnbFormState());
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
    if (selectedImages.length + files.length > MAX_AIRBNB_IMAGES) {
      setNotification({
        open: true,
        message: `Maximum ${MAX_AIRBNB_IMAGES} images allowed`,
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
    if (!formData.property_id) {
      setNotification({
        open: true,
        message: 'Select one of your properties before saving this listing.',
        severity: 'warning',
      });
      return;
    }
    if (!editingAirbnb && selectedImages.length < MIN_AIRBNB_IMAGES) {
      setNotification({
        open: true,
        message: `Add at least ${MIN_AIRBNB_IMAGES} photos before saving`,
        severity: 'warning',
      });
      return;
    }
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
    const id = String(bookingId);
    try {
      await api.put(`/airbnb/bookings/${id}`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (String(b.id) === id ? { ...b, status: newStatus } : b))
      );
      setNotification({
        open: true,
        message: `Booking ${newStatus.replace('_', ' ')} successfully!`,
        severity: 'success'
      });
      loadAllBookings();
    } catch (err) {
      console.error('Error updating booking:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to update booking status',
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
      {!embedded && (
        <Fade in={true} timeout={600}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Short stays
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Airbnb-style listings linked to your properties
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              disabled={properties.length === 0}
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
      )}

      {embedded && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            disabled={properties.length === 0}
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: colors.brand, boxShadow: 'none' }}
          >
            Add short stay
          </Button>
        </Box>
      )}

      {properties.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Add a property first (Properties tab), then create a short-stay listing linked to it.
        </Alert>
      )}

      {/* Statistics - Always show */}
      <Fade in={true} timeout={800}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Listings"
              value={stats.totalListings}
              icon={<HomeIcon />}
              color={getOwnerStatColor(0)}
              subtitle={`${stats.availableListings} available, ${stats.bookedListings} booked`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={<CalendarIcon />}
              color={getOwnerStatColor(1)}
              subtitle="All-time bookings"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Monthly Income"
              value={formatMoney(stats.monthlyIncome, 'UGX')}
              icon={<TrendingUp />}
              color={getOwnerStatColor(2)}
              subtitle="Current month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Income"
              value={formatMoney(stats.totalIncome, 'UGX')}
              icon={<AttachMoney />}
              color={getOwnerStatColor(0)}
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
                        {(airbnb.property_name || airbnb.property_id) && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            {airbnb.property_name ||
                              properties.find((p) => String(p.id) === String(airbnb.property_id))?.name ||
                              'Linked property'}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                          <LocationOn sx={{ fontSize: 18, color: '#6b7280' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {airbnb.location}
                          </Typography>
                        </Box>

                        {/* Details */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={getAirbnbPropertyTypeLabel(airbnb.property_type)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
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
                              title="Calendar & blocks"
                              onClick={() => {
                                setCalendarListing(airbnb);
                                setCalendarOpen(true);
                              }}
                            >
                              <CalendarIcon />
                            </IconButton>
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
              <Paper sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, boxShadow: 'none' }}>
                <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
                  <strong>Pending</strong> — guest requested dates; confirm or cancel.{' '}
                  <strong>Confirmed</strong> — accepted stay. Payment is arranged after you confirm (50% prepayment may apply).
                </Alert>
                <Box sx={{ px: 0, pb: 0 }}>
                  <OwnerDataTable
                    columns={[
                      {
                        id: 'property',
                        label: 'Property',
                        render: (booking) => (
                          <>
                            <Typography variant="body2" fontWeight={600}>{booking.airbnb_title}</Typography>
                            <Typography variant="caption" color="text.secondary">{booking.airbnb_location}</Typography>
                          </>
                        ),
                      },
                      {
                        id: 'guest',
                        label: 'Guest',
                        render: (booking) => (
                          <>
                            <Typography variant="body2" fontWeight={600}>{booking.guest_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{booking.guest_email}</Typography>
                          </>
                        ),
                      },
                      {
                        id: 'checkin',
                        label: 'Check-in',
                        render: (b) => new Date(b.check_in_date).toLocaleDateString(),
                      },
                      {
                        id: 'checkout',
                        label: 'Check-out',
                        render: (b) => new Date(b.check_out_date).toLocaleDateString(),
                      },
                      {
                        id: 'guests',
                        label: 'Guests',
                        render: (b) => b.number_of_guests,
                      },
                      {
                        id: 'total',
                        label: 'Total',
                        render: (booking) => (
                          <DisplayPrice
                            amount={booking.total_amount || 0}
                            listingCurrency={booking.currency || 'UGX'}
                            variant="body2"
                            showSecondary={false}
                          />
                        ),
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        render: (b) => (
                          <OwnerStatusChip status={b.status} label={getBookingStatusMeta(b.status).label} />
                        ),
                      },
                      {
                        id: 'actions',
                        label: 'Actions',
                        render: (booking) => {
                          const st = booking.status === 'approved' ? 'confirmed' : booking.status;
                          if (st === 'pending') {
                            return (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                  sx={{ textTransform: 'none', fontSize: '0.75rem', bgcolor: colors.brand, boxShadow: 'none' }}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            );
                          }
                          if (st === 'confirmed') {
                            return (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                              >
                                Complete
                              </Button>
                            );
                          }
                          return (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          );
                        },
                      },
                    ]}
                    rows={bookings}
                    loading={false}
                    emptyTitle="No bookings yet"
                    emptyDescription="Bookings appear here when guests request stays on your listings."
                    emptyIcon={CalendarIcon}
                  />
                </Box>
              </Paper>
            </Fade>
          )}
        </>
      )}

      {/* Add/Edit Dialog - Always available */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingAirbnb ? 'Edit short-stay listing' : 'Add short-stay listing'}
          </DialogTitle>
          <DialogContent>
            <AirbnbListingFormFields
              formData={formData}
              setFormData={setFormData}
              properties={properties}
              requireProperty
              onPropertyChange={handlePropertyChange}
              selectedImages={selectedImages}
              onImageSelect={handleImageSelect}
              onRemoveImage={handleRemoveImage}
              showOwnerNote
            />
            {uploadingImages && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Processing images...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saveLoading || (!editingAirbnb && selectedImages.length < MIN_AIRBNB_IMAGES)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {saveLoading ? 'Saving...' : (editingAirbnb ? 'Update' : 'Create') + ' Listing'}
            </Button>
          </DialogActions>
        </Dialog>

        <AirbnbCalendarDialog
          open={calendarOpen}
          onClose={() => {
            setCalendarOpen(false);
            setCalendarListing(null);
          }}
          listing={calendarListing}
          onUpdated={loadAirbnbs}
        />

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
