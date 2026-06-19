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
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider,
  Snackbar,
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
  ContentCopy,
  PhoneAndroid,
  Forum,
} from '@mui/icons-material';
import TenantChatDialog from '../../components/Tenants/TenantChatDialog';
import LeaseChecklistDialog from '../../components/Tenants/LeaseChecklistDialog';
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
import PageHeader from '../../components/UI/PageHeader';
import { ownerPrimaryButtonSx } from '../../theme/designTokens';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerDataGrid from '../../components/Owner/OwnerDataGrid';
import { formatMoney } from '../../utils/formatMoney';
import { colors } from '../../theme/designTokens';
import { tenantAPI } from '../../services/api/tenantAPI';

const TENANT_UTILITY_FIELDS = [
  { name: 'tenant_pays_garbage', label: 'Garbage' },
  { name: 'tenant_pays_electricity', label: 'Electricity' },
  { name: 'tenant_pays_water', label: 'Water' },
  { name: 'tenant_pays_security', label: 'Security' },
  { name: 'tenant_pays_maintenance', label: 'Maintenance' },
];

const defaultTenantFormState = () => ({
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
  employer_phone: '',
  employer_address: '',
  monthly_income: '',
  previous_landlord_name: '',
  previous_landlord_phone: '',
  previous_landlord_address: '',
  previous_landlord_tenancy_from: '',
  previous_landlord_tenancy_to: '',
  number_of_family_members: '',
  family_details: '',
  tenant_pays_garbage: false,
  tenant_pays_electricity: false,
  tenant_pays_water: false,
  tenant_pays_security: false,
  tenant_pays_maintenance: false,
  property_id: '',
  unit_id: '',
  move_in_date: new Date().toISOString().split('T')[0],
  lease_end_date: '',
  monthly_rent: '',
  deposit_required: 0,
  deposit_paid: 0,
  months_paid: 0,
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  notes: '',
});

const Tenants = () => {
  const dispatch = useDispatch();
  const { tenants, overdueTenants, paymentStatus, isLoading, error } = useSelector((state) => state.tenants);
  const { properties } = useSelector((state) => state.properties);
  const { units } = useSelector((state) => state.units);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [formData, setFormData] = useState(defaultTenantFormState());
  const [chatTenant, setChatTenant] = useState(null);
  const [checklistTenant, setChecklistTenant] = useState(null);
  const [leaseDocFile, setLeaseDocFile] = useState(null);
  const [leaseDocUploading, setLeaseDocUploading] = useState(false);

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
        employer_phone: tenant.employer_phone || '',
        employer_address: tenant.employer_address || '',
        monthly_income: tenant.monthly_income ?? '',
        previous_landlord_name: tenant.previous_landlord_name || '',
        previous_landlord_phone: tenant.previous_landlord_phone || '',
        previous_landlord_address: tenant.previous_landlord_address || '',
        previous_landlord_tenancy_from: tenant.previous_landlord_tenancy_from || '',
        previous_landlord_tenancy_to: tenant.previous_landlord_tenancy_to || '',
        number_of_family_members: tenant.number_of_family_members ?? '',
        family_details: tenant.family_details || '',
        tenant_pays_garbage: Boolean(tenant.tenant_pays_garbage),
        tenant_pays_electricity: Boolean(tenant.tenant_pays_electricity),
        tenant_pays_water: Boolean(tenant.tenant_pays_water),
        tenant_pays_security: Boolean(tenant.tenant_pays_security),
        tenant_pays_maintenance: Boolean(tenant.tenant_pays_maintenance),
        property_id: tenant.property_id || '',
        unit_id: tenant.unit_id || '',
        move_in_date: tenant.move_in_date || new Date().toISOString().split('T')[0],
        lease_end_date: tenant.lease_end_date || '',
        monthly_rent: tenant.monthly_rent || '',
        deposit_required: tenant.deposit_required ?? tenant.deposit_paid ?? 0,
        deposit_paid: tenant.deposit_paid || 0,
        emergency_contact_name: tenant.emergency_contact_name || '',
        emergency_contact_phone: tenant.emergency_contact_phone || '',
        emergency_contact_relationship: tenant.emergency_contact_relationship || '',
        notes: tenant.notes || '',
      });
    } else {
      setEditingTenant(null);
      setFormData(defaultTenantFormState());
    }
    setOpenDialog(true);
    setLeaseDocFile(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
    setLeaseDocFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUtilityChange = (name) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.checked,
    }));
  };

  const copyLinkingCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(String(code));
      setCopyNotice('Mobile linking code copied — share it with your tenant');
    } catch {
      setCopyNotice('Could not copy — select and copy the code manually');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const submitData = {
      ...formData,
      age: parseInt(formData.age, 10),
      number_of_family_members: formData.number_of_family_members
        ? parseInt(formData.number_of_family_members, 10)
        : null,
      family_details: formData.family_details?.trim() || null,
      monthly_rent: parseFloat(formData.monthly_rent),
      monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
      deposit_required: parseFloat(formData.deposit_required) || 0,
      deposit_paid: parseFloat(formData.deposit_paid) || 0,
      lease_end_date: formData.lease_end_date || null,
      months_paid: parseInt(formData.months_paid, 10) || 0,
    };
    
    if (editingTenant) {
      delete submitData.months_paid;
      await dispatch(updateTenant({ tenantId: editingTenant.id, tenantData: submitData }));
      if (leaseDocFile) {
        setLeaseDocUploading(true);
        try {
          await tenantAPI.uploadLeaseDocument(editingTenant.id, leaseDocFile);
          setCopyNotice('Lease document uploaded');
        } catch (err) {
          setCopyNotice(err.response?.data?.detail || 'Lease saved but document upload failed');
        } finally {
          setLeaseDocUploading(false);
        }
      }
    } else {
      const result = await dispatch(createTenant(submitData));
      if (createTenant.fulfilled.match(result) && result.payload?.linking_code) {
        setCopyNotice(
          `Tenant created. Mobile app code: ${result.payload.linking_code} (copied to clipboard)`
        );
        try {
          await navigator.clipboard.writeText(result.payload.linking_code);
        } catch {
          /* clipboard optional */
        }
      }
    }
    
    handleCloseDialog();
    dispatch(fetchTenants({ __refresh: true }));
  };

  const handleDelete = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      await dispatch(deleteTenant(tenantId));
    }
  };

  const handleRecordCashPayment = async (tenantId) => {
    const tenant = tenants.find((t) => String(t.id) === String(tenantId));
    if (!tenant) return;
    const amount = parseFloat(tenant.balance_due) > 0
      ? parseFloat(tenant.balance_due)
      : parseFloat(tenant.monthly_rent);
    await dispatch(updateTenantPaymentStatus({
      tenantId,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      amount,
    }));
    dispatch(fetchTenants({ __refresh: true }));
    dispatch(fetchOverdueTenants());
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
    {
      field: 'linking_code',
      headerName: 'Mobile code',
      width: 160,
      renderCell: (params) => (
        params.value ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={params.value}
              size="small"
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em' }}
            />
            <Tooltip title="Copy code for tenant mobile app">
              <IconButton size="small" onClick={() => copyLinkingCode(params.value)} aria-label="Copy linking code">
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          '—'
        )
      ),
    },
    { field: 'unit_number', headerName: 'Unit', width: 100 },
    { field: 'property_name', headerName: 'Property', width: 200, flex: 1 },
    {
      field: 'monthly_rent',
      headerName: 'Rent',
      width: 100,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'lease_end_date',
      headerName: 'Lease ends',
      width: 120,
      renderCell: (params) => (
        params.value ? new Date(params.value).toLocaleDateString() : '—'
      ),
    },
    {
      field: 'lease_status',
      headerName: 'Lease',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? String(params.value).replace('_', ' ') : 'active'}
          color={params.value === 'expired' ? 'error' : params.value === 'expiring_soon' ? 'warning' : 'success'}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'deposit_balance',
      headerName: 'Deposit bal.',
      width: 110,
      renderCell: (params) => (
        params.value != null ? `$${Number(params.value).toLocaleString()}` : '—'
      ),
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
          icon={<Forum fontSize="small" />}
          label="Message"
          onClick={() => setChatTenant(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Visibility fontSize="small" />}
          label="Checklist"
          onClick={() => setChecklistTenant(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Visibility fontSize="small" />}
          label="View"
          onClick={() => handleOpenDialog(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Edit fontSize="small" />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row)}
          showInMenu
        />,
        ...(['pending', 'due', 'overdue', 'partial'].includes(params.row.rent_payment_status) ? [
          <GridActionsCellItem
            icon={<CheckCircle fontSize="small" />}
            label="Record cash payment"
            onClick={() => handleRecordCashPayment(params.id)}
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
    <OwnerPageContainer>
      <PageHeader
        title="Tenants"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={ownerPrimaryButtonSx}
          >
            Add tenant
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      <Paper sx={{ mb: 3, border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={<Badge badgeContent={tenants.length} color="primary">All Tenants</Badge>} />
          <Tab label={<Badge badgeContent={tenants.filter((t) => t.rent_payment_status === 'pending').length} color="primary">Pending Payment</Badge>} />
          <Tab label={<Badge badgeContent={tenants.filter((t) => t.rent_payment_status === 'paid').length} color="primary">Paid</Badge>} />
          <Tab label={<Badge badgeContent={tenants.filter((t) => t.rent_payment_status === 'overdue').length} color="primary">Overdue</Badge>} />
          <Tab label={<Badge badgeContent={tenants.filter((t) => !t.is_active).length} color="primary">Moved Out</Badge>} />
        </Tabs>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Active tenants"
            value={tenants.filter((t) => t.is_active).length}
            icon={<Person />}
            variantIndex={0}
            subtitle="Active leases"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Monthly revenue"
            value={formatMoney(
              tenants.filter((t) => t.is_active).reduce((sum, t) => sum + parseFloat(t.monthly_rent || 0), 0),
              'UGX'
            )}
            icon={<AttachMoney />}
            variantIndex={1}
            subtitle="If all paid"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Overdue payments"
            value={overdueTenants.length}
            icon={<Warning />}
            variantIndex={2}
            subtitle="Past due"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Payment rate"
            value={`${tenants.length > 0 ? Math.round((tenants.filter((t) => t.rent_payment_status === 'paid').length / tenants.length) * 100) : 0}%`}
            icon={<CheckCircle />}
            variantIndex={0}
            subtitle="This cycle"
          />
        </Grid>
      </Grid>

      <OwnerDataGrid
        rows={filteredTenants}
        columns={columns}
        loading={isLoading}
        emptyTitle="No tenants yet"
        emptyDescription="Add tenants when someone moves into one of your units."
        emptyIcon={Person}
        emptyActionLabel="Add tenant"
        onEmptyAction={() => handleOpenDialog()}
      />

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {editingTenant?.linking_code && (
              <Alert
                severity="info"
                icon={<PhoneAndroid />}
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => copyLinkingCode(editingTenant.linking_code)}
                  >
                    Copy
                  </Button>
                }
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Mobile app linking code
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, mt: 0.5 }}>
                  {editingTenant.linking_code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tenant enters this in the CarryIT mobile app to see their unit, pay rent, and more.
                </Typography>
              </Alert>
            )}
            {!editingTenant && (
              <Alert severity="info" icon={<PhoneAndroid />} sx={{ mb: 2 }}>
                A unique <strong>mobile linking code</strong> is generated automatically when you save.
                Share it with the tenant so they can activate the mobile app.
              </Alert>
            )}
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
                  helperText="Same person can be on multiple units — each unit gets its own mobile linking code"
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
                  label="Employer Phone"
                  name="employer_phone"
                  value={formData.employer_phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Employer Address"
                  name="employer_address"
                  value={formData.employer_address}
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
                />
              </Grid>

              {/* Screening pack — previous landlord */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Screening pack — previous landlord
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Previous landlord name"
                  name="previous_landlord_name"
                  value={formData.previous_landlord_name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Previous landlord phone"
                  name="previous_landlord_phone"
                  value={formData.previous_landlord_phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Previous landlord address"
                  name="previous_landlord_address"
                  value={formData.previous_landlord_address}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenancy from"
                  name="previous_landlord_tenancy_from"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.previous_landlord_tenancy_from}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenancy to"
                  name="previous_landlord_tenancy_to"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.previous_landlord_tenancy_to}
                  onChange={handleInputChange}
                />
              </Grid>
              {/* Family Information (optional) */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  Family Information <Typography component="span" variant="body2" color="text.secondary">(optional)</Typography>
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
                  placeholder="Optional — names, ages, or other household notes"
                />
              </Grid>

              {/* Utilities */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main', mt: 2 }}>
                  Utilities
                </Typography>
                <FormHelperText sx={{ mb: 1.5, mx: 0 }}>
                  Check each utility the tenant pays. Unchecked = landlord pays. Checked items auto-create monthly
                  utility charges on Payments → Utilities (set costs under Utilities in the sidebar).
                </FormHelperText>
                <FormGroup row sx={{ gap: 1 }}>
                  {TENANT_UTILITY_FIELDS.map(({ name, label }) => (
                    <FormControlLabel
                      key={name}
                      control={
                        <Checkbox
                          checked={Boolean(formData[name])}
                          onChange={handleUtilityChange(name)}
                          name={name}
                        />
                      }
                      label={label}
                    />
                  ))}
                </FormGroup>
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
                  label="Lease end date"
                  name="lease_end_date"
                  type="date"
                  value={formData.lease_end_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="When the fixed-term lease expires"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deposit required"
                  name="deposit_required"
                  type="number"
                  value={formData.deposit_required}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deposit paid"
                  name="deposit_paid"
                  type="number"
                  value={formData.deposit_paid}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              {!editingTenant && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Months paid at move-in"
                      name="months_paid"
                      type="number"
                      value={formData.months_paid}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, max: 24 }}
                      helperText="0 = not prepaid. 3 = paid through 3 months from move-in."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prepaid rent total"
                      value={
                        (parseFloat(formData.monthly_rent) || 0) *
                        (parseInt(formData.months_paid, 10) || 0)
                      }
                      InputProps={{ readOnly: true }}
                      helperText="Monthly rent × months paid"
                    />
                  </Grid>
                </>
              )}

              {editingTenant && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>
                    Lease agreement document
                  </Typography>
                  {editingTenant.lease_document_url ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current: {editingTenant.lease_document_name || 'Uploaded lease'}
                      {' · '}
                      <a href={editingTenant.lease_document_url} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No lease document on file yet.
                    </Typography>
                  )}
                  <Button variant="outlined" component="label" disabled={leaseDocUploading}>
                    {leaseDocFile ? leaseDocFile.name : 'Choose PDF or image'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,image/*"
                      onChange={(e) => setLeaseDocFile(e.target.files?.[0] || null)}
                    />
                  </Button>
                </Grid>
              )}

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
            <Button type="submit" variant="contained" disabled={isLoading || leaseDocUploading}>
              {isLoading || leaseDocUploading ? <CircularProgress size={24} /> : (editingTenant ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={Boolean(copyNotice)}
        autoHideDuration={6000}
        onClose={() => setCopyNotice('')}
        message={copyNotice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <TenantChatDialog
        open={Boolean(chatTenant)}
        tenant={chatTenant}
        onClose={() => setChatTenant(null)}
      />

      <LeaseChecklistDialog
        open={Boolean(checklistTenant)}
        onClose={() => setChecklistTenant(null)}
        tenant={checklistTenant}
        isOwner
      />
    </OwnerPageContainer>
  );
};

export default Tenants;
