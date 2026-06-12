import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Badge,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ElectricalServices,
  WaterDrop,
  DeleteSweep,
  GasMeter,
  Wifi,
  Cable,
  Build,
  AttachMoney,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  fetchUtilities,
  fetchUnitUtilities,
  createUtility,
  createUnitUtility,
  updateUtility,
  updateUnitUtility,
  deleteUtility,
  deleteUnitUtility,
  clearError,
} from '../../store/slices/utilitySlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchUnits } from '../../store/slices/unitSlice';
import { markPaymentAsPaid } from '../../store/slices/otherSlices';
import { paymentAPI } from '../../services/api/paymentAPI';
import PageHeader from '../../components/UI/PageHeader';
import { ownerPrimaryButtonSx } from '../../theme/designTokens';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerDataGrid from '../../components/Owner/OwnerDataGrid';
import { formatMoney } from '../../utils/formatMoney';
import { colors } from '../../theme/designTokens';

const utilityTypes = [
  { value: 'water', label: 'Water', icon: <WaterDrop />, color: '#2196f3' },
  { value: 'electricity', label: 'Electricity', icon: <ElectricalServices />, color: '#ff9800' },
  { value: 'gas', label: 'Gas', icon: <GasMeter />, color: '#4caf50' },
  { value: 'garbage', label: 'Garbage', icon: <DeleteSweep />, color: '#9e9e9e' },
  { value: 'sewer', label: 'Sewer', icon: <Build />, color: '#795548' },
  { value: 'internet', label: 'Internet', icon: <Wifi />, color: '#3f51b5' },
  { value: 'cable', label: 'Cable', icon: <Cable />, color: '#e91e63' },
  { value: 'security', label: 'Security', icon: <Build />, color: '#455a64' },
  { value: 'maintenance', label: 'Maintenance', icon: <Build />, color: '#607d8b' },
];

const Utilities = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { utilities, unitUtilities, isLoading, error, isCreating, isUpdating, isDeleting } = useSelector((state) => state.utilities);
  const { properties } = useSelector((state) => state.properties);
  const { units } = useSelector((state) => state.units);

  const initialTab = searchParams.get('tab') === 'collections' ? 2 : 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [utilityPayments, setUtilityPayments] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUtility, setEditingUtility] = useState(null);
  const [formData, setFormData] = useState({
    property_id: '',
    unit_id: '',
    utility_type: '',
    provider_name: '',
    account_number: '',
    monthly_cost: '',
    is_included_in_rent: false,
    description: '',
  });

  const loadUtilityPayments = async () => {
    setCollectionsLoading(true);
    try {
      const response = await paymentAPI.getUtilityPayments();
      setUtilityPayments(response.data);
    } catch (loadError) {
      console.error('Error loading utility payments:', loadError);
    } finally {
      setCollectionsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchUtilities());
    dispatch(fetchUnitUtilities());
    dispatch(fetchProperties());
    dispatch(fetchUnits());
    loadUtilityPayments();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (utility = null, isUnitUtility = false) => {
    if (utility) {
      setEditingUtility({ ...utility, isUnitUtility });
      setFormData({
        property_id: utility.property_id || '',
        unit_id: utility.unit_id || '',
        utility_type: utility.utility_type || '',
        provider_name: utility.provider_name || '',
        account_number: utility.account_number || '',
        monthly_cost: utility.monthly_cost || '',
        is_included_in_rent: utility.is_included_in_rent || false,
        description: utility.description || '',
      });
    } else {
      setEditingUtility(null);
      setFormData({
        property_id: '',
        unit_id: '',
        utility_type: '',
        provider_name: '',
        account_number: '',
        monthly_cost: '',
        is_included_in_rent: false,
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUtility(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const utilityData = {
      ...formData,
      monthly_cost: parseFloat(formData.monthly_cost) || 0,
    };

    try {
      if (editingUtility) {
        if (editingUtility.isUnitUtility) {
          await dispatch(updateUnitUtility({ utilityId: editingUtility.id, utilityData }));
        } else {
          await dispatch(updateUtility({ utilityId: editingUtility.id, utilityData }));
        }
      } else {
        if (activeTab === 1) { // Unit utilities tab
          await dispatch(createUnitUtility(utilityData));
        } else { // Property utilities tab
          await dispatch(createUtility(utilityData));
        }
      }
      
      handleCloseDialog();
      // Refresh data
      dispatch(fetchUtilities());
      dispatch(fetchUnitUtilities());
    } catch (error) {
      console.error('Error saving utility:', error);
    }
  };

  const handleMarkUtilityPaid = async (paymentId) => {
    await dispatch(markPaymentAsPaid(paymentId));
    loadUtilityPayments();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'error',
      partial: 'info',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      paid: <CheckCircle />,
      overdue: <Warning />,
    };
    return icons[status] || <Schedule />;
  };

  const handleDelete = async (utilityId, isUnitUtility = false) => {
    if (window.confirm('Are you sure you want to delete this utility?')) {
      try {
        if (isUnitUtility) {
          await dispatch(deleteUnitUtility(utilityId));
        } else {
          await dispatch(deleteUtility(utilityId));
        }
        // Refresh data
        dispatch(fetchUtilities());
        dispatch(fetchUnitUtilities());
      } catch (error) {
        console.error('Error deleting utility:', error);
      }
    }
  };

  const getUtilityIcon = (type) => {
    const utility = utilityTypes.find(u => u.value === type);
    return utility ? utility.icon : <AttachMoney />;
  };

  const getUtilityColor = (type) => {
    const utility = utilityTypes.find(u => u.value === type);
    return utility ? utility.color : '#666';
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Unknown Property';
  };

  const getUnitNumber = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.unit_number : 'Unknown Unit';
  };

  // DataGrid columns for property utilities
  const propertyUtilityColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'utility_type', headerName: 'Type', width: 120, renderCell: (params) => (
      <Chip 
        icon={getUtilityIcon(params.value)} 
        label={params.value} 
        size="small" 
        sx={{ backgroundColor: getUtilityColor(params.value), color: 'white' }}
      />
    )},
    { field: 'provider_name', headerName: 'Provider', width: 150 },
    { field: 'account_number', headerName: 'Account', width: 120 },
    { field: 'monthly_cost', headerName: 'Monthly Cost', width: 120, renderCell: (params) => (
      <Typography variant="body2" fontWeight="bold">
        {formatMoney(params.value, 'UGX')}
      </Typography>
    )},
    { field: 'is_included_in_rent', headerName: 'Included in Rent', width: 150, renderCell: (params) => (
      <Chip 
        label={params.value ? 'Yes' : 'No'} 
        color={params.value ? 'success' : 'default'} 
        size="small" 
      />
    )},
    { field: 'property_id', headerName: 'Property', width: 150, renderCell: (params) => getPropertyName(params.value) },
    { field: 'description', headerName: 'Description', width: 200 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit fontSize="small" />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row, false)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete fontSize="small" />}
          label="Delete"
          onClick={() => handleDelete(params.row.id, false)}
          showInMenu
        />,
      ],
    },
  ];

  // DataGrid columns for unit utilities
  const unitUtilityColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'utility_type', headerName: 'Type', width: 120, renderCell: (params) => (
      <Chip 
        icon={getUtilityIcon(params.value)} 
        label={params.value} 
        size="small" 
        sx={{ backgroundColor: getUtilityColor(params.value), color: 'white' }}
      />
    )},
    { field: 'provider_name', headerName: 'Provider', width: 150 },
    { field: 'account_number', headerName: 'Account', width: 120 },
    { field: 'monthly_cost', headerName: 'Monthly Cost', width: 120, renderCell: (params) => (
      <Typography variant="body2" fontWeight="bold">
        {formatMoney(params.value, 'UGX')}
      </Typography>
    )},
    { field: 'is_included_in_rent', headerName: 'Included in Rent', width: 150, renderCell: (params) => (
      <Chip 
        label={params.value ? 'Yes' : 'No'} 
        color={params.value ? 'success' : 'default'} 
        size="small" 
      />
    )},
    { field: 'unit_id', headerName: 'Unit', width: 100, renderCell: (params) => getUnitNumber(params.value) },
    { field: 'description', headerName: 'Description', width: 200 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit fontSize="small" />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row, true)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete fontSize="small" />}
          label="Delete"
          onClick={() => handleDelete(params.row.id, true)}
          showInMenu
        />,
      ],
    },
  ];

  const collectionColumns = [
    { field: 'unit_number', headerName: 'Unit', width: 100 },
    {
      field: 'utility_name',
      headerName: 'Utility',
      width: 130,
      renderCell: (params) => params.value || 'Utility',
    },
    { field: 'tenant_name', headerName: 'Tenant', width: 160 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {formatMoney(params.value, 'UGX')}
        </Typography>
      ),
    },
    {
      field: 'due_date',
      headerName: 'Due',
      width: 120,
      renderCell: (params) => (params.value ? new Date(params.value).toLocaleDateString() : '—'),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        ...(params.row.status === 'pending' || params.row.status === 'overdue'
          ? [
              <GridActionsCellItem
                icon={<CheckCircle fontSize="small" />}
                label="Mark as Paid"
                onClick={() => handleMarkUtilityPaid(params.id)}
                showInMenu
              />,
            ]
          : []),
      ],
    },
  ];

  const pendingCharges = utilityPayments.filter((p) => p.status === 'pending');
  const paidCharges = utilityPayments.filter((p) => p.status === 'paid');
  const overdueCharges = utilityPayments.filter((p) => p.status === 'overdue');

  if (isLoading && utilities.length === 0 && unitUtilities.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Utilities"
        action={
          activeTab !== 2 ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={ownerPrimaryButtonSx}
            >
              Add utility
            </Button>
          ) : null
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {activeTab === 2 ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard
                title="Pending"
                value={formatMoney(pendingCharges.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0), 'UGX')}
                icon={<Schedule />}
                variantIndex={1}
                subtitle={`${pendingCharges.length} open charge(s)`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard
                title="Collected"
                value={formatMoney(paidCharges.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0), 'UGX')}
                icon={<CheckCircle />}
                variantIndex={0}
                subtitle={`${paidCharges.length} paid charge(s)`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard
                title="Overdue"
                value={formatMoney(overdueCharges.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0), 'UGX')}
                icon={<Warning />}
                variantIndex={2}
                subtitle={`${overdueCharges.length} overdue charge(s)`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard
                title="Total charges"
                value={utilityPayments.length}
                icon={<ElectricalServices />}
                variantIndex={0}
                subtitle="Auto-generated from tenant setup"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard title="Property utilities" value={utilities.length} icon={<ElectricalServices />} variantIndex={0} subtitle="Building-level rates" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard title="Unit utilities" value={unitUtilities.length} icon={<WaterDrop />} variantIndex={1} subtitle="Per-unit rates" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard
                title="Monthly rates"
                value={formatMoney(
                  utilities.reduce((sum, util) => sum + (parseFloat(util.monthly_cost) || 0), 0) +
                    unitUtilities.reduce((sum, util) => sum + (parseFloat(util.monthly_cost) || 0), 0),
                  'UGX'
                )}
                icon={<AttachMoney />}
                variantIndex={2}
                subtitle="Combined configured costs"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <OwnerStatCard title="Open charges" value={pendingCharges.length + overdueCharges.length} icon={<Build />} variantIndex={0} subtitle="Awaiting collection" />
            </Grid>
          </>
        )}
      </Grid>

      <Paper sx={{ mb: 3, border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: 'none' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="Property rates" />
          <Tab label="Unit rates" />
          <Tab
            label={
              <Badge badgeContent={utilityPayments.length} color="primary">
                Tenant charges
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {activeTab === 2 ? (
        <OwnerDataGrid
          rows={utilityPayments}
          columns={collectionColumns}
          loading={collectionsLoading}
          emptyTitle="No utility charges yet"
          emptyDescription="Set rates on the Property/Unit tabs and assign utilities on tenant records to auto-generate charges."
          emptyIcon={ElectricalServices}
        />
      ) : (
        <OwnerDataGrid
          rows={activeTab === 0 ? utilities : unitUtilities}
          columns={activeTab === 0 ? propertyUtilityColumns : unitUtilityColumns}
          loading={isLoading}
          emptyTitle={activeTab === 0 ? 'No property utilities' : 'No unit utilities'}
          emptyDescription="Add monthly rates for water, electricity, garbage, and other services."
          emptyIcon={ElectricalServices}
          emptyActionLabel="Add utility"
          onEmptyAction={() => handleOpenDialog()}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUtility ? 'Edit Utility' : 'Add New Utility'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {activeTab === 1 && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="unit_id"
                      value={formData.unit_id}
                      onChange={handleInputChange}
                      label="Unit"
                    >
                      {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.unit_number} - {getPropertyName(unit.property_id)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {activeTab === 0 && (
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
              )}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Utility Type</InputLabel>
                  <Select
                    name="utility_type"
                    value={formData.utility_type}
                    onChange={handleInputChange}
                    label="Utility Type"
                  >
                    {utilityTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {type.icon}
                          <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="provider_name"
                  label="Provider Name"
                  value={formData.provider_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="account_number"
                  label="Account Number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="monthly_cost"
                  label="Monthly Cost (UGX)"
                  type="number"
                  value={formData.monthly_cost}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_included_in_rent"
                      checked={formData.is_included_in_rent}
                      onChange={handleInputChange}
                    />
                  }
                  label="Included in Rent"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </OwnerPageContainer>
  );
};

export default Utilities;


