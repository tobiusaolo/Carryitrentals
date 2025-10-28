import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  AttachMoney,
  CheckCircle,
  Schedule,
  Warning,
  Visibility,
  Home,
  Phone,
  Email,
  Work,
  Group,
  Upload,
  Search,
} from '@mui/icons-material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  fetchTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  updateTenantPaymentStatus,
  moveOutTenant,
  fetchOverdueTenants,
  fetchTenantsPaymentStatus,
  clearError,
} from '../../store/slices/tenantSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchUnits } from '../../store/slices/unitSlice';

const Tenants = () => {
  const dispatch = useDispatch();
  const { tenants, overdueTenants, paymentStatus, isLoading, error } = useSelector((state) => state.tenants);
  const { properties } = useSelector((state) => state.properties);
  const { units } = useSelector((state) => state.units);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: 18,
    national_id: '',
    previous_address: '',
    previous_city: '',
    previous_state: '',
    previous_country: '',
    occupation: '',
    employer_name: '',
    monthly_income: '',
    number_of_family_members: 1,
    family_details: '',
    property_id: '',
    unit_id: '',
    move_in_date: new Date().toISOString().split('T')[0],
    monthly_rent: '',
    deposit_paid: 0,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchProperties());
    dispatch(fetchUnits());
    dispatch(fetchOverdueTenants());
    dispatch(fetchTenantsPaymentStatus());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        first_name: tenant.first_name || '',
        last_name: tenant.last_name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        age: tenant.age || 18,
        national_id: tenant.national_id || '',
        previous_address: tenant.previous_address || '',
        previous_city: tenant.previous_city || '',
        previous_state: tenant.previous_state || '',
        previous_country: tenant.previous_country || '',
        occupation: tenant.occupation || '',
        employer_name: tenant.employer_name || '',
        monthly_income: tenant.monthly_income || '',
        number_of_family_members: tenant.number_of_family_members || 1,
        family_details: tenant.family_details || '',
        property_id: tenant.property_id || '',
        unit_id: tenant.unit_id || '',
        move_in_date: tenant.move_in_date || new Date().toISOString().split('T')[0],
        monthly_rent: tenant.monthly_rent || '',
        deposit_paid: tenant.deposit_paid || 0,
        emergency_contact_name: tenant.emergency_contact_name || '',
        emergency_contact_phone: tenant.emergency_contact_phone || '',
        emergency_contact_relationship: tenant.emergency_contact_relationship || '',
        notes: tenant.notes || '',
      });
    } else {
      setEditingTenant(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        age: 18,
        national_id: '',
        previous_address: '',
        previous_city: '',
        previous_state: '',
        previous_country: '',
        occupation: '',
        employer_name: '',
        monthly_income: '',
        number_of_family_members: 1,
        family_details: '',
        property_id: '',
        unit_id: '',
        move_in_date: new Date().toISOString().split('T')[0],
        monthly_rent: '',
        deposit_paid: 0,
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const submitData = {
      ...formData,
      age: parseInt(formData.age),
      monthly_income: parseFloat(formData.monthly_income) || null,
      number_of_family_members: parseInt(formData.number_of_family_members),
      monthly_rent: parseFloat(formData.monthly_rent),
      deposit_paid: parseFloat(formData.deposit_paid),
    };
    
    if (editingTenant) {
      await dispatch(updateTenant({ tenantId: editingTenant.id, tenantData: submitData }));
    } else {
      await dispatch(createTenant(submitData));
    }
    
    handleCloseDialog();
  };

  const handleDelete = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      await dispatch(deleteTenant(tenantId));
    }
  };

  const handleUpdatePaymentStatus = async (tenantId, status) => {
    await dispatch(updateTenantPaymentStatus({ tenantId, status, paymentDate: new Date().toISOString().split('T')[0] }));
  };

  const handleMoveOut = async (tenantId) => {
    const moveOutDate = prompt('Enter move-out date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (moveOutDate) {
      await dispatch(moveOutTenant({ tenantId, moveOutDate }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'error',
      partial: 'info',
      moved_out: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      paid: <CheckCircle />,
      overdue: <Warning />,
      partial: <AttachMoney />,
      moved_out: <Person />,
    };
    return icons[status] || <Person />;
  };

  const filteredTenants = tenants.filter(tenant => {
    switch (activeTab) {
      case 0: return true; // All
      case 1: return tenant.rent_payment_status === 'pending';
      case 2: return tenant.rent_payment_status === 'paid';
      case 3: return tenant.rent_payment_status === 'overdue';
      case 4: return !tenant.is_active; // Moved out
      default: return true;
    }
  });

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'First Name', width: 120 },
    { field: 'last_name', headerName: 'Last Name', width: 120 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'unit_number', headerName: 'Unit', width: 100 },
    { field: 'property_name', headerName: 'Property', width: 200, flex: 1 },
    {
      field: 'monthly_rent',
      headerName: 'Rent',
      width: 100,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'rent_payment_status',
      headerName: 'Payment Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value.replace('_', ' ')}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'move_in_date',
      headerName: 'Move-in Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row)}
        />,
        ...(params.row.rent_payment_status === 'pending' ? [
          <GridActionsCellItem
            icon={<CheckCircle />}
            label="Mark as Paid"
            onClick={() => handleUpdatePaymentStatus(params.id, 'paid')}
            showInMenu
          />
        ] : []),
        <GridActionsCellItem
          icon={<Delete />}
          label="Move Out"
          onClick={() => handleMoveOut(params.id)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
          showInMenu
        />,
      ],
    },
  ];

  if (isLoading && tenants.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tenant Management
        </Typography>
        <Tooltip title="Add New Tenant">
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => handleOpenDialog()}
            sx={{ boxShadow: 2 }}
          >
            <Add />
          </Fab>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      {/* Tenant Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Badge badgeContent={tenants.length} color="primary">
                All Tenants
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={tenants.filter(t => t.rent_payment_status === 'pending').length} color="warning">
                Pending Payment
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={tenants.filter(t => t.rent_payment_status === 'paid').length} color="success">
                Paid
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={tenants.filter(t => t.rent_payment_status === 'overdue').length} color="error">
                Overdue
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={tenants.filter(t => !t.is_active).length} color="default">
                Moved Out
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Payment Status Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Total Tenants
                </Typography>
              </Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {tenants.filter(t => t.is_active).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active tenants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Monthly Revenue
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ${tenants.filter(t => t.is_active).reduce((sum, t) => sum + parseFloat(t.monthly_rent), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected monthly income
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Overdue Payments
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {overdueTenants.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tenants with overdue rent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Payment Rate
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {tenants.length > 0 ? Math.round((tenants.filter(t => t.rent_payment_status === 'paid').length / tenants.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Data Grid View */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTenants}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
          loading={isLoading}
          disableSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Personal Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 18, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="National ID (NIN)"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Previous Location */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Previous Location
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Previous Address"
                  name="previous_address"
                  value={formData.previous_address}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="previous_city"
                  value={formData.previous_city}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="previous_state"
                  value={formData.previous_state}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Country"
                  name="previous_country"
                  value={formData.previous_country}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Employment Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employer Name"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Income"
                  name="monthly_income"
                  type="number"
                  value={formData.monthly_income}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              {/* Family Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Family Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Family Members"
                  name="number_of_family_members"
                  type="number"
                  value={formData.number_of_family_members}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Family Details"
                  name="family_details"
                  value={formData.family_details}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  placeholder="Additional family information..."
                />
              </Grid>

              {/* Rental Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Rental Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    name="property_id"
                    value={formData.property_id}
                    onChange={handleInputChange}
                    label="Property"
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
                    onChange={handleInputChange}
                    label="Unit"
                  >
                    {units.filter(unit => unit.property_id == formData.property_id).map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        Unit #{unit.unit_number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Move-in Date"
                  name="move_in_date"
                  type="date"
                  value={formData.move_in_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Rent"
                  name="monthly_rent"
                  type="number"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deposit Paid"
                  name="deposit_paid"
                  type="number"
                  value={formData.deposit_paid}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Emergency Contact
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Relationship"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Additional Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  placeholder="Additional notes about the tenant..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : (editingTenant ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Tenants;
