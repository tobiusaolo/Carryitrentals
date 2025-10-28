import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Home as HomeIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteImageIcon,
  Event as CalendarIcon,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Payment as PaymentIcon,
  Hotel,
  Person,
  Phone,
  Email,
  CreditCard,
  AttachMoney
} from '@mui/icons-material';
import api from '../../services/api/api';
import axios from 'axios';
import NotificationSystem from '../../components/UI/NotificationSystem';
import StatusBadge from '../../components/UI/StatusBadge';

const AdminAirbnb = () => {
  const [activeTab, setActiveTab] = useState(0); // 0=Listings, 1=Bookings, 2=Payments
  const [airbnbs, setAirbnbs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingAirbnb, setEditingAirbnb] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    currency: 'UGX',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: '',
    house_rules: '',
    is_available: 'available'
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    if (activeTab === 0) {
      loadAirbnbs();
    } else if (activeTab === 1) {
      loadBookings();
    } else if (activeTab === 2) {
      loadPayments();
    }
  };

  const loadAirbnbs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/airbnb/');
      setAirbnbs(response.data);
    } catch (err) {
      console.error('Error loading Airbnbs:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to load Airbnb listings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://carryit-backend.onrender.com/api/v1/admin/airbnb/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to load bookings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://carryit-backend.onrender.com/api/v1/admin/airbnb/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Error loading payments:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to load payments',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://carryit-backend.onrender.com/api/v1/admin/airbnb/bookings/${bookingId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNotification({
        open: true,
        message: 'Booking approved successfully! SMS sent to guest.',
        severity: 'success'
      });
      loadBookings();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to approve booking',
        severity: 'error'
      });
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://carryit-backend.onrender.com/api/v1/admin/airbnb/bookings/${bookingId}/decline`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNotification({
        open: true,
        message: 'Booking declined. SMS sent to guest.',
        severity: 'info'
      });
      loadBookings();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to decline booking',
        severity: 'error'
      });
    }
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setOpenBookingDialog(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      approved: 'success',
      declined: 'error',
      cancelled: 'error',
      completed: 'info'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      completed: 'success',
      failed: 'error'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  const formatCurrency = (amount, currency = 'UGX') => {
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Original listing management functions (keeping existing code)
  const handleOpenDialog = (airbnb = null) => {
    if (airbnb) {
      setEditingAirbnb(airbnb);
      setFormData({
        title: airbnb.title,
        description: airbnb.description,
        location: airbnb.location,
        price_per_night: airbnb.price_per_night,
        currency: airbnb.currency || 'UGX',
        max_guests: airbnb.max_guests,
        bedrooms: airbnb.bedrooms,
        bathrooms: airbnb.bathrooms,
        amenities: airbnb.amenities || '',
        house_rules: airbnb.house_rules || '',
        is_available: airbnb.is_available
      });
      setSelectedImages([]);
    } else {
      setEditingAirbnb(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        price_per_night: '',
        currency: 'UGX',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 10) {
      setNotification({
        open: true,
        message: 'Maximum 10 images allowed',
        severity: 'warning'
      });
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSaveLoading(true);
      
      let imagesBase64 = '';
      if (selectedImages.length > 0) {
        const promises = selectedImages.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });
        const results = await Promise.all(promises);
        imagesBase64 = results.join('|||IMAGE_SEPARATOR|||');
      }

      const payload = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        max_guests: parseInt(formData.max_guests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        ...(imagesBase64 && { images: imagesBase64 })
      };

      if (editingAirbnb) {
        await api.put(`/airbnb/${editingAirbnb.id}`, payload);
        setNotification({
          open: true,
          message: 'Airbnb listing updated successfully!',
          severity: 'success'
        });
      } else {
        await api.post('/airbnb/', payload);
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
      } catch (err) {
        console.error('Error deleting Airbnb:', err);
        setNotification({
          open: true,
          message: err.response?.data?.detail || 'Failed to delete Airbnb listing',
          severity: 'error'
        });
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Airbnb Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage listings, bookings, and payments
          </Typography>
        </Box>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Airbnb Listing
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Hotel />
                <span>Listings ({airbnbs.length})</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon />
                <span>Bookings ({bookings.length})</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                <span>Payments ({payments.length})</span>
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* TAB 0: LISTINGS */}
      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Price/Night</strong></TableCell>
                <TableCell><strong>Guests</strong></TableCell>
                <TableCell><strong>Bedrooms</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {airbnbs.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <HomeIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No Airbnb listings yet. Click "Add Airbnb Listing" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                airbnbs.map((airbnb) => (
                  <TableRow key={airbnb.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {airbnb.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{airbnb.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${airbnb.currency} ${parseFloat(airbnb.price_per_night).toLocaleString()}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{airbnb.max_guests}</TableCell>
                    <TableCell>{airbnb.bedrooms}</TableCell>
                    <TableCell>
                      <Chip
                        label={airbnb.is_available}
                        size="small"
                        color={airbnb.is_available === 'available' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(airbnb)} color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(airbnb.id)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 1: BOOKINGS */}
      {activeTab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Booking ID</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Guest</strong></TableCell>
                <TableCell><strong>Check-in</strong></TableCell>
                <TableCell><strong>Check-out</strong></TableCell>
                <TableCell><strong>Guests</strong></TableCell>
                <TableCell><strong>Total Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Payment</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CalendarIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No bookings yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{booking.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.airbnb_title || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.guest_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.guest_phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(booking.check_in)}</TableCell>
                    <TableCell>{formatDate(booking.check_out)}</TableCell>
                    <TableCell>{booking.number_of_guests}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(booking.total_amount, booking.currency)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prepaid: {formatCurrency(booking.prepayment_amount, booking.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        size="small"
                        color={getStatusColor(booking.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.payment_status}
                        size="small"
                        color={getPaymentStatusColor(booking.payment_status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewBookingDetails(booking)}
                          color="primary"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {booking.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              onClick={() => handleApproveBooking(booking.id)}
                              color="success"
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Decline">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeclineBooking(booking.id)}
                              color="error"
                            >
                              <DeclineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 2 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Transaction ID</strong></TableCell>
                <TableCell><strong>Booking ID</strong></TableCell>
                <TableCell><strong>Guest</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Payment Method</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <PaymentIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No payments yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {payment.payment_reference}
                      </Typography>
                    </TableCell>
                    <TableCell>#{payment.booking_id}</TableCell>
                    <TableCell>{payment.guest_name}</TableCell>
                    <TableCell>{payment.airbnb_title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.payment_method?.replace('_', ' ').toUpperCase()}
                        size="small"
                        icon={<CreditCard />}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.payment_status}
                        size="small"
                        color={getPaymentStatusColor(payment.payment_status)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Booking Details - #{selectedBooking?.id}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Grid container spacing={3}>
              {/* Guest Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Guest Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Full Name:</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedBooking.guest_name}</Typography>
                    </Grid>
                    {selectedBooking.guest_username && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Username/ID:</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedBooking.guest_username}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Phone:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        <Phone sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {selectedBooking.guest_phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Email:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        <Email sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {selectedBooking.guest_email}
                      </Typography>
                    </Grid>
                    {selectedBooking.guest_date_of_birth && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Date of Birth:</Typography>
                        <Typography variant="body2">{formatDate(selectedBooking.guest_date_of_birth)}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Booking Details */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    <Hotel sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Booking Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Check-in:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(selectedBooking.check_in)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Check-out:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(selectedBooking.check_out)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Number of Nights:</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedBooking.number_of_nights}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Number of Guests:</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedBooking.number_of_guests}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Status:</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedBooking.status}
                          size="small"
                          color={getStatusColor(selectedBooking.status)}
                        />
                      </Box>
                    </Grid>
                    {selectedBooking.special_requests && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Special Requests:</Typography>
                        <Typography variant="body2">{selectedBooking.special_requests}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Payment Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Payment Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Total Amount:</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(selectedBooking.total_amount, selectedBooking.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Payment Status:</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedBooking.payment_status}
                          size="small"
                          color={getPaymentStatusColor(selectedBooking.payment_status)}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Prepayment (50%):</Typography>
                      <Typography variant="body1" fontWeight={600} color="primary">
                        {formatCurrency(selectedBooking.prepayment_amount, selectedBooking.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Remaining:</Typography>
                      <Typography variant="body1" fontWeight={600} color="text.secondary">
                        {formatCurrency(selectedBooking.remaining_amount, selectedBooking.currency)}
                      </Typography>
                    </Grid>
                    {selectedBooking.payment_method && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Payment Method:</Typography>
                        <Typography variant="body2">
                          {selectedBooking.payment_method.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Grid>
                    )}
                    {selectedBooking.payment_timing && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Payment Timing:</Typography>
                        <Typography variant="body2">
                          {selectedBooking.payment_timing === 'pay_now' ? 'Pay Now' : 'Pay Later'}
                        </Typography>
                      </Grid>
                    )}
                    {selectedBooking.card_last_four && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Card:</Typography>
                        <Typography variant="body2">
                          {selectedBooking.card_brand} •••• {selectedBooking.card_last_four}
                        </Typography>
                      </Grid>
                    )}
                    {selectedBooking.payment_reference && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Transaction Reference:</Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {selectedBooking.payment_reference}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)}>Close</Button>
          {selectedBooking?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApproveBooking(selectedBooking.id);
                  setOpenBookingDialog(false);
                }}
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDeclineBooking(selectedBooking.id);
                  setOpenBookingDialog(false);
                }}
                startIcon={<DeclineIcon />}
              >
                Decline
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Add/Edit Listing Dialog (keeping original) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAirbnb ? 'Edit Airbnb Listing' : 'Add Airbnb Listing'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price per Night"
                name="price_per_night"
                type="number"
                value={formData.price_per_night}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  <MenuItem value="UGX">UGX</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Max Guests"
                name="max_guests"
                type="number"
                value={formData.max_guests}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="WiFi, Pool, Parking, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="House Rules"
                name="house_rules"
                value={formData.house_rules}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  name="is_available"
                  value={formData.is_available}
                  onChange={handleChange}
                  label="Availability"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  Upload Images (Max 10)
                </Button>
              </label>
              {selectedImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" gutterBottom>
                    Selected Images: {selectedImages.length}
                  </Typography>
                  <ImageList cols={3} gap={8}>
                    {selectedImages.map((file, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          style={{ height: 100, objectFit: 'cover' }}
                        />
                        <ImageListItemBar
                          actionIcon={
                            <IconButton
                              onClick={() => handleRemoveImage(index)}
                              sx={{ color: 'white' }}
                            >
                              <DeleteImageIcon />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : (editingAirbnb ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <NotificationSystem
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default AdminAirbnb;
