import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Menu,
  ButtonGroup,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  Receipt as ReceiptIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../../services/authService';
import { showSuccess, showError, showConfirm, showLoading, closeAlert, showInfo } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';

const AdminInspections = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [units, setUnits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [formData, setFormData] = useState({
    rental_unit_id: '',
    agent_id: '',
    inspection_type: '',
    scheduled_date: '',
    preferred_time_slot: '',
    status: 'pending',
    notes: '',
    message: ''
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [viewingInspection, setViewingInspection] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedInspectionForMenu, setSelectedInspectionForMenu] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadInspections();
      loadUnits();
      loadAgents();
      loadPaymentMethods();
    }
  }, [user, page, rowsPerPage]);

  const loadInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use axios instance from authService which has proper interceptors
      const api = authService.createAxiosInstance();
      const skip = page * rowsPerPage;
      console.log(`📥 Loading inspections: skip=${skip}, limit=${rowsPerPage}`);
      
      const response = await api.get(`/admin/inspection-bookings?skip=${skip}&limit=${rowsPerPage}`);
      
      console.log(`✅ Inspection response:`, response.data);
      
      // Handle paginated response
      let inspectionsData = [];
      let total = 0;
      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          // Direct array response
          inspectionsData = response.data;
          total = response.data.length;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Paginated response with items
          inspectionsData = response.data.items;
          total = response.data.total || response.data.items.length;
        } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
          // Alternative paginated format
          inspectionsData = response.data.bookings;
          total = response.data.total || response.data.bookings.length;
        } else {
          // Try to find any array in the response
          const keys = Object.keys(response.data);
          for (const key of keys) {
            if (Array.isArray(response.data[key])) {
              inspectionsData = response.data[key];
              total = response.data.total || response.data[key].length;
              break;
            }
          }
        }
      }
      
      console.log(`✅ Loaded ${inspectionsData.length} inspections (page ${page + 1}, total: ${total})`);
      setInspections(inspectionsData);
      setTotalCount(total);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to load inspections:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setError(err.response?.data?.detail || err.message || 'Failed to load inspections');
      setInspections([]);
      setTotalCount(0);
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      // Fetch real rental units from API
      const api = authService.createAxiosInstance();
      const response = await api.get('/rental-units/');
      setUnits(response.data);
    } catch (err) {
      console.error('Failed to load units:', err);
      // Fallback to empty array if API fails
      setUnits([]);
    }
  };

  const loadAgents = async () => {
    try {
      // Fetch real agents from API
      const api = authService.createAxiosInstance();
      const response = await api.get('/agents/');
      setAgents(response.data);
    } catch (err) {
      console.error('Failed to load agents:', err);
      // Fallback to empty array if API fails
      setAgents([]);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      // Mock payment methods data
      const mockPaymentMethods = [
        { 
          id: 1, 
          name: 'MTN Mobile Money', 
          type: 'mtn_mobile_money',
          account_number: '256700000000',
          account_name: 'Admin MTN',
          is_active: true
        },
        { 
          id: 2, 
          name: 'Airtel Money', 
          type: 'airtel_money',
          account_number: '256700000001',
          account_name: 'Admin Airtel',
          is_active: true
        },
        { 
          id: 3, 
          name: 'Bank Account', 
          type: 'bank_account',
          account_number: '1234567890',
          account_name: 'Admin Bank Account',
          bank_name: 'Example Bank',
          is_active: true
        }
      ];
      setPaymentMethods(mockPaymentMethods);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    }
  };

  const handleGenerateQRCode = async (inspection) => {
    try {
      setSelectedInspection(inspection);
      // Mock QR code generation
      const mockQRData = {
        payment_id: 1,
        amount: 50,
        currency: 'UGX',
        payment_url: `${window.location.origin}/inspection-payment/1`,
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        payment_methods: paymentMethods
      };
      setQrCodeData(mockQRData);
      setQrCodeDialogOpen(true);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  const handlePaymentManagement = (inspection) => {
    setSelectedInspection(inspection);
    setPaymentDialogOpen(true);
  };

  const handleOpenDialog = (inspection = null) => {
    if (inspection) {
      setEditingInspection(inspection);
      // Map inspection data to form data
      // Convert booking_date to datetime-local format (YYYY-MM-DDTHH:mm)
      let bookingDateTime = '';
      if (inspection.booking_date) {
        const date = new Date(inspection.booking_date);
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        bookingDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      setFormData({
        rental_unit_id: inspection.rental_unit_id || inspection.unit_id || '',
        agent_id: inspection.agent_id || '',
        inspection_type: inspection.inspection_type || '',
        scheduled_date: bookingDateTime,
        preferred_time_slot: inspection.preferred_time_slot || '',
        status: inspection.status || 'pending',
        notes: inspection.notes || '',
        message: inspection.message || ''
      });
    } else {
      setEditingInspection(null);
      setFormData({
        rental_unit_id: '',
        agent_id: '',
        inspection_type: '',
        scheduled_date: '',
        preferred_time_slot: '',
        status: 'pending',
        notes: '',
        message: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInspection(null);
  };

  const handleView = async (inspection) => {
    try {
      const api = authService.createAxiosInstance();
      const response = await api.get(`/admin/inspection-bookings/${inspection.id}`);
      console.log('📋 Inspection details fetched:', {
        id: response.data.id,
        has_additional_services: !!response.data.additional_services,
        additional_services_count: response.data.additional_services?.length || 0,
        additional_service_ids: response.data.additional_service_ids,
        full_data: response.data
      });
      setViewingInspection(response.data);
    } catch (err) {
      console.error('Failed to fetch inspection details:', err);
      // Fallback to using the inspection from the list
      console.log('📋 Using fallback inspection data:', {
        id: inspection.id,
        has_additional_services: !!inspection.additional_services,
        additional_services_count: inspection.additional_services?.length || 0,
        additional_service_ids: inspection.additional_service_ids
      });
      setViewingInspection(inspection);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rental_unit_id && !editingInspection) {
      showError('Validation Error', 'Please select a rental unit');
      return;
    }
    
    const loadingAlert = showLoading(
      editingInspection ? 'Updating...' : 'Creating...',
      'Please wait while we save the inspection'
    );
    setLoading(true);
    
    try {
      const api = authService.createAxiosInstance();
      
      if (editingInspection) {
        // Update inspection
        const updateData = {
          status: formData.status,
          notes: formData.notes,
          message: formData.message,
          booking_date: formData.scheduled_date ? new Date(formData.scheduled_date).toISOString() : undefined,
          preferred_time_slot: formData.preferred_time_slot || undefined
        };
        
        const response = await api.put(`/admin/inspection-bookings/${editingInspection.id}`, updateData);
        console.log('Inspection updated:', response.data);
        setError(null);
      } else {
        // Create new inspection booking via public endpoint
        const createData = {
          rental_unit_id: formData.rental_unit_id,
          contact_name: 'Admin Created',
          contact_phone: '+256700000000',
          contact_email: 'admin@carryit.com',
          booking_date: formData.scheduled_date ? new Date(formData.scheduled_date).toISOString() : new Date().toISOString(),
          preferred_time_slot: formData.preferred_time_slot || 'morning',
          message: formData.message || '',
          additional_service_ids: []
        };
        
        const response = await api.post('/inspection-bookings/public', createData);
        console.log('Inspection created:', response.data);
        setError(null);
      }
      
      closeAlert();
      
      // Close dialog first
      handleCloseDialog();
      
      // Wait a brief moment for the backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload inspections to show updated data
      await loadInspections();
      
      // Show success message
      showSuccess(
        editingInspection ? 'Inspection Updated' : 'Inspection Created',
        editingInspection ? 'The inspection has been successfully updated.' : 'The inspection has been successfully created.'
      );
    } catch (err) {
      console.error('Failed to save inspection:', err);
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save inspection';
      setError(errorMessage);
      showError('Save Failed', errorMessage);
      setLoading(false);
    }
  };

  const handleDelete = async (inspectionId) => {
    const result = await showConfirm(
      'Delete Inspection',
      'Are you sure you want to delete this inspection? This action cannot be undone.',
      'Yes, Delete',
      'Cancel'
    );
    
    if (result.isConfirmed) {
      const loadingAlert = showLoading('Deleting...', 'Please wait while we delete the inspection');
      try {
        const api = authService.createAxiosInstance();
        const response = await api.delete(`/admin/inspection-bookings/${inspectionId}`);
        console.log('Inspection deleted:', response.data);
        
        closeAlert();
        
        // Wait a brief moment for the backend to process, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Reload inspections to show updated data
        await loadInspections();
        setError(null);
        showSuccess('Inspection Deleted', 'The inspection has been successfully deleted.');
      } catch (err) {
        console.error('Failed to delete inspection:', err);
        closeAlert();
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete inspection';
        setError(errorMessage);
        showError('Delete Failed', errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'pending': return <ScheduleIcon />;
      case 'confirmed': return <CheckCircleIcon />;
      case 'in_progress': return <BuildIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'cancelled': return <WarningIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const handleApproveBooking = async (bookingId) => {
    const result = await showConfirm(
      'Approve Inspection',
      'Are you sure you want to approve this inspection? An SMS notification will be sent to the client.',
      'Yes, Approve',
      'Cancel'
    );
    
    if (!result.isConfirmed) {
      return;
    }
    
    const loadingAlert = showLoading('Approving...', 'Please wait while we approve the inspection');
    setLoading(true);
    try {
      const api = authService.createAxiosInstance();
      await api.patch(`/admin/inspection-bookings/${bookingId}/approve`, {});
      
      closeAlert();
      setError(null);
      
      // Wait a brief moment for the backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload inspections to show updated status
      await loadInspections();
      showSuccess('Inspection Approved', 'The inspection has been approved and an SMS has been sent to the client.');
    } catch (err) {
      console.error('Error approving inspection:', err);
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to approve inspection';
      setError(errorMessage);
      showError('Approval Failed', errorMessage);
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Inspection',
      text: 'Enter reason for rejection (optional):',
      input: 'textarea',
      inputPlaceholder: 'Enter rejection reason...',
      inputAttributes: {
        'aria-label': 'Enter rejection reason'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
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
      return;
    }
    
    const loadingAlert = showLoading('Rejecting...', 'Please wait while we reject the inspection');
    setLoading(true);
    try {
      const api = authService.createAxiosInstance();
      await api.patch(
        `/admin/inspection-bookings/${bookingId}/reject`,
        {},
        {
          params: reason ? { reason } : {}
        }
      );
      
      closeAlert();
      setError(null);
      
      // Wait a brief moment for the backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload inspections to show updated status
      await loadInspections();
      showSuccess('Inspection Rejected', 'The inspection has been rejected and an SMS has been sent to the client.');
    } catch (err) {
      console.error('Error rejecting inspection:', err);
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to reject inspection';
      setError(errorMessage);
      showError('Rejection Failed', errorMessage);
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Inspections Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Schedule and manage inspections for available rental units. Track inspection history and assign agents to conduct inspections.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{inspections.length}</Typography>
                  <Typography color="text.secondary">Total Inspections</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {inspections.filter(i => i.status?.toLowerCase() === 'pending').length}
                  </Typography>
                  <Typography color="text.secondary">Pending</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {inspections.filter(i => i.status?.toLowerCase() === 'confirmed').length}
                  </Typography>
                  <Typography color="text.secondary">Confirmed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {inspections.filter(i => i.status?.toLowerCase() === 'completed').length}
                  </Typography>
                  <Typography color="text.secondary">Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {inspections.filter(i => i.status?.toLowerCase() === 'cancelled').length}
                  </Typography>
                  <Typography color="text.secondary">Cancelled</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inspections Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Inspections
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Schedule Inspection
            </Button>
          </Box>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Inspection ID</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && inspections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No inspections found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && inspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    {/* Inspection ID */}
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        #{inspection.id}
                      </Typography>
                      {inspection.is_public_booking && (
                        <Chip 
                          label="Public" 
                          size="small" 
                          color="info"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    
                    {/* Property */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {inspection.rental_unit?.title || inspection.rental_unit?.name || inspection.rental_unit_id || `Booking ID: ${inspection.id}`}
                        </Typography>
                        {inspection.rental_unit?.location && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {inspection.rental_unit.location}
                          </Typography>
                        )}
                        {inspection.rental_unit?.unit_type && (
                          <Typography variant="caption" display="block" color="primary">
                            {inspection.rental_unit.unit_type}
                          </Typography>
                        )}
                        {inspection.rental_unit_id && !inspection.rental_unit && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Unit ID: {inspection.rental_unit_id}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    {/* Client */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {inspection.contact_name || inspection.tenant?.name || 'N/A'}
                        </Typography>
                        {inspection.contact_email && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {inspection.contact_email}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    {/* Contact */}
                    <TableCell>
                      <Typography variant="body2">
                        {inspection.contact_phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    {/* Date & Time */}
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(inspection.booking_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {inspection.preferred_time_slot ? 
                          inspection.preferred_time_slot.charAt(0).toUpperCase() + inspection.preferred_time_slot.slice(1) 
                          : 'Not specified'}
                      </Typography>
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell>
                      <Chip 
                        label={inspection.status} 
                        color={getStatusColor(inspection.status)}
                        size="small" 
                      />
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell sx={{ minWidth: 200 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {/* Primary Actions - Status-based */}
                        {inspection.status?.toLowerCase() === 'pending' && (
                          <>
                            <Tooltip title="Approve Inspection">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleApproveBooking(inspection.id)}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  boxShadow: 2,
                                  px: 2,
                                  '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject Inspection">
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleRejectBooking(inspection.id)}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  boxShadow: 2,
                                  px: 2,
                                  '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        
                        {/* Show status badge for non-pending inspections */}
                        {inspection.status?.toLowerCase() !== 'pending' && (
                          <Chip
                            label={inspection.status}
                            color={getStatusColor(inspection.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        
                        {/* Secondary Actions Menu */}
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setActionMenuAnchor(e.currentTarget);
                              setSelectedInspectionForMenu(inspection);
                            }}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              ml: 'auto',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.main',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Actions Menu */}
          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={() => {
              setActionMenuAnchor(null);
              setSelectedInspectionForMenu(null);
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                if (selectedInspectionForMenu) {
                  handleView(selectedInspectionForMenu);
                }
                setActionMenuAnchor(null);
                setSelectedInspectionForMenu(null);
              }}
              sx={{ py: 1.5 }}
            >
              <ViewIcon sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2">View Details</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedInspectionForMenu) {
                  handleOpenDialog(selectedInspectionForMenu);
                }
                setActionMenuAnchor(null);
                setSelectedInspectionForMenu(null);
              }}
              sx={{ py: 1.5 }}
            >
              <EditIcon sx={{ mr: 2, fontSize: 20, color: 'info.main' }} />
              <Typography variant="body2">Edit Inspection</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                if (selectedInspectionForMenu) {
                  handleDelete(selectedInspectionForMenu.id);
                }
                setActionMenuAnchor(null);
                setSelectedInspectionForMenu(null);
              }}
              sx={{ 
                py: 1.5,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.dark'
                }
              }}
            >
              <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
              <Typography variant="body2" fontWeight={600}>Delete Inspection</Typography>
            </MenuItem>
          </Menu>
          
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(event, newPage) => {
              setPage(newPage);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0); // Reset to first page when changing rows per page
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Inspections per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Inspection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInspection ? 'Edit Inspection' : 'Schedule New Inspection'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Rental Unit</InputLabel>
                  <Select
                    name="rental_unit_id"
                    value={formData.rental_unit_id}
                    onChange={(e) => setFormData({...formData, rental_unit_id: e.target.value})}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            {unit.title} - {unit.location}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Agent</InputLabel>
                  <Select
                    name="agent_id"
                    value={formData.agent_id}
                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                  >
                    {agents.length > 0 ? (
                      agents.map((agent) => (
                        <MenuItem key={agent.id} value={agent.id}>
                          {agent.name || agent.first_name + ' ' + agent.last_name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No agents available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Inspection Type</InputLabel>
                  <Select
                    name="inspection_type"
                    value={formData.inspection_type}
                    onChange={(e) => setFormData({...formData, inspection_type: e.target.value})}
                  >
                    <MenuItem value="Move-in">Move-in</MenuItem>
                    <MenuItem value="Move-out">Move-out</MenuItem>
                    <MenuItem value="Routine">Routine</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Booking Date & Time"
                  name="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Time Slot</InputLabel>
                  <Select
                    name="preferred_time_slot"
                    value={formData.preferred_time_slot}
                    onChange={(e) => setFormData({...formData, preferred_time_slot: e.target.value})}
                  >
                    <MenuItem value="morning">Morning</MenuItem>
                    <MenuItem value="afternoon">Afternoon</MenuItem>
                    <MenuItem value="evening">Evening</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message/Notes"
                  name="message"
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Additional notes or message for the client"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Internal notes (not visible to client)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingInspection ? 'Update' : 'Schedule'} Inspection
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onClose={() => setQrCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon />
          Payment QR Code
        </DialogTitle>
        <DialogContent>
          {qrCodeData && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                Inspection Payment QR Code
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Amount: {qrCodeData.currency} {qrCodeData.amount} (60% of inspection fee)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img 
                  src={qrCodeData.qr_code} 
                  alt="Payment QR Code" 
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Scan this QR code to complete payment
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Payment URL: {qrCodeData.payment_url}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.open(qrCodeData?.payment_url, '_blank')}>
            Open Payment Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Management Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          Payment Management
        </DialogTitle>
        <DialogContent>
          {selectedInspection && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Inspection #{selectedInspection.id} - Unit {selectedInspection.unit_number}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon />
                        Payment Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Inspection Fee: UGX 100,000
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Amount to Pay (60%): UGX 60,000
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Remaining (40%): UGX 40,000
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaymentIcon />
                        Payment Status
                      </Typography>
                      <Chip 
                        label="Pending Payment" 
                        color="warning" 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No payment received yet
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Payment Methods
                </Typography>
                <List>
                  {paymentMethods.map((method) => (
                    <ListItem key={method.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: method.type === 'mtn_mobile_money' ? '#FFD700' : 
                                               method.type === 'airtel_money' ? '#E60012' : '#1976D2' }}>
                          <PaymentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={method.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {method.account_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.account_number}
                            </Typography>
                            {method.bank_name && (
                              <Typography variant="body2" color="text.secondary">
                                {method.bank_name}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="success">
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Inspection Dialog */}
      <Dialog open={!!viewingInspection} onClose={() => setViewingInspection(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" component="span">Inspection Details</Typography>
            </Box>
            {viewingInspection && (
              <Chip 
                label={viewingInspection.status} 
                color={getStatusColor(viewingInspection.status)}
                size="medium"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingInspection && (
            <Box sx={{ mt: 2 }}>
              {/* Basic Information Card */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <HomeIcon color="primary" />
                    Property Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Property</Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {viewingInspection.rental_unit?.title || viewingInspection.rental_unit?.name || 'N/A'}
                      </Typography>
                      {viewingInspection.rental_unit?.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {viewingInspection.rental_unit.location}
                        </Typography>
                      )}
                      {viewingInspection.rental_unit?.unit_type && (
                        <Chip 
                          label={viewingInspection.rental_unit.unit_type} 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Inspection ID</Typography>
                      <Typography variant="body1" fontWeight="bold">#{viewingInspection.id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Booking Date</Typography>
                      <Typography variant="body1">
                        {viewingInspection.booking_date ? new Date(viewingInspection.booking_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Preferred Time Slot</Typography>
                      <Chip 
                        label={viewingInspection.preferred_time_slot ? 
                          viewingInspection.preferred_time_slot.charAt(0).toUpperCase() + viewingInspection.preferred_time_slot.slice(1) 
                          : 'Not specified'} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Client Information Card */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="primary" />
                    Client Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Name</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {viewingInspection.contact_name || viewingInspection.tenant?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Contact Phone</Typography>
                      <Typography variant="body1">
                        {viewingInspection.contact_phone || 'N/A'}
                      </Typography>
                    </Grid>
                    {viewingInspection.contact_email && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Email</Typography>
                        <Typography variant="body1">{viewingInspection.contact_email}</Typography>
                      </Grid>
                    )}
                    {viewingInspection.contact_country && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Country</Typography>
                        <Typography variant="body1">{viewingInspection.contact_country}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Additional Services Card */}
              {(() => {
                const hasServices = viewingInspection.additional_services && viewingInspection.additional_services.length > 0;
                const hasServiceIds = viewingInspection.additional_service_ids && 
                  (Array.isArray(viewingInspection.additional_service_ids) ? viewingInspection.additional_service_ids.length > 0 : true);
                
                if (hasServices || hasServiceIds) {
                  return (
                    <Card variant="outlined" sx={{ mb: 3, bgcolor: 'action.hover' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <BuildIcon color="primary" />
                          Additional Services
                          {hasServices && ` (${viewingInspection.additional_services.length})`}
                          {!hasServices && hasServiceIds && ` (${Array.isArray(viewingInspection.additional_service_ids) ? viewingInspection.additional_service_ids.length : 'N/A'})`}
                        </Typography>
                        {hasServices ? (
                          <Grid container spacing={2}>
                            {viewingInspection.additional_services.map((service, idx) => (
                              <Grid item xs={12} key={service.id || idx}>
                                <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                          {service.name || 'Service'}
                                        </Typography>
                                        {service.description && (
                                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {service.description}
                                          </Typography>
                                        )}
                                      </Box>
                                      {service.price && service.price > 0 && (
                                        <Chip 
                                          label={`UGX ${service.price.toLocaleString()}`}
                                          color="primary"
                                          size="small"
                                          sx={{ fontWeight: 600, ml: 2 }}
                                        />
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Additional services are attached to this inspection, but service details are being loaded.
                              {Array.isArray(viewingInspection.additional_service_ids) && (
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  Service IDs: {viewingInspection.additional_service_ids.join(', ')}
                                </Typography>
                              )}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}

              {/* Messages & Notes Card */}
              {(viewingInspection.message || viewingInspection.notes) && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AssignmentIcon color="primary" />
                      Messages & Notes
                    </Typography>
                    {viewingInspection.message && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Client Message</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body1">{viewingInspection.message}</Typography>
                        </Paper>
                      </Box>
                    )}
                    {viewingInspection.notes && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Admin Notes</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.selected' }}>
                          <Typography variant="body1">{viewingInspection.notes}</Typography>
                        </Paper>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                {viewingInspection.created_at && (
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(viewingInspection.created_at).toLocaleString()}
                  </Typography>
                )}
                {viewingInspection.updated_at && (
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(viewingInspection.updated_at).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setViewingInspection(null)}>Close</Button>
          {viewingInspection && (
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => {
                setViewingInspection(null);
                handleOpenDialog(viewingInspection);
              }}
            >
              Edit Inspection
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminInspections;
