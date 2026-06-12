import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
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
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Home,
  Apartment,
  Visibility,
} from '@mui/icons-material';
import {
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  clearError,
} from '../../store/slices/propertySlice';
import FormSection from '../../components/Forms/FormSection';
import {
  PROPERTY_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  emptyPropertyFormState,
} from '../../constants/property';
import PageHeader from '../../components/UI/PageHeader';
import { ownerPrimaryButtonSx } from '../../theme/designTokens';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerDataGrid from '../../components/Owner/OwnerDataGrid';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';

const Properties = () => {
  const dispatch = useDispatch();
  const { properties, isLoading, error } = useSelector((state) => state.properties);
  const { user } = useSelector((state) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(emptyPropertyFormState());

  useEffect(() => {
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

  const handleOpenDialog = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        country: property.country || emptyPropertyFormState().country,
        property_type: property.property_type || 'house',
        description: property.description || '',
        total_units: property.total_units || 1,
      });
    } else {
      setEditingProperty(null);
      setFormData(emptyPropertyFormState());
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
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
    
    if (editingProperty) {
      await dispatch(updateProperty({ propertyId: editingProperty.id, propertyData: formData }));
    } else {
      await dispatch(createProperty(formData));
    }
    
    handleCloseDialog();
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await dispatch(deleteProperty(propertyId));
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Property Name', width: 200, flex: 1 },
    { field: 'address', headerName: 'Address', width: 250, flex: 1 },
    { field: 'city', headerName: 'City', width: 120 },
    { field: 'state', headerName: 'Region', width: 100 },
    { field: 'zip_code', headerName: 'Postal', width: 80 },
    {
      field: 'property_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <OwnerStatusChip status={params.value} label={params.value} />
      ),
    },
    { field: 'total_units', headerName: 'Units', width: 80 },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
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
        <GridActionsCellItem
          icon={<Delete fontSize="small" />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
          showInMenu
        />,
      ],
    },
  ];

  if (isLoading && properties.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Properties"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={ownerPrimaryButtonSx}
          >
            Add property
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Total properties"
            value={properties.length}
            icon={<Home />}
            variantIndex={0}
            subtitle="In portfolio"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Total units"
            value={properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0)}
            icon={<Apartment />}
            variantIndex={1}
            subtitle="All sites"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Property types"
            value={new Set(properties.map((p) => p.property_type)).size}
            icon={<Home />}
            variantIndex={2}
            subtitle="Categories"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Avg units / property"
            value={
              properties.length > 0
                ? Math.round(
                    properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0) /
                      properties.length
                  )
                : 0
            }
            icon={<Apartment />}
            variantIndex={0}
            subtitle="Per site"
          />
        </Grid>
      </Grid>

      <OwnerDataGrid
        rows={properties}
        columns={columns}
        loading={isLoading}
        emptyTitle="No properties yet"
        emptyDescription="Add your first property to start managing units and tenants."
        emptyIcon={Home}
        emptyActionLabel="Add property"
        onEmptyAction={() => handleOpenDialog()}
      />

      {/* Add/Edit Property Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit property' : 'Add property'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              A <strong>property</strong> is the building or site you manage. You add individual{' '}
              <strong>rental units</strong> or rooms under it later.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormSection title="Basics" subtitle="Name and building type" first>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Property name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Sunrise Apartments"
                        helperText="How you identify this site internally"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Building type</InputLabel>
                        <Select
                          name="property_type"
                          value={formData.property_type}
                          onChange={handleInputChange}
                          label="Building type"
                        >
                          {PROPERTY_TYPE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {PROPERTY_TYPE_OPTIONS.find((o) => o.value === formData.property_type)?.hint}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Total units"
                        name="total_units"
                        type="number"
                        value={formData.total_units}
                        onChange={handleInputChange}
                        required
                        inputProps={{ min: 1 }}
                        helperText="Rooms or flats in this property"
                      />
                    </Grid>
                  </Grid>
                </FormSection>
              </Grid>
              <Grid item xs={12}>
                <FormSection title="Location" subtitle="Address guests and tenants will use">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street / plot address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Plot 12, Nakasero Road"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="City / town"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Region / district"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Central Region"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Postal code (optional)"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Country</InputLabel>
                        <Select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          label="Country"
                        >
                          {COUNTRY_OPTIONS.map((c) => (
                            <MenuItem key={c} value={c}>
                              {c}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </FormSection>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  name="description"
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
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : (editingProperty ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </OwnerPageContainer>
  );
};

export default Properties;

