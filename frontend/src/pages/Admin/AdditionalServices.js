import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Divider,
  Badge,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as MovingIcon,
  Inventory as PackagingIcon,
  CleaningServices as CleaningIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import additionalServicesAPI from '../../services/api/additionalServicesAPI';
import authService from '../../services/authService';

const AdditionalServices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingService, setViewingService] = useState(null);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [expandedService, setExpandedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = authService.createAxiosInstance();
      
      // Try the admin stats endpoint first
      try {
        const response = await api.get('/additional-services/admin/stats');
        console.log('Admin stats response:', response.data);
        
        if (response.data) {
          // Handle different response formats
          if (response.data.services && Array.isArray(response.data.services)) {
            setServices(response.data.services);
            setError(null);
            return;
          } else if (Array.isArray(response.data)) {
            // If response.data is directly an array
            setServices(response.data);
            setError(null);
            return;
          } else if (response.data.total_services !== undefined) {
            // If it's the stats response format
            setServices(response.data.services || []);
            setError(null);
            return;
          }
        }
      } catch (statsError) {
        console.warn('Stats endpoint failed:', statsError);
        console.warn('Error details:', {
          status: statsError.response?.status,
          data: statsError.response?.data,
          message: statsError.message
        });
      }
      
      // Fallback to regular endpoint
      console.log('Trying fallback endpoint...');
      const fallbackResponse = await api.get('/additional-services/');
      const servicesData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
      console.log('Loaded services from fallback:', servicesData.length);
      
      // Add empty stats for services that don't have them
      const servicesWithStats = servicesData.map(service => ({
        ...service,
        booking_count: service.booking_count || 0,
        bookings: service.bookings || []
      }));
      setServices(servicesWithStats);
      setError(null);
    } catch (err) {
      console.error('Error loading services:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to load additional services. Please try again.';
      setError(`Error: ${errorMessage}. ${err.response?.status ? `Status: ${err.response.status}` : ''}`);
      // Set empty array so UI doesn't break
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceBookings = async (serviceId) => {
    setLoadingBookings(true);
    setServiceBookings([]); // Clear previous bookings
    try {
      const api = authService.createAxiosInstance();
      const response = await api.get(`/additional-services/${serviceId}/bookings`);
      console.log('Bookings response:', response.data);
      
      // Handle different response formats
      let bookings = [];
      if (response.data) {
        if (response.data.bookings && Array.isArray(response.data.bookings)) {
          bookings = response.data.bookings;
        } else if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          bookings = response.data.data;
        }
      }
      
      console.log(`Loaded ${bookings.length} bookings for service ${serviceId}`);
      setServiceBookings(bookings);
      setError(null);
    } catch (err) {
      console.error('Error loading service bookings:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError('Failed to load bookings for this service');
      setServiceBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleExpandService = async (serviceId) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
      setServiceBookings([]);
    } else {
      setExpandedService(serviceId);
      await loadServiceBookings(serviceId);
    }
  };

  const handleViewServiceDetails = async (service) => {
    setViewingService(service);
    setOpenViewDialog(true); // Open dialog immediately for better UX
    // Load bookings in the background
    loadServiceBookings(service.id);
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        is_active: service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      is_active: true
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const api = authService.createAxiosInstance();
      
      if (editingService) {
        await api.put(`/additional-services/${editingService.id}`, formData);
      } else {
        await api.post('/additional-services/', formData);
      }

      setSuccess(editingService ? 'Service updated successfully' : 'Service created successfully');
      handleCloseDialog();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadServices();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.detail || 'Failed to save service');
      setTimeout(() => setError(null), 5000);
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const api = authService.createAxiosInstance();
      await api.delete(`/additional-services/${serviceId}`);

      setSuccess('Service deleted successfully');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadServices();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.response?.data?.detail || 'Failed to delete service');
      setTimeout(() => setError(null), 5000);
      setLoading(false);
    }
  };

  const getServiceIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('moving')) return <MovingIcon />;
    if (lowerName.includes('packaging')) return <PackagingIcon />;
    if (lowerName.includes('cleaning')) return <CleaningIcon />;
    return <AddIcon />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'confirmed' || statusLower === 'completed') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'cancelled') return 'error';
    return 'default';
  };

  if (loading && services.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Additional Services Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage services and view bookings - Ordered by most used first
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Add Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Services List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {services.map((service) => (
          <Card key={service.id} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'primary.light', 
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {getServiceIcon(service.name)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {service.name}
                      </Typography>
                      {/* Prominent Order Count Alert/Badge */}
                      {(service.booking_count || 0) > 0 && (
                        <Alert 
                          severity="info" 
                          icon={<></>}
                          sx={{ 
                            py: 0, 
                            px: 1.5,
                            minHeight: 'auto',
                            fontSize: '0.75rem',
                            '& .MuiAlert-message': {
                              py: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }
                          }}
                        >
                          <Typography variant="h6" fontWeight={700} color="primary">
                            {service.booking_count || 0}
                          </Typography>
                          <Typography variant="caption">
                            {service.booking_count === 1 ? 'Order' : 'Orders'}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {service.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        label={`UGX ${parseFloat(service.price || 0).toLocaleString()}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={service.is_active ? 'Active' : 'Inactive'}
                        color={service.is_active ? 'success' : 'default'}
                        size="small"
                      />
                      {/* Larger Badge for Order Count */}
                      {(service.booking_count || 0) > 0 ? (
                        <Badge 
                          badgeContent={service.booking_count || 0} 
                          color="error"
                          max={999}
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.75rem',
                              height: '24px',
                              minWidth: '24px',
                              padding: '0 6px',
                              fontWeight: 700
                            }
                          }}
                        >
                          <Chip
                            label="Total Orders"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Badge>
                      ) : (
                        <Chip
                          label="No Orders Yet"
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details & Bookings">
                    <IconButton
                      size="small"
                      onClick={() => handleViewServiceDetails(service)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Service">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(service)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Service">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(service.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Expandable Bookings Section */}
              {(service.booking_count > 0 || service.bookings?.length > 0) && (
                <Accordion 
                  expanded={expandedService === service.id}
                  onChange={() => handleExpandService(service.id)}
                  sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      View Recent Bookings ({service.booking_count || service.bookings?.length || 0})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {loadingBookings ? (
                      <LinearProgress sx={{ mb: 2 }} />
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Client</strong></TableCell>
                              <TableCell><strong>Contact</strong></TableCell>
                              <TableCell><strong>Property</strong></TableCell>
                              <TableCell><strong>Booking Date</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Date Added</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(service.bookings || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                    No bookings found for this service
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              (service.bookings || []).map((booking) => (
                                <TableRow key={booking.booking_id} hover>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        <PersonIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                        {booking.contact_name || 'N/A'}
                                      </Typography>
                                      {booking.contact_email && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          <EmailIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                          {booking.contact_email}
                                        </Typography>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                      {booking.contact_phone || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {booking.rental_unit?.title || booking.rental_unit_id || 'N/A'}
                                    </Typography>
                                    {booking.rental_unit?.location && (
                                      <Typography variant="caption" color="text.secondary">
                                        {booking.rental_unit.location}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {formatDate(booking.booking_date)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={booking.status || 'N/A'}
                                      size="small"
                                      color={getStatusColor(booking.status)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(booking.created_at)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && !loading && (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No additional services found. Click "Add Service" to create one.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* View Service Details Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewingService && getServiceIcon(viewingService.name)}
            <Typography variant="h6" fontWeight={600}>
              {viewingService?.name} - Bookings & Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewingService && (
            <Grid container spacing={3}>
              {/* Service Info */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Service Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight={600}>{viewingService.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Price</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          UGX {parseFloat(viewingService.price || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Description</Typography>
                        <Typography variant="body1">{viewingService.description || 'No description'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={viewingService.is_active ? 'Active' : 'Inactive'}
                            color={viewingService.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Total Bookings</Typography>
                        <Typography variant="h6" color="primary">
                          {viewingService.booking_count || serviceBookings.length || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Bookings List */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  All Bookings (Latest First)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {loadingBookings ? (
                  <LinearProgress />
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Client Name</strong></TableCell>
                          <TableCell><strong>Contact Info</strong></TableCell>
                          <TableCell><strong>Property</strong></TableCell>
                          <TableCell><strong>Booking Date</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Date Added</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadingBookings ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                                <CircularProgress size={24} sx={{ mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  Loading bookings...
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : serviceBookings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                {viewingService?.booking_count > 0 
                                  ? `No bookings loaded yet (${viewingService.booking_count} expected). Please try again.`
                                  : 'No bookings found for this service'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          serviceBookings.map((booking) => (
                            <TableRow key={booking.booking_id || booking.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" fontWeight={600}>
                                    {booking.contact_name || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    <PhoneIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                    {booking.contact_phone || 'N/A'}
                                  </Typography>
                                  {booking.contact_email && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      <EmailIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                      {booking.contact_email}
                                    </Typography>
                                  )}
                                  {booking.contact_country && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {booking.contact_country}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    <HomeIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                    {booking.rental_unit?.title || booking.rental_unit_id || 'N/A'}
                                  </Typography>
                                  {booking.rental_unit?.location && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {booking.rental_unit.location}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {formatDate(booking.booking_date)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={booking.status || 'N/A'}
                                  size="small"
                                  color={getStatusColor(booking.status)}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(booking.created_at)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="View Inspection Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      // Navigate to inspection details
                                      window.location.href = `/admin/inspections?booking_id=${booking.id || booking.booking_id}`;
                                    }}
                                    color="primary"
                                  >
                                    <ViewIcon fontSize="small" />
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
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Service Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Moving, Packaging, Cleaning"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Price (UGX)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 50000"
              inputProps={{ min: 0, step: 1000 }}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.price}
            sx={{ textTransform: 'none' }}
          >
            {editingService ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdditionalServices;
