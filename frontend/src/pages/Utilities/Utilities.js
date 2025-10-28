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
  Switch,
  FormControlLabel,
  Divider,
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
  Visibility,
  AttachMoney,
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

const utilityTypes = [
  { value: 'water', label: 'Water', icon: <WaterDrop />, color: '#2196f3' },
  { value: 'electricity', label: 'Electricity', icon: <ElectricalServices />, color: '#ff9800' },
  { value: 'gas', label: 'Gas', icon: <GasMeter />, color: '#4caf50' },
  { value: 'garbage', label: 'Garbage', icon: <DeleteSweep />, color: '#9e9e9e' },
  { value: 'sewer', label: 'Sewer', icon: <Build />, color: '#795548' },
  { value: 'internet', label: 'Internet', icon: <Wifi />, color: '#3f51b5' },
  { value: 'cable', label: 'Cable', icon: <Cable />, color: '#e91e63' },
];

const Utilities = () => {
  const dispatch = useDispatch();
  const { utilities, unitUtilities, isLoading, error, isCreating, isUpdating, isDeleting } = useSelector((state) => state.utilities);
  const { properties } = useSelector((state) => state.properties);
  const { units } = useSelector((state) => state.units);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
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

  useEffect(() => {
    dispatch(fetchUtilities());
    dispatch(fetchUnitUtilities());
    dispatch(fetchProperties());
    dispatch(fetchUnits());
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
        ${params.value}
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
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row, false)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id, false)}
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
        ${params.value}
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
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row, true)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id, true)}
        />,
      ],
    },
  ];

  if (isLoading) {
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
          Utilities Management
        </Typography>
        <Tooltip title="Add New Utility">
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ElectricalServices color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Property Utilities</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {utilities.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total property-level utilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WaterDrop color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Unit Utilities</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {unitUtilities.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total unit-specific utilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Monthly Cost</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                ${(utilities.reduce((sum, util) => sum + (parseFloat(util.monthly_cost) || 0), 0) + 
                   unitUtilities.reduce((sum, util) => sum + (parseFloat(util.monthly_cost) || 0), 0)).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Combined utility costs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Build color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Utility Types</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {utilityTypes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available utility types
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Property Utilities" />
          <Tab label="Unit Utilities" />
        </Tabs>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={activeTab === 0 ? utilities : unitUtilities}
          columns={activeTab === 0 ? propertyUtilityColumns : unitUtilityColumns}
          components={{ Toolbar: GridToolbar }}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={isLoading}
        />
      </Paper>

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
                  label="Monthly Cost ($)"
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
    </Box>
  );
};

export default Utilities;


