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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import adminAPI from '../../services/api/adminAPI';

const AdminTenants = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_id: '',
    unit_id: '',
    rent_amount: '',
    move_in_date: '',
    lease_end_date: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadTenants();
      loadProperties();
      loadUnits();
    }
  }, [user]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      // Load real tenants data from API
      const tenantsData = await adminAPI.getAllTenants();
      
      // Transform the data to match the expected format
      const transformedTenants = tenantsData.map(tenant => ({
        id: tenant.id,
        name: `${tenant.first_name} ${tenant.last_name}`,
        email: tenant.email,
        phone: tenant.phone,
        property_id: tenant.unit?.property_id || null,
        property_name: tenant.unit?.property?.name || 'Unknown Property',
        unit_id: tenant.unit_id,
        unit_number: tenant.unit?.unit_number || 'N/A',
        rent_amount: tenant.unit?.monthly_rent || 0,
        move_in_date: tenant.move_in_date || 'N/A',
        lease_end_date: tenant.lease_end_date || 'N/A',
        emergency_contact: tenant.emergency_contact || 'N/A',
        emergency_phone: tenant.emergency_phone || 'N/A',
        status: tenant.is_active ? 'active' : 'inactive',
        payment_status: tenant.payment_status || 'current',
        notes: tenant.notes || 'No notes',
        created_at: tenant.created_at
      }));
      
      setTenants(transformedTenants);
    } catch (err) {
      setError('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      // Mock properties data
      const mockProperties = [
        { id: 1, name: 'Kiwo Estates', address: 'Plot 123, Kiwo Road, Kampala' },
        { id: 2, name: 'Sunset Apartments', address: 'Plot 456, Sunset Boulevard, Entebbe' },
        { id: 3, name: 'Garden Villas', address: 'Plot 789, Garden Street, Entebbe' }
      ];
      setProperties(mockProperties);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadUnits = async () => {
    try {
      // Mock units data
      const mockUnits = [
        { id: 1, unit_number: '101', property_id: 1, property_name: 'Kiwo Estates' },
        { id: 2, unit_number: '102', property_id: 1, property_name: 'Kiwo Estates' },
        { id: 3, unit_number: '1A', property_id: 2, property_name: 'Sunset Apartments' }
      ];
      setUnits(mockUnits);
    } catch (err) {
      console.error('Failed to load units:', err);
    }
  };

  const handleOpenDialog = (tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        property_id: tenant.property_id,
        unit_id: tenant.unit_id,
        rent_amount: tenant.rent_amount,
        move_in_date: tenant.move_in_date,
        lease_end_date: tenant.lease_end_date,
        emergency_contact: tenant.emergency_contact,
        emergency_phone: tenant.emergency_phone,
        notes: tenant.notes
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        unit_id: '',
        rent_amount: '',
        move_in_date: '',
        lease_end_date: '',
        emergency_contact: '',
        emergency_phone: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleViewTenant = (tenant) => {
    setSelectedTenant(tenant);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedTenant(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        // Update tenant
        console.log('Updating tenant:', formData);
        // TODO: Implement update API call
      } else {
        // Create tenant
        console.log('Creating tenant:', formData);
        // TODO: Implement create API call
      }
      handleCloseDialog();
      loadTenants();
    } catch (err) {
      setError('Failed to save tenant');
    }
  };

  const handleDelete = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        console.log('Deleting tenant:', tenantId);
        // TODO: Implement delete API call
        loadTenants();
      } catch (err) {
        setError('Failed to delete tenant');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'current': return 'success';
      case 'overdue': return 'error';
      case 'paid_advance': return 'info';
      default: return 'default';
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
        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Tenant Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage all tenants across all properties. View tenant information, payment status, and lease details.
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
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{tenants.length}</Typography>
                  <Typography color="text.secondary">Total Tenants</Typography>
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
                    {tenants.filter(tenant => tenant.status === 'active').length}
                  </Typography>
                  <Typography color="text.secondary">Active Tenants</Typography>
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
                    {tenants.filter(tenant => tenant.payment_status === 'overdue').length}
                  </Typography>
                  <Typography color="text.secondary">Overdue Payments</Typography>
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
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    ${tenants.reduce((sum, tenant) => sum + tenant.rent_amount, 0).toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">Total Monthly Rent</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tenants Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Tenants
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Tenant
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Property & Unit</TableCell>
                  <TableCell>Rent Amount</TableCell>
                  <TableCell>Lease Period</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{tenant.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <EmailIcon sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {tenant.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {tenant.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {tenant.property_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unit {tenant.unit_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${tenant.rent_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Move-in: {new Date(tenant.move_in_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          Lease ends: {new Date(tenant.lease_end_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tenant.payment_status} 
                        color={getPaymentStatusColor(tenant.payment_status)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tenant.status} 
                        color={getStatusColor(tenant.status)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewTenant(tenant)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Tenant">
                        <IconButton size="small" onClick={() => handleOpenDialog(tenant)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Tenant">
                        <IconButton size="small" color="error" onClick={() => handleDelete(tenant.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenant Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    name="property_id"
                    value={formData.property_id}
                    onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                  >
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit_id"
                    value={formData.unit_id}
                    onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                  >
                    {units.filter(unit => unit.property_id === formData.property_id).map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        Unit {unit.unit_number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rent Amount"
                  name="rent_amount"
                  type="number"
                  value={formData.rent_amount}
                  onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Move-in Date"
                  name="move_in_date"
                  type="date"
                  value={formData.move_in_date}
                  onChange={(e) => setFormData({...formData, move_in_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lease End Date"
                  name="lease_end_date"
                  type="date"
                  value={formData.lease_end_date}
                  onChange={(e) => setFormData({...formData, lease_end_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Phone"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                />
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTenant ? 'Update' : 'Create'} Tenant
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Tenant Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Tenant Details - {selectedTenant?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTenant && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedTenant.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedTenant.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedTenant.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                  <Typography variant="body1">{selectedTenant.property_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Unit</Typography>
                  <Typography variant="body1">Unit {selectedTenant.unit_number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Rent Amount</Typography>
                  <Typography variant="body1" color="success.main">${selectedTenant.rent_amount}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Move-in Date</Typography>
                  <Typography variant="body1">{selectedTenant.move_in_date}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Lease End Date</Typography>
                  <Typography variant="body1">{selectedTenant.lease_end_date}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                  <Typography variant="body1">{selectedTenant.emergency_contact}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Emergency Phone</Typography>
                  <Typography variant="body1">{selectedTenant.emergency_phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedTenant.status} 
                    color={selectedTenant.status === 'active' ? "success" : "default"}
                    size="small" 
                  />
                </Grid>
                {selectedTenant.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1">{selectedTenant.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTenants;
