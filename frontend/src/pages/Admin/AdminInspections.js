import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
import PageHeader from '../../components/UI/PageHeader';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { adminPrimaryButtonSx, colors } from '../../theme/designTokens';
import DataTable from '../../components/UI/DataTable';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { parseInspectionsPayload } from '../../utils/parseInspectionsPayload';
import { buildAdminInspectionColumns } from './columns/adminInspectionColumns';

const AdminInspections = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const highlightBookingId = searchParams.get('booking_id');

  const portalEnabled = user?.role === 'admin';

  const {
    data: inspectionsResult = { items: [], total: 0 },
    loading,
    refreshing,
    error,
    refresh: loadInspections,
  } = useCachedQuery('/admin/inspection-bookings?skip=0&limit=5000', {
    enabled: portalEnabled,
    select: parseInspectionsPayload,
  });

  const { data: units = [], refresh: loadUnits } = useCachedQuery('/rental-units/', {
    enabled: portalEnabled,
  });

  const { data: agents = [], refresh: loadAgents } = useCachedQuery('/agents/', {
    enabled: portalEnabled,
  });

  const { data: paymentMethods = [], refresh: loadPaymentMethods } = useCachedQuery('/payment-methods/', {
    enabled: portalEnabled,
    select: (data) => (data || []).filter((m) => m.is_active !== false),
  });

  const inspections = inspectionsResult.items;
  const totalCount = inspectionsResult.total;

  useEffect(() => {
    if (!highlightBookingId || loading || !inspections.length) return undefined;
    const timer = setTimeout(() => {
      const el = document.getElementById(`inspection-row-${highlightBookingId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightBookingId, loading, inspections.length]);

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
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [viewingInspection, setViewingInspection] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedInspectionForMenu, setSelectedInspectionForMenu] = useState(null);
  const [adminTxId, setAdminTxId] = useState('');

  const handleGenerateQRCode = async (inspection) => {
    try {
      setSelectedInspection(inspection);
      const api = authService.createAxiosInstance();
      const response = await api.post(`/inspection-payments/booking/${inspection.id}/generate-qr`);
      setQrCodeData(response.data);
      setQrCodeDialogOpen(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showError('Payment QR', typeof detail === 'string' ? detail : 'No payment for this booking.');
    }
  };

  const handleAdminMarkPaid = async (paymentId, transactionId) => {
    if (!transactionId?.trim()) {
      showError('Transaction required', 'Enter the mobile money transaction ID.');
      return;
    }
    try {
      const api = authService.createAxiosInstance();
      await api.post(`/inspection-payments/${paymentId}/mark-paid`, { transaction_id: transactionId.trim() });
      showSuccess('Payment confirmed', 'Marked as paid.');
      setPaymentDialogOpen(false);
      loadInspections();
    } catch (err) {
      showError('Failed', err.response?.data?.detail || 'Could not mark as paid');
    }
  };

  const handlePaymentManagement = (inspection) => {
    setSelectedInspection(inspection);
    setAdminTxId('');
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
      showError('Save Failed', errorMessage);
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
        showSuccess('Inspection Deleted', 'The inspection has been successfully deleted.');
      } catch (err) {
        console.error('Failed to delete inspection:', err);
        closeAlert();
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete inspection';
        showError('Delete Failed', errorMessage);
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
    try {
      const api = authService.createAxiosInstance();
      await api.patch(`/admin/inspection-bookings/${bookingId}/approve`, {});
      
      closeAlert();
      
      // Wait a brief moment for the backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload inspections to show updated status
      await loadInspections();
      showSuccess('Inspection Approved', 'The inspection has been approved and an SMS has been sent to the client.');
    } catch (err) {
      console.error('Error approving inspection:', err);
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to approve inspection';
      showError('Approval Failed', errorMessage);
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
      
      // Wait a brief moment for the backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload inspections to show updated status
      await loadInspections();
      showSuccess('Inspection Rejected', 'The inspection has been rejected and an SMS has been sent to the client.');
    } catch (err) {
      console.error('Error rejecting inspection:', err);
      closeAlert();
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to reject inspection';
      showError('Rejection Failed', errorMessage);
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

  const pendingCount = inspections.filter((i) => i.status?.toLowerCase() === 'pending').length;

  const inspectionColumns = buildAdminInspectionColumns({
    handlePaymentManagement,
    handleApproveBooking,
    handleRejectBooking,
    setActionMenuAnchor,
    setSelectedInspectionForMenu,
  });

  const confirmedCount = inspections.filter((i) => i.status?.toLowerCase() === 'confirmed').length;
  const completedCount = inspections.filter((i) => i.status?.toLowerCase() === 'completed').length;

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Inspections"
        subtitle={`${pendingCount} pending · ${totalCount} total`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={adminPrimaryButtonSx}>
            Schedule
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AdminStatStrip
        loading={loading && !inspections.length}
        stats={[
          { title: 'Total', value: inspections.length, icon: <AssignmentIcon /> },
          { title: 'Pending', value: pendingCount, icon: <ScheduleIcon /> },
          { title: 'Confirmed', value: confirmedCount, icon: <CheckCircleIcon /> },
          { title: 'Completed', value: completedCount, icon: <CheckCircleIcon /> },
        ]}
      />

      <DataTable
        columns={inspectionColumns}
        rows={inspections}
        loading={loading && !inspections.length}
        title="All bookings"
        emptyTitle="No inspections"
        emptyDescription="Public and admin bookings appear here."
        emptyIcon={AssignmentIcon}
        emptyActionLabel="Schedule one"
        onEmptyAction={() => handleOpenDialog()}
        searchPlaceholder="Search by property, client, or ID…"
        getRowId={(row) => row.id}
        getRowDomId={(row) => `inspection-row-${row.id}`}
        getRowSx={(row) =>
          highlightBookingId && String(row.id) === String(highlightBookingId)
            ? {
                bgcolor: `${colors.adminAccent}14`,
                outline: `2px solid ${colors.adminAccent}`,
                outlineOffset: -2,
              }
            : {}
        }
      />

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
            borderRadius: 2,
          },
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
              color: 'error.dark',
            },
          }}
        >
          <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>
            Delete Inspection
          </Typography>
        </MenuItem>
      </Menu>

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
                Amount due now: {qrCodeData.currency} {qrCodeData.amount?.toLocaleString()}
                {qrCodeData.total_inspection_fee && (
                  <> (60% of {qrCodeData.currency} {qrCodeData.total_inspection_fee?.toLocaleString()})</>
                )}
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
                Booking #{selectedInspection.id}
                {selectedInspection.rental_unit?.title ? ` — ${selectedInspection.rental_unit.title}` : ''}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon />
                        Viewing fee
                      </Typography>
                      {selectedInspection.payment ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Due now (60%): {selectedInspection.payment.currency}{' '}
                            {Number(selectedInspection.payment.amount).toLocaleString()}
                          </Typography>
                          {selectedInspection.payment.payment_url && (
                            <Button
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => window.open(selectedInspection.payment.payment_url, '_blank')}
                            >
                              Open payment page
                            </Button>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No payment record (booking may pre-date auto-payment).
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaymentIcon />
                        Payment status
                      </Typography>
                      <Chip
                        label={selectedInspection.payment_status || selectedInspection.payment?.status || 'none'}
                        color={
                          (selectedInspection.payment_status || selectedInspection.payment?.status) === 'paid'
                            ? 'success'
                            : 'warning'
                        }
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {selectedInspection.payment?.transaction_id && (
                        <Typography variant="body2" color="text.secondary">
                          Tx: {selectedInspection.payment.transaction_id}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {selectedInspection.payment?.payment_id &&
                (selectedInspection.payment_status || selectedInspection.payment?.status) !== 'paid' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    label="Mobile money transaction ID"
                    value={adminTxId}
                    onChange={(e) => setAdminTxId(e.target.value)}
                    sx={{ minWidth: 280, flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAdminMarkPaid(selectedInspection.payment.payment_id, adminTxId)}
                  >
                    Mark paid
                  </Button>
                </Box>
              )}

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
    </AdminPage>
  );
};

export default AdminInspections;
