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
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Apartment,
  Bed,
  Bathtub,
  Visibility,
  Home,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  clearError,
} from '../../store/slices/unitSlice';
import { fetchProperties } from '../../store/slices/propertySlice';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Units = () => {
  const dispatch = useDispatch();
  const { units, isLoading, error } = useSelector((state) => state.units);
  const { properties } = useSelector((state) => state.properties);
  const { user } = useSelector((state) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    property_id: '',
    unit_number: '',
    unit_type: 'single',
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    monthly_rent: '',
    status: 'available',
    description: '',
    amenities: '',
    images: '',
  });

  useEffect(() => {
    dispatch(fetchUnits());
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        property_id: unit.property_id || '',
        unit_number: unit.unit_number || '',
        unit_type: unit.unit_type || 'single',
        floor: unit.floor || 1,
        bedrooms: unit.bedrooms || 1,
        bathrooms: unit.bathrooms || 1,
        monthly_rent: unit.monthly_rent || '',
        status: unit.status || 'available',
        description: unit.description || '',
        amenities: unit.amenities || '',
        images: unit.images || '',
      });
    } else {
      setEditingUnit(null);
      setFormData({
        property_id: '',
        unit_number: '',
        unit_type: 'single',
        floor: 1,
        bedrooms: 1,
        bathrooms: 1,
        monthly_rent: '',
        status: 'available',
        description: '',
        amenities: '',
        images: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
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
      floor: parseInt(formData.floor),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      monthly_rent: parseFloat(formData.monthly_rent),
    };
    
    if (editingUnit) {
      await dispatch(updateUnit({ unitId: editingUnit.id, unitData: submitData }));
    } else {
      await dispatch(createUnit(submitData));
    }
    
    handleCloseDialog();
  };

  const handleDelete = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      await dispatch(deleteUnit(unitId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      occupied: 'primary',
      maintenance: 'warning',
      renovation: 'error',
    };
    return colors[status] || 'default';
  };

  const getUnitTypeColor = (type) => {
    const colors = {
      single: 'info',
      double: 'primary',
      studio: 'secondary',
      semi_detached: 'warning',
      one_bedroom: 'success',
      two_bedroom: 'primary',
      three_bedroom: 'secondary',
      penthouse: 'error',
    };
    return colors[type] || 'default';
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'unit_number', headerName: 'Unit #', width: 100 },
    { field: 'property_name', headerName: 'Property', width: 200, flex: 1 },
    {
      field: 'unit_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          color={getUnitTypeColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    { field: 'floor', headerName: 'Floor', width: 80 },
    { field: 'bedrooms', headerName: 'Beds', width: 80 },
    { field: 'bathrooms', headerName: 'Baths', width: 80 },
    {
      field: 'monthly_rent',
      headerName: 'Rent',
      width: 100,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
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
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
          showInMenu
        />,
      ],
    },
  ];

  if (isLoading && units.length === 0) {
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
          Rental Units Management
        </Typography>
        <Tooltip title="Add New Unit">
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={units.length}
            icon={<Apartment />}
            color="#1976d2"
            subtitle="All rental units"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Units"
            value={units.filter(u => u.status === 'available').length}
            icon={<CheckCircle />}
            color="#4caf50"
            subtitle="Ready for occupancy"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupied Units"
            value={units.filter(u => u.status === 'occupied').length}
            icon={<Home />}
            color="#ff9800"
            subtitle="Currently rented"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Monthly Rent"
            value={`$${units.reduce((sum, unit) => sum + (parseFloat(unit.monthly_rent) || 0), 0).toLocaleString()}`}
            icon={<AttachMoney />}
            color="#9c27b0"
            subtitle="Potential income"
          />
        </Grid>
      </Grid>

      {/* Data Grid View */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={units}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
          loading={isLoading}
          disableSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Unit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUnit ? 'Edit Unit' : 'Add New Unit'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
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
                <TextField
                  fullWidth
                  label="Unit Number"
                  name="unit_number"
                  value={formData.unit_number}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit Type</InputLabel>
                  <Select
                    name="unit_type"
                    value={formData.unit_type}
                    onChange={handleInputChange}
                    label="Unit Type"
                  >
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="double">Double</MenuItem>
                    <MenuItem value="studio">Studio</MenuItem>
                    <MenuItem value="semi_detached">Semi-Detached</MenuItem>
                    <MenuItem value="one_bedroom">1 Bedroom</MenuItem>
                    <MenuItem value="two_bedroom">2 Bedroom</MenuItem>
                    <MenuItem value="three_bedroom">3 Bedroom</MenuItem>
                    <MenuItem value="penthouse">Penthouse</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="occupied">Occupied</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="renovation">Renovation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.5 }}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="WiFi, Air Conditioning, Parking, etc."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : (editingUnit ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Units;

