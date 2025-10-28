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
  ListItemAvatar
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
  Close as RejectIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

const AdminInspections = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [units, setUnits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [formData, setFormData] = useState({
    unit_id: '',
    agent_id: '',
    inspection_type: '',
    scheduled_date: '',
    status: 'scheduled',
    notes: '',
    findings: ''
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadInspections();
      loadUnits();
      loadAgents();
      loadPaymentMethods();
    }
  }, [user]);

  const loadInspections = async () => {
    setLoading(true);
    try {
      // Fetch real inspection bookings from API
      const token = localStorage.getItem('token');
      console.log('Loading inspections with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('https://carryit-backend.onrender.com/api/v1/admin/inspection-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to load inspection bookings');
      }
      
      const data = await response.json();
      console.log('Loaded inspections:', data.length);
      setInspections(data);
      setError(null);
      setLoading(false);
      return;
      
      // Old mock data (keeping as fallback)
      const mockInspections = [
        {
          id: 1,
          unit_id: 1,
          unit_number: '101',
          property_name: 'Kiwo Estates',
          agent_id: 1,
          agent_name: 'Agent Smith',
          inspection_type: 'Move-in',
          scheduled_date: '2024-10-25',
          status: 'scheduled',
          notes: 'Initial inspection before tenant move-in',
          findings: '',
          created_at: '2024-10-20',
          inspection_number: 4 // This is the 4th inspection for this unit
        },
        {
          id: 2,
          unit_id: 2,
          unit_number: '102',
          property_name: 'Kiwo Estates',
          agent_id: 2,
          agent_name: 'Agent Johnson',
          inspection_type: 'Routine',
          scheduled_date: '2024-10-22',
          status: 'completed',
          notes: 'Monthly routine inspection',
          findings: 'Minor maintenance needed in bathroom',
          created_at: '2024-10-15',
          inspection_number: 2 // This is the 2nd inspection for this unit
        },
        {
          id: 3,
          unit_id: 3,
          unit_number: '1A',
          property_name: 'Sunset Apartments',
          agent_id: 1,
          agent_name: 'Agent Smith',
          inspection_type: 'Initial',
          scheduled_date: '2024-10-28',
          status: 'in_progress',
          notes: 'First inspection for new unit',
          findings: '',
          created_at: '2024-10-18',
          inspection_number: 1 // This is the 1st inspection for this unit
        },
        {
          id: 4,
          unit_id: 4,
          unit_number: '2B',
          property_name: 'Sunset Apartments',
          agent_id: 3,
          agent_name: 'Agent Brown',
          inspection_type: 'Routine',
          scheduled_date: '2024-10-30',
          status: 'completed',
          notes: 'Quarterly maintenance inspection',
          findings: 'All systems functioning properly',
          created_at: '2024-10-18',
          inspection_number: 3 // This is the 3rd inspection for this unit
        }
      ];
      setInspections(mockInspections);
    } catch (err) {
      console.error('Error loading inspections:', err);
      setError(err.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      // Mock units data - only available units for rent
      const mockUnits = [
        { 
          id: 1, 
          unit_number: '101', 
          property_name: 'Kiwo Estates',
          rental_status: 'available',
          inspection_count: 3,
          last_inspection: '2024-10-15'
        },
        { 
          id: 2, 
          unit_number: '102', 
          property_name: 'Kiwo Estates',
          rental_status: 'available',
          inspection_count: 1,
          last_inspection: '2024-10-20'
        },
        { 
          id: 3, 
          unit_number: '1A', 
          property_name: 'Sunset Apartments',
          rental_status: 'available',
          inspection_count: 0,
          last_inspection: null
        },
        { 
          id: 4, 
          unit_number: '2B', 
          property_name: 'Sunset Apartments',
          rental_status: 'available',
          inspection_count: 2,
          last_inspection: '2024-10-18'
        }
      ];
      // Filter to only show units available for rent
      const availableUnits = mockUnits.filter(unit => unit.rental_status === 'available');
      setUnits(availableUnits);
    } catch (err) {
      console.error('Failed to load units:', err);
    }
  };

  const loadAgents = async () => {
    try {
      // Mock agents data
      const mockAgents = [
        { id: 1, name: 'Agent Smith', email: 'smith@example.com', phone: '+256 700 111 111' },
        { id: 2, name: 'Agent Johnson', email: 'johnson@example.com', phone: '+256 700 222 222' },
        { id: 3, name: 'Agent Brown', email: 'brown@example.com', phone: '+256 700 333 333' }
      ];
      setAgents(mockAgents);
    } catch (err) {
      console.error('Failed to load agents:', err);
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
        payment_url: `http://localhost:3000/inspection-payment/1`,
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
      setFormData({
        unit_id: inspection.unit_id,
        agent_id: inspection.agent_id,
        inspection_type: inspection.inspection_type,
        scheduled_date: inspection.scheduled_date,
        status: inspection.status,
        notes: inspection.notes,
        findings: inspection.findings
      });
    } else {
      setEditingInspection(null);
      setFormData({
        unit_id: '',
        agent_id: '',
        inspection_type: '',
        scheduled_date: '',
        status: 'scheduled',
        notes: '',
        findings: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInspection(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInspection) {
        // Update inspection
        console.log('Updating inspection:', formData);
        // TODO: Implement update API call
      } else {
        // Create inspection
        console.log('Creating inspection:', formData);
        // TODO: Implement create API call
        
        // Update unit inspection count locally
        const selectedUnit = units.find(unit => unit.id === formData.unit_id);
        if (selectedUnit) {
          setUnits(prevUnits => 
            prevUnits.map(unit => 
              unit.id === formData.unit_id 
                ? { ...unit, inspection_count: unit.inspection_count + 1 }
                : unit
            )
          );
        }
      }
      handleCloseDialog();
      loadInspections();
    } catch (err) {
      setError('Failed to save inspection');
    }
  };

  const handleDelete = async (inspectionId) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        console.log('Deleting inspection:', inspectionId);
        // TODO: Implement delete API call
        loadInspections();
      } catch (err) {
        setError('Failed to delete inspection');
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
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://carryit-backend.onrender.com/api/v1/admin/inspection-bookings/${bookingId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setError(null);
      // Reload inspections to show updated status
      loadInspections();
      alert('Inspection approved successfully! SMS sent to client.');
    } catch (err) {
      console.error('Error approving inspection:', err);
      setError(err.response?.data?.detail || 'Failed to approve inspection');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://carryit-backend.onrender.com/api/v1/admin/inspection-bookings/${bookingId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: reason ? { reason } : {}
        }
      );
      
      setError(null);
      // Reload inspections to show updated status
      loadInspections();
      alert('Inspection rejected. SMS sent to client.');
    } catch (err) {
      console.error('Error rejecting inspection:', err);
      setError(err.response?.data?.detail || 'Failed to reject inspection');
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {inspections.filter(i => i.status === 'scheduled').length}
                  </Typography>
                  <Typography color="text.secondary">Scheduled</Typography>
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
                  <BuildIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {inspections.filter(i => i.status === 'in_progress').length}
                  </Typography>
                  <Typography color="text.secondary">In Progress</Typography>
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
                    {inspections.filter(i => i.status === 'completed').length}
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {units.reduce((sum, unit) => sum + unit.inspection_count, 0)}
                  </Typography>
                  <Typography color="text.secondary">Total Unit Inspections</Typography>
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
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspections.map((inspection) => (
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
                          {inspection.rental_unit?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {inspection.rental_unit?.location || 'N/A'}
                        </Typography>
                        <Typography variant="caption" display="block" color="primary">
                          {inspection.rental_unit?.unit_type || ''}
                        </Typography>
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
                    
                    {/* Type */}
                    <TableCell>
                      <Chip 
                        label={inspection.is_public_booking ? 'Walk-in' : 'Registered'} 
                        variant="outlined"
                        size="small" 
                      />
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {inspection.status?.toLowerCase() === 'pending' && (
                          <>
                            <Tooltip title="Approve Inspection">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApproveBooking(inspection.id)}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'success.light',
                                    color: 'white'
                                  }
                                }}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Inspection">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRejectBooking(inspection.id)}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'white'
                                  }
                                }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit_id"
                    value={formData.unit_id}
                    onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            Unit {unit.unit_number} - {unit.property_name}
                          </Box>
                          {unit.inspection_count > 0 && (
                            <Chip 
                              label={`${unit.inspection_count} inspections`}
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Agent</InputLabel>
                  <Select
                    name="agent_id"
                    value={formData.agent_id}
                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                  >
                    {agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </MenuItem>
                    ))}
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
                  label="Scheduled Date"
                  name="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Findings"
                  name="findings"
                  multiline
                  rows={3}
                  value={formData.findings}
                  onChange={(e) => setFormData({...formData, findings: e.target.value})}
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
    </Box>
  );
};

export default AdminInspections;
