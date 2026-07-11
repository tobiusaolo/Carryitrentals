import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
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
import { propertyAPI } from '../../services/api/propertyAPI';
import { showSuccess, showError, showConfirm, showLoading, closeAlert, showWarning, showInfo } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';
import AirbnbListingFormFields from '../../components/Forms/AirbnbListingFormFields';
import { emptyAirbnbFormState, MIN_AIRBNB_IMAGES, getAirbnbPropertyTypeLabel } from '../../constants/airbnb';
import DataTable from '../../components/UI/DataTable';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import TableActions from '../../components/UI/TableActions';
import PageHeader from '../../components/UI/PageHeader';
import AdminPage from '../../components/Admin/AdminPage';
import AdminTabbedPage from '../../components/Admin/AdminTabbedPage';
import { adminPrimaryButtonSx, portalOutlinedButtonSx } from '../../theme/designTokens';
import {
  buildAirbnbListingColumns,
  buildAirbnbBookingColumns,
  buildAirbnbPaymentColumns,
} from './columns/adminAirbnbColumns';

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
  
  const [formData, setFormData] = useState(emptyAirbnbFormState());
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadData();
    loadProperties();
  }, [activeTab]);

  const loadProperties = async () => {
    try {
      const res = await propertyAPI.getAllProperties();
      setProperties(res.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const [searchParams] = useSearchParams();
  const prefillApplied = useRef(false);
  useEffect(() => {
    const requestId = searchParams.get('request_id');
    if (!requestId || prefillApplied.current) return;
    prefillApplied.current = true;
    const propertyId = searchParams.get('property_id') || '';
    const prop = properties.find((p) => String(p.id) === String(propertyId));
    setFormData({
      ...emptyAirbnbFormState(),
      property_id: propertyId,
      title: searchParams.get('title') || '',
      description: searchParams.get('notes') || '',
      location: prop ? [prop.address, prop.city].filter(Boolean).join(', ') : '',
      country: prop?.country || emptyAirbnbFormState().country,
    });
    setEditingAirbnb(null);
    setSelectedImages([]);
    setOpenDialog(true);
  }, [searchParams, properties]);

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
            return { ...booking, status: 'confirmed' };
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
        ...emptyAirbnbFormState(),
        title: airbnb.title,
        description: airbnb.description || '',
        location: airbnb.location,
        country: airbnb.country || emptyAirbnbFormState().country,
        property_type: airbnb.property_type || emptyAirbnbFormState().property_type,
        price_per_night: airbnb.price_per_night,
        currency: airbnb.currency || emptyAirbnbFormState().currency,
        max_guests: airbnb.max_guests,
        bedrooms: airbnb.bedrooms,
        bathrooms: airbnb.bathrooms,
        amenities: airbnb.amenities || '',
        house_rules: airbnb.house_rules || '',
        is_available: airbnb.is_available || 'available',
      });
      setSelectedImages([]);
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
    setFormData(emptyAirbnbFormState());
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

      const requestId = searchParams.get('request_id');
      const payload = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        max_guests: parseInt(formData.max_guests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        ...(imagesBase64 && { images: imagesBase64 }),
        ...(!editingAirbnb && requestId ? { listing_request_id: requestId } : {}),
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

  const listingColumns = buildAirbnbListingColumns({
    handleView,
    handleOpenDialog,
    handleDelete,
  });

  const bookingColumns = buildAirbnbBookingColumns({
    formatDate,
    formatCurrency,
    handleViewBookingDetails,
    handleApproveBooking,
    handleDeclineBooking,
  });

  const paymentColumns = buildAirbnbPaymentColumns({ formatDate, formatCurrency });

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Airbnb"
        subtitle="Listings, bookings, and payments"
        action={
          activeTab === 0 ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={adminPrimaryButtonSx}
            >
              Add listing
            </Button>
          ) : (
            <Button
              startIcon={<Add />}
              onClick={loadData}
              variant="outlined"
              size="small"
              sx={portalOutlinedButtonSx}
            >
              Refresh
            </Button>
          )
        }
      />

      <AdminTabbedPage
        activeTab={activeTab}
        onTabChange={(e, newValue) => setActiveTab(newValue)}
        tabs={[
          { id: 'listings', label: `Listings (${airbnbs.length})`, icon: <Hotel fontSize="small" /> },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: <CalendarIcon fontSize="small" /> },
          { id: 'payments', label: `Payments (${payments.length})`, icon: <PaymentIcon fontSize="small" /> },
        ]}
      >
        {loading && <LinearProgress sx={{ mb: 2, height: 4, borderRadius: 1 }} />}

      {/* TAB 0: LISTINGS */}
      {activeTab === 0 && (
        <DataTable
          columns={listingColumns}
          rows={airbnbs}
          loading={loading}
          title="Airbnb Listings"
          subtitle={`${airbnbs.length} listing${airbnbs.length === 1 ? '' : 's'}`}
          emptyTitle="No Airbnb listings yet"
          emptyDescription='Click "Add Airbnb Listing" to create one.'
          emptyIcon={HomeIcon}
          emptyActionLabel="Add Airbnb Listing"
          onEmptyAction={() => handleOpenDialog()}
          searchPlaceholder="Search by title, location, or country…"
        />
      )}

      {/* TAB 1: BOOKINGS */}
      {activeTab === 1 && (
        <DataTable
          columns={bookingColumns}
          rows={bookings}
          loading={loading}
          title="Bookings"
          subtitle={`${bookings.length} booking${bookings.length === 1 ? '' : 's'}`}
          emptyTitle="No bookings yet"
          emptyDescription="Guest bookings will appear here once submitted."
          emptyIcon={CalendarIcon}
          searchPlaceholder="Search by guest, property, or booking ID…"
        />
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 2 && (
        <DataTable
          columns={paymentColumns}
          rows={payments}
          loading={loading}
          title="Payments"
          subtitle={`${payments.length} payment${payments.length === 1 ? '' : 's'}`}
          emptyTitle="No payments yet"
          emptyDescription="Payment transactions will appear here once guests pay."
          emptyIcon={PaymentIcon}
          searchPlaceholder="Search by guest, property, or transaction ID…"
        />
      )}

      </AdminTabbedPage>

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
          <AirbnbListingFormFields
            formData={formData}
            setFormData={setFormData}
            properties={properties}
            requireProperty
            selectedImages={selectedImages}
            onImageSelect={handleImageSelect}
            onRemoveImage={handleRemoveImage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saveLoading || (!editingAirbnb && selectedImages.length < MIN_AIRBNB_IMAGES)}
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
                      <Typography variant="caption" color="text.secondary">Property type:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getAirbnbPropertyTypeLabel(viewingAirbnb.property_type)}
                      </Typography>
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

    </AdminPage>
  );
};

export default AdminAirbnb;
