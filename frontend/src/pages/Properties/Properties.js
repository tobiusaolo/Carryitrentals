import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  LISTING_INTENT_OPTIONS,
  COUNTRY_OPTIONS,
  emptyPropertyFormState,
  propertyFormFromRow,
  buildPropertyPayload,
  isLandProperty,
  getPropertyTypeLabel,
} from '../../constants/property';
import PageHeader from '../../components/UI/PageHeader';
import { ownerPrimaryButtonSx } from '../../theme/designTokens';
import { OwnerPage } from '../../components/Owner';
import OwnerStatStrip from '../../components/Owner/OwnerStatStrip';
import OwnerDataGrid from '../../components/Owner/OwnerDataGrid';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import PropertyDetailPanel from '../../components/Owner/PropertyDetailPanel';

const Properties = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, isLoading, error } = useSelector((state) => state.properties);
  const { user } = useSelector((state) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewProperty, setViewProperty] = useState(null);
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
      setFormData(propertyFormFromRow(property));
    } else {
      setEditingProperty(null);
      setFormData(emptyPropertyFormState());
    }
    setOpenDialog(true);
  };

  const handleViewProperty = (property) => {
    setViewProperty(property);
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
    
    const payload = buildPropertyPayload(formData);
    if (editingProperty) {
      await dispatch(updateProperty({ propertyId: editingProperty.id, propertyData: payload }));
    } else {
      await dispatch(createProperty(payload));
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
      width: 130,
      renderCell: (params) => (
        <OwnerStatusChip status={params.value} label={getPropertyTypeLabel(params.value)} />
      ),
    },
    {
      field: 'occupied_units',
      headerName: 'Occupied',
      width: 90,
      valueGetter: (params) => params.row.occupied_units ?? params.row.stats?.occupied_units ?? 0,
    },
    {
      field: 'available_units',
      headerName: 'Available',
      width: 95,
      valueGetter: (params) => params.row.available_units ?? params.row.stats?.available_units ?? 0,
    },
    {
      field: 'total_units',
      headerName: 'Declared',
      width: 90,
      renderCell: (params) => {
        const registered = params.row.unit_count ?? params.row.stats?.unit_count ?? 0;
        const declared = params.row.total_units ?? 0;
        return declared > 0 ? `${registered}/${declared}` : registered;
      },
    },
    {
      field: 'occupancy_rate',
      headerName: 'Occ. %',
      width: 80,
      valueGetter: (params) => {
        const rate = params.row.occupancy_rate ?? params.row.stats?.occupancy_rate ?? 0;
        return `${Number(rate).toFixed(0)}%`;
      },
    },
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
          onClick={() => handleViewProperty(params.row)}
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

  const totalRegistered = properties.reduce((s, p) => s + (p.unit_count ?? p.stats?.unit_count ?? 0), 0);
  const totalOccupied = properties.reduce((s, p) => s + (p.occupied_units ?? p.stats?.occupied_units ?? 0), 0);
  const totalAvailable = properties.reduce((s, p) => s + (p.available_units ?? p.stats?.available_units ?? 0), 0);
  const totalDeclared = properties.reduce((s, p) => s + (p.total_units ?? 0), 0);

  return (
    <OwnerPage>
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

      <OwnerStatStrip
        sx={{ mb: 2 }}
        stats={[
          { title: 'Properties', value: properties.length, icon: <Home />, subtitle: 'In portfolio' },
          { title: 'Units registered', value: totalRegistered, icon: <Apartment />, subtitle: totalDeclared > 0 ? `${totalDeclared} declared` : 'Track capacity' },
          { title: 'Occupied', value: totalOccupied, icon: <Home />, variantIndex: 1 },
          { title: 'Available', value: totalAvailable, icon: <Apartment />, variantIndex: 2 },
        ]}
      />

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

      <Dialog open={Boolean(viewProperty)} onClose={() => setViewProperty(null)} maxWidth="md" fullWidth>
        <DialogTitle>{viewProperty?.name || 'Property details'}</DialogTitle>
        <DialogContent dividers>
          <PropertyDetailPanel
            property={viewProperty}
            onEdit={() => {
              const p = viewProperty;
              setViewProperty(null);
              handleOpenDialog(p);
            }}
            onAddUnit={() => {
              setViewProperty(null);
              navigate(`/owner/property-hub?tab=units&property_id=${viewProperty.id}`);
            }}
            onManageUnits={() => {
              setViewProperty(null);
              navigate(`/owner/property-hub?tab=units&property_id=${viewProperty.id}`);
            }}
            onClose={() => setViewProperty(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Property Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit property' : 'Add property'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              A <strong>property</strong> is a building, estate, or land parcel. For rentals, set how many
              units it holds (e.g. 120) — CarryIT tracks occupied vs available as you add units.
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
                      <FormControl fullWidth required>
                        <InputLabel>Listing intent</InputLabel>
                        <Select
                          name="listing_intent"
                          value={formData.listing_intent}
                          onChange={handleInputChange}
                          label="Listing intent"
                        >
                          {LISTING_INTENT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {!isLandProperty(formData) ? (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Declared total units"
                          name="total_units"
                          type="number"
                          value={formData.total_units}
                          onChange={handleInputChange}
                          required
                          inputProps={{ min: 1 }}
                          helperText="Capacity you manage (e.g. 120 apartments)"
                        />
                      </Grid>
                    ) : (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Plot size"
                            name="lot_size"
                            value={formData.lot_size}
                            onChange={handleInputChange}
                            placeholder="e.g. 2 acres, 50x100ft"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Sale price (UGX)"
                            name="sale_price"
                            type="number"
                            value={formData.sale_price}
                            onChange={handleInputChange}
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Subdivided plots (optional)"
                            name="total_units"
                            type="number"
                            value={formData.total_units}
                            onChange={handleInputChange}
                            inputProps={{ min: 0 }}
                            helperText="How many plots if subdivided"
                          />
                        </Grid>
                      </>
                    )}
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
    </OwnerPage>
  );
};

export default Properties;

