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
import authService from '../../services/authService';
import { showSuccess, showError, showConfirm, showLoading, closeAlert, showWarning, showInfo } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';

const AdminAirbnb = () => {
  const [activeTab, setActiveTab] = useState(0); // 0=Listings, 1=Bookings, 2=Payments
  const [airbnbs, setAirbnbs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingAirbnb, setViewingAirbnb] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingAirbnb, setEditingAirbnb] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
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
      // Use authService for consistent authentication
      const apiInstance = authService.createAxiosInstance();
      const response = await apiInstance.get('/airbnb/');
      setAirbnbs(response.data || []);
    } catch (err) {
      console.error('Error loading Airbnbs:', err);
      showError('Load Failed', err.response?.data?.detail || 'Failed to load Airbnb listings');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      // Use authService for consistent authentication and base URL
      const apiInstance = authService.createAxiosInstance();
      
      // Try the admin endpoint first
      try {
        const response = await apiInstance.get('/admin/airbnb/bookings');
        const bookings = Array.isArray(response.data) ? response.data : [];
        
        // Sort by created_at descending (newest first)
        bookings.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        
        setBookings(bookings);
        return;
      } catch (adminErr) {
        console.warn('Admin endpoint failed, trying alternative approach:', adminErr);
        // Fallback: Fetch all bookings by iterating through all Airbnbs
        const airbnbsResponse = await apiInstance.get('/airbnb/');
        const airbnbs = airbnbsResponse.data || [];
        
        // Fetch bookings for each Airbnb
        const allBookings = [];
        for (const airbnb of airbnbs) {
          try {
            const bookingsResponse = await apiInstance.get(`/airbnb/${airbnb.id}/bookings`);
            const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
            
            // Add Airbnb title to each booking for display
            bookings.forEach(booking => {
              allBookings.push({
                ...booking,
                airbnb_title: airbnb.title,
                airbnb_location: airbnb.location
              });
            });
          } catch (err) {
            console.warn(`Failed to load bookings for Airbnb ${airbnb.id}:`, err);
            // Continue with other Airbnbs
          }
        }
        
        // Sort by created_at descending (newest first)
        allBookings.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        
        setBookings(allBookings);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      showError('Load Failed', err.response?.data?.detail || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Use authService for consistent authentication
      const apiInstance = authService.createAxiosInstance();
      
      // Use admin payments endpoint
      try {
        const response = await apiInstance.get('/admin/airbnb/payments');
        const payments = Array.isArray(response.data) ? response.data : [];
        setPayments(payments);
      } catch (adminErr) {
        console.warn('Admin payments endpoint failed, trying fallback:', adminErr);
        // Fallback: Fetch all bookings and extract payment information
        const bookingsResponse = await apiInstance.get('/admin/airbnb/bookings');
        const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
        
        // Convert bookings with payment info to payment records
        const allPayments = bookings
          .filter(booking => booking.payment_reference)
          .map(booking => ({
            id: booking.id,
            booking_id: booking.id,
            guest_name: booking.guest_name,
            airbnb_title: booking.airbnb_title || 'N/A',
            amount: booking.prepayment_amount || booking.total_amount,
            currency: booking.currency,
            payment_method: booking.payment_method,
            payment_status: booking.payment_status,
            payment_date: booking.payment_date || booking.created_at,
            payment_reference: booking.payment_reference
          }));
        
        setPayments(allPayments);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      showError('Load Failed', err.response?.data?.detail || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    console.log('🔵 Approve booking clicked, bookingId:', bookingId, 'type:', typeof bookingId);
    
    const result = await showConfirm(
      'Approve Booking',
      'Are you sure you want to approve this booking? An SMS notification will be sent to the guest.',
      'Yes, Approve',
      'Cancel'
    );
    
    if (!result.isConfirmed) {
      console.log('❌ User cancelled approval');
      return;
    }
    
    const loadingAlert = showLoading('Approving...', 'Please wait while we approve the booking');
    try {
      // Use authService for consistent authentication
      const apiInstance = authService.createAxiosInstance();
      
      // Ensure bookingId is a string
      const bookingIdStr = String(bookingId);
      console.log('📤 Sending approve request to:', `/admin/airbnb/bookings/${bookingIdStr}/approve`);
      
      // Use admin approve endpoint
      const response = await apiInstance.patch(`/admin/airbnb/bookings/${bookingIdStr}/approve`);
      
      console.log('✅ Approve response:', response.data);
      closeAlert();
      
      // Immediately update the local state to reflect the change
      setBookings(prevBookings => {
        const updated = prevBookings.map(booking => {
          const bookingIdStr = String(booking.id);
          const targetIdStr = String(bookingId);
          if (bookingIdStr === targetIdStr || bookingIdStr === bookingId || booking.id === bookingId) {
            console.log('🔄 Updating booking status in local state:', bookingIdStr, '-> approved');
            return { ...booking, status: 'approved' };
          }
          return booking;
        });
        console.log('📊 Updated bookings state, approved booking should be updated');
        return updated;
      });
      
      showSuccess('Booking Approved', 'The booking has been approved and an SMS has been sent to the guest.');
      
      // Wait a moment for backend to fully process, then refresh to get latest data
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadBookings();
      await loadPayments(); // Refresh payments tab as well
    } catch (err) {
      console.error('❌ Error approving booking:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to approve booking';
      showError('Approval Failed', errorMessage);
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    console.log('🔴 Decline booking clicked, bookingId:', bookingId, 'type:', typeof bookingId);
    
    const { value: reason } = await Swal.fire({
      title: 'Decline Booking',
      text: 'Enter reason for declining (optional):',
      input: 'textarea',
      inputPlaceholder: 'Enter decline reason...',
      inputAttributes: {
        'aria-label': 'Enter decline reason'
      },
      showCancelButton: true,
      confirmButtonText: 'Decline',
      confirmButtonColor: '#d32f2f',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#757575',
      inputValidator: (value) => {
        // Reason is optional, so no validation needed
        return null;
      }
    });
    
    if (reason === undefined) {
      // User cancelled
      console.log('❌ User cancelled decline');
      return;
    }
    
    const loadingAlert = showLoading('Declining...', 'Please wait while we decline the booking');
    try {
      // Use authService for consistent authentication
      const apiInstance = authService.createAxiosInstance();
      
      // Ensure bookingId is a string
      const bookingIdStr = String(bookingId);
      console.log('📤 Sending decline request to:', `/admin/airbnb/bookings/${bookingIdStr}/decline`);
      
      // Use admin decline endpoint
      const response = await apiInstance.patch(`/admin/airbnb/bookings/${bookingIdStr}/decline`, reason ? { reason } : {});
      
      console.log('✅ Decline response:', response.data);
      closeAlert();
      
      // Immediately update the local state to reflect the change
      setBookings(prevBookings => {
        const updated = prevBookings.map(booking => {
          const bookingIdStr = String(booking.id);
          const targetIdStr = String(bookingId);
          if (bookingIdStr === targetIdStr || bookingIdStr === bookingId || booking.id === bookingId) {
            console.log('🔄 Updating booking status in local state:', bookingIdStr, '-> declined');
            return { ...booking, status: 'declined' };
          }
          return booking;
        });
        console.log('📊 Updated bookings state, declined booking should be updated');
        return updated;
      });
      
      showSuccess('Booking Declined', 'The booking has been declined and an SMS has been sent to the guest.');
      
      // Wait a moment for backend to fully process, then refresh to get latest data
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadBookings();
    } catch (err) {
      console.error('❌ Error declining booking:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to decline booking';
      showError('Decline Failed', errorMessage);
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
        country: airbnb.country || 'Uganda',
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
        country: 'Uganda',
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
    // Reset form data
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 10) {
      showWarning('Image Limit', 'Maximum 10 images allowed. Please remove some images before adding more.');
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const loadingAlert = showLoading(
      editingAirbnb ? 'Updating...' : 'Creating...',
      'Please wait while we save the Airbnb listing'
    );
    setSaveLoading(true);
    
    try {
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

      // Use authService for consistent authentication
      const apiInstance = authService.createAxiosInstance();

      if (editingAirbnb) {
        await apiInstance.put(`/airbnb/${editingAirbnb.id}`, payload);
        closeAlert();
        showSuccess('Listing Updated', 'The Airbnb listing has been successfully updated.');
      } else {
        await apiInstance.post('/airbnb/', payload);
        closeAlert();
        showSuccess('Listing Created', 'The Airbnb listing has been successfully created.');
      }
      
      // Success - close dialog and refresh data
      handleCloseDialog();
      
      // Wait a moment for backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadAirbnbs(); // Ensure data is refreshed
    } catch (err) {
      console.error('Error saving Airbnb:', err);
      closeAlert();
      showError('Save Failed', err.response?.data?.detail || 'Failed to save Airbnb listing');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      'Delete Listing',
      'Are you sure you want to delete this Airbnb listing? This action cannot be undone.',
      'Yes, Delete',
      'Cancel'
    );
    
    if (!result.isConfirmed) {
      return;
    }
    
    const loadingAlert = showLoading('Deleting...', 'Please wait while we delete the listing');
    try {
      // Use authService for consistent authentication
      const apiInstance = authService.createAxiosInstance();
      await apiInstance.delete(`/airbnb/${id}`);
      
      closeAlert();
      
      // Wait a moment for backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadAirbnbs();
      
      showSuccess('Listing Deleted', 'The Airbnb listing has been successfully deleted.');
    } catch (err) {
      console.error('Error deleting Airbnb:', err);
      closeAlert();
      showError('Delete Failed', err.response?.data?.detail || 'Failed to delete Airbnb listing');
    }
  };

  const handleView = async (airbnb) => {
    try {
      // Fetch full Airbnb details to ensure we have complete data including images
      const apiInstance = authService.createAxiosInstance();
      const response = await apiInstance.get(`/airbnb/${airbnb.id}`);
      const fullAirbnb = response.data || response;
      setViewingAirbnb(fullAirbnb);
      setOpenViewDialog(true);
    } catch (err) {
      console.error('Failed to fetch full Airbnb details:', err);
      // Fallback to using the airbnb from the list
      setViewingAirbnb(airbnb);
      setOpenViewDialog(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                <Hotel sx={{ verticalAlign: 'middle', mr: 1 }} />
                Airbnb Management
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Manage listings, bookings, and payments
              </Typography>
            </Box>
            {activeTab === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  },
                  transition: 'all 0.2s'
                }}
              >
                Add Airbnb Listing
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64
            }
          }}
          indicatorColor="primary"
          textColor="primary"
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
      </Card>

      {/* Loading */}
      {loading && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <LinearProgress sx={{ height: 6, borderRadius: 1 }} />
        </Card>
      )}

      {/* TAB 0: LISTINGS */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Country</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Price/Night</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Guests</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Bedrooms</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
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
                    <TableCell>
                      <Typography variant="body2">{airbnb.location}</Typography>
                      {airbnb.country && (
                        <Typography variant="caption" color="text.secondary">
                          {airbnb.country}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={airbnb.country || 'N/A'}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
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
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleView(airbnb)} color="info">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
        </Card>
      )}

      {/* TAB 1: BOOKINGS */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Booking ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Property</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Guest</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Check-in</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Check-out</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Guests</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Total Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Payment</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
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
                      <Typography variant="body2" fontWeight={600}>
                        {booking.airbnb_title || booking.airbnb_id || 'N/A'}
                      </Typography>
                      {booking.airbnb_location && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {booking.airbnb_location}
                        </Typography>
                      )}
                      {booking.airbnb_id && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {booking.airbnb_id}
                        </Typography>
                      )}
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
                      {booking.status && booking.status.toLowerCase() === 'pending' && (
                        <>
                          <Tooltip title="Approve Booking">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔵 Approve button clicked for booking:', booking);
                                if (booking.id) {
                                  handleApproveBooking(booking.id);
                                } else {
                                  showError('Error', 'Booking ID is missing');
                                }
                              }}
                              color="success"
                              sx={{
                                '&:hover': {
                                  bgcolor: 'success.light',
                                  color: 'white'
                                }
                              }}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Decline Booking">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔴 Decline button clicked for booking:', booking);
                                if (booking.id) {
                                  handleDeclineBooking(booking.id);
                                } else {
                                  showError('Error', 'Booking ID is missing');
                                }
                              }}
                              color="error"
                              sx={{
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'white'
                                }
                              }}
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
        </Card>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Booking ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Guest</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Property</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Payment Method</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Date</TableCell>
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
        </Card>
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
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenBookingDialog(false)} variant="outlined">
            Close
          </Button>
          {selectedBooking?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={async () => {
                  setOpenBookingDialog(false);
                  await handleApproveBooking(selectedBooking.id);
                }}
                startIcon={<ApproveIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Approve Booking
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  setOpenBookingDialog(false);
                  await handleDeclineBooking(selectedBooking.id);
                }}
                startIcon={<DeclineIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Decline Booking
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={formData.country}
                  label="Country"
                  onChange={handleChange}
                >
                  <MenuItem value="Uganda">Uganda</MenuItem>
                  <MenuItem value="Kenya">Kenya</MenuItem>
                  <MenuItem value="Tanzania">Tanzania</MenuItem>
                  <MenuItem value="Rwanda">Rwanda</MenuItem>
                  <MenuItem value="Burundi">Burundi</MenuItem>
                  <MenuItem value="South Sudan">South Sudan</MenuItem>
                  <MenuItem value="Ethiopia">Ethiopia</MenuItem>
                  <MenuItem value="Somalia">Somalia</MenuItem>
                  <MenuItem value="Djibouti">Djibouti</MenuItem>
                  <MenuItem value="Eritrea">Eritrea</MenuItem>
                  <MenuItem value="Sudan">Sudan</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
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
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Image Format Tip:</strong> Accepted formats are JPEG, JPG, PNG, or GIF. Maximum file size is 10MB per image.
                </Typography>
              </Alert>
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

      {/* View Airbnb Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Hotel />
            <Typography variant="h6" fontWeight={600}>
              {viewingAirbnb?.title || 'Airbnb Listing Details'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewingAirbnb && (
            <Grid container spacing={3}>
              {/* Images */}
              {viewingAirbnb.images && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Images
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ImageList cols={3} gap={8} sx={{ maxHeight: 400 }}>
                    {viewingAirbnb.images.split('|||IMAGE_SEPARATOR|||').map((image, index) => (
                      image && (
                        <ImageListItem key={index}>
                          <img
                            src={image}
                            alt={`${viewingAirbnb.title} - Image ${index + 1}`}
                            style={{ height: 200, objectFit: 'cover', width: '100%' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </ImageListItem>
                      )
                    ))}
                  </ImageList>
                </Grid>
              )}

              {/* Basic Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    <HomeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Title:</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewingAirbnb.title}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Location:</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewingAirbnb.location}{viewingAirbnb.country ? `, ${viewingAirbnb.country}` : ''}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Description:</Typography>
                      <Typography variant="body2">{viewingAirbnb.description || 'No description provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Price per Night:</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {viewingAirbnb.currency} {parseFloat(viewingAirbnb.price_per_night || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Max Guests:</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewingAirbnb.max_guests}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Bedrooms:</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewingAirbnb.bedrooms}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Bathrooms:</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewingAirbnb.bathrooms}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Status:</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={viewingAirbnb.is_available}
                          size="small"
                          color={viewingAirbnb.is_available === 'available' ? 'success' : 'default'}
                        />
                      </Box>
                    </Grid>
                    {viewingAirbnb.amenities && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Amenities:</Typography>
                        <Typography variant="body2">{viewingAirbnb.amenities}</Typography>
                      </Grid>
                    )}
                    {viewingAirbnb.house_rules && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">House Rules:</Typography>
                        <Typography variant="body2">{viewingAirbnb.house_rules}</Typography>
                      </Grid>
                    )}
                    {viewingAirbnb.created_at && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Created At:</Typography>
                        <Typography variant="body2">
                          {new Date(viewingAirbnb.created_at).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {viewingAirbnb.updated_at && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Last Updated:</Typography>
                        <Typography variant="body2">
                          {new Date(viewingAirbnb.updated_at).toLocaleString()}
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
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {viewingAirbnb && (
            <Button
              variant="contained"
              onClick={() => {
                setOpenViewDialog(false);
                handleOpenDialog(viewingAirbnb);
              }}
              startIcon={<Edit />}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminAirbnb;
