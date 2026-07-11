import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { propertyAPI } from '../../services/api/propertyAPI';
import adminAPI from '../../services/api/adminAPI';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import PropertyDetailPanel from '../../components/Owner/PropertyDetailPanel';
import { adminConfirm } from '../../components/Admin/AdminConfirmDialog';
import { adminPrimaryButtonSx } from '../../theme/designTokens';

const AdminProperties = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    property_type: '',
    description: '',
    total_units: '',
    owner_id: ''
  });
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadProperties();
      loadOwners();
    }
  }, [user]);

  const loadOwners = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      setOwners((Array.isArray(users) ? users : []).filter((u) => u.role === 'owner'));
    } catch (err) {
      console.error('Failed to load owners:', err);
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      await dispatch(fetchProperties());
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        country: property.country || '',
        property_type: property.property_type || '',
        description: property.description || '',
        total_units: property.total_units || '',
        owner_id: property.owner_id || ''
      });
    } else {
      setEditingProperty(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        property_type: '',
        description: '',
        total_units: '',
        owner_id: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProperty(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      property_type: '',
      description: '',
      total_units: '',
      owner_id: ''
    });
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.owner_id && !editingProperty) {
        setError('Select a property owner');
        setLoading(false);
        return;
      }
      if (editingProperty) {
        await propertyAPI.updateProperty(editingProperty.id, formData);
        setSuccess('Property updated successfully!');
      } else {
        await propertyAPI.createProperty(formData);
        setSuccess('Property created successfully!');
      }
      
      await loadProperties();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const ok = await adminConfirm('Delete property?', 'This will remove the property and related data.');
    if (!ok) return;
    setLoading(true);
    try {
      await propertyAPI.deleteProperty(propertyId);
      setSuccess('Property deleted successfully!');
      await loadProperties();
    } catch (err) {
      setError('Failed to delete property');
    } finally {
      setLoading(false);
    }
  };

  const ownerLabel = (ownerId) => {
    const o = owners.find((x) => String(x.id) === String(ownerId));
    return o ? `${o.first_name || ''} ${o.last_name || ''}`.trim() || o.email : ownerId || '-';
  };

  const propertyColumns = [
    {
      id: 'name',
      label: 'Property',
      render: (p) => (
        <>
          <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
          <Typography variant="caption" color="text.secondary">{p.property_type}</Typography>
        </>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      render: (p) => `${p.address || ''}, ${p.city || ''}`.replace(/^, |, $/g, '') || '-',
    },
    {
      id: 'owner',
      label: 'Owner',
      render: (p) => ownerLabel(p.owner_id),
    },
    {
      id: 'units',
      label: 'Occupancy',
      render: (p) => {
        const occupied = p.occupied_units ?? p.stats?.occupied_units ?? 0;
        const available = p.available_units ?? p.stats?.available_units ?? 0;
        const registered = p.unit_count ?? p.stats?.unit_count ?? 0;
        const declared = p.total_units ?? 0;
        return (
          <>
            <Typography variant="body2">{occupied} occ · {available} avail</Typography>
            <Typography variant="caption" color="text.secondary">
              {declared > 0 ? `${registered}/${declared} registered` : `${registered} registered`}
            </Typography>
          </>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (p) => (
        <TableActions
          actions={[
            { icon: <ViewIcon fontSize="small" />, label: 'View', onClick: () => handleViewProperty(p) },
            { icon: <EditIcon fontSize="small" />, label: 'Edit', onClick: () => handleOpenDialog(p) },
            { icon: <DeleteIcon fontSize="small" />, label: 'Delete', onClick: () => handleDeleteProperty(p.id), danger: true },
          ]}
        />
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">You need admin privileges to access this page.</Alert>
      </AdminPage>
    );
  }

  const totalUnits = properties.reduce((sum, p) => sum + Number(p.unit_count ?? p.stats?.unit_count ?? 0), 0);
  const totalOccupied = properties.reduce((sum, p) => sum + Number(p.occupied_units ?? p.stats?.occupied_units ?? 0), 0);
  const totalAvailable = properties.reduce((sum, p) => sum + Number(p.available_units ?? p.stats?.available_units ?? 0), 0);

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Properties"
        subtitle="Add & manage portfolios"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={adminPrimaryButtonSx}>
            Add property
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <AdminStatStrip
        stats={[
          { id: 'count', title: 'Properties', value: properties.length, icon: <HomeIcon /> },
          { id: 'owners', title: 'Owners', value: owners.length, icon: <BusinessIcon /> },
          { id: 'units', title: 'Units registered', value: totalUnits, icon: <PeopleIcon /> },
          { id: 'occupied', title: 'Occupied', value: totalOccupied, icon: <HomeIcon /> },
          { id: 'available', title: 'Available', value: totalAvailable, icon: <BusinessIcon /> },
        ]}
      />

      <DataTable
        columns={propertyColumns}
        rows={properties}
        loading={loading}
        title="All properties"
        subtitle="Admin and owner portfolios"
        emptyTitle="No properties"
        emptyDescription="Add a property and assign it to an owner."
        emptyIcon={HomeIcon}
        emptyActionLabel="Add property"
        onEmptyAction={() => handleOpenDialog()}
        searchPlaceholder="Search by name, city, or owner…"
      />

      {/* Add/Edit Property Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Type"
                value={formData.property_type}
                onChange={handleInputChange('property_type')}
                select
                required
              >
                <MenuItem value="house">House</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
                <MenuItem value="condo">Condo</MenuItem>
                <MenuItem value="townhouse">Townhouse</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleInputChange('state')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.zip_code}
                onChange={handleInputChange('zip_code')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleInputChange('country')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Property owner</InputLabel>
                <Select
                  value={formData.owner_id}
                  label="Property owner"
                  onChange={handleInputChange('owner_id')}
                >
                  {owners.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {`${o.first_name || ''} ${o.last_name || ''}`.trim() || o.email} ({o.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Units"
                type="number"
                value={formData.total_units}
                onChange={handleInputChange('total_units')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={adminPrimaryButtonSx}>
            {loading ? <CircularProgress size={20} /> : (editingProperty ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Property Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon />
          {selectedProperty?.name || 'Property details'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedProperty ? (
            <PropertyDetailPanel
              property={selectedProperty}
              onEdit={() => {
                const p = selectedProperty;
                handleCloseViewDialog();
                handleOpenDialog(p);
              }}
              onClose={handleCloseViewDialog}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
};

export default AdminProperties;
