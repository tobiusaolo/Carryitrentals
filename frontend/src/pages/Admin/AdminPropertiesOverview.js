import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
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
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Apartment as ApartmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import DataTable from '../../components/UI/DataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import TableActions from '../../components/UI/TableActions';

const AdminPropertiesOverview = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertiesData, setPropertiesData] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({
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

  const buildPropertiesData = (source) =>
    source.map((property) => ({
      id: property.id,
      name: property.name,
      address: property.address,
      city: property.city,
      property_type: property.property_type,
      total_units: property.total_units || 0,
      occupied_units: property.units?.filter((unit) => unit.status === 'occupied').length || 0,
      available_units: property.units?.filter((unit) => unit.status === 'available').length || 0,
      monthly_rent: property.monthly_rent || 0,
      total_monthly_revenue: (property.monthly_rent || 0) * (property.total_units || 0),
      occupancy_rate: property.total_units > 0
        ? ((property.units?.filter((unit) => unit.status === 'occupied').length || 0) / property.total_units * 100)
        : 0,
      owner: {
        name: property.owner ? `${property.owner.first_name} ${property.owner.last_name}` : 'Unknown Owner',
        email: property.owner?.email || 'N/A',
        phone: property.owner?.phone || 'N/A',
      },
      tenants: property.units?.flatMap((unit) =>
        unit.tenants?.map((tenant) => ({
          name: `${tenant.first_name} ${tenant.last_name}`,
          unit: unit.unit_number,
          email: tenant.email,
          phone: tenant.phone,
        })) || []
      ) || [],
      status: property.status || 'active',
      created_at: property.created_at,
      last_activity: property.updated_at
        ? new Date(property.updated_at).toLocaleDateString()
        : 'Unknown',
    }));

  useEffect(() => {
    if (user?.role === 'admin') {
      if (!properties.length) setLoading(true);
      dispatch(fetchProperties());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (properties.length > 0) {
      setPropertiesData(buildPropertiesData(properties));
      setError(null);
      setLoading(false);
    }
  }, [properties]);

  const loadPropertiesData = () => {
    setLoading(true);
    dispatch(fetchProperties({ __refresh: true }));
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setViewDialogOpen(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setEditFormData({
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      country: property.country,
      property_type: property.property_type,
      description: property.description,
      total_units: property.total_units,
      owner_id: property.owner_id
    });
    setEditDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProperty(null);
    setEditFormData({
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Update the property in the list
    const updatedProperties = propertiesData.map(property => 
      property.id === selectedProperty.id 
        ? { ...property, ...editFormData }
        : property
    );
    setPropertiesData(updatedProperties);
    handleCloseEditDialog();
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, trendValue }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend === 'up' ? (
                <TrendingUpIcon color="success" />
              ) : (
                <TrendingDownIcon color="error" />
              )}
              <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const propertyColumns = [
    {
      id: 'name',
      label: 'Property',
      getSearchValue: (row) => `${row.name} ${row.property_type}`,
      render: (property) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
            <HomeIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{property.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {property.property_type}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      getSearchValue: (row) => `${row.address} ${row.city}`,
      render: (property) => (
        <Box>
          <Typography variant="body2">{property.address}</Typography>
          <Typography variant="caption" color="text.secondary">
            {property.city}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'owner',
      label: 'Owner',
      getSearchValue: (row) => `${row.owner?.name || ''} ${row.owner?.email || ''}`,
      render: (property) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {property.owner.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {property.owner.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'total_units',
      label: 'Units',
      render: (property) => (
        <Typography variant="body2" fontWeight="bold">
          {property.total_units}
        </Typography>
      ),
    },
    {
      id: 'occupancy',
      label: 'Occupancy',
      getSearchValue: (row) => `${row.occupied_units} ${row.total_units} ${row.occupancy_rate}`,
      render: (property) => (
        <Box>
          <Typography variant="body2">
            <strong>{property.occupied_units}</strong> / {property.total_units}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {property.occupancy_rate}% occupied
          </Typography>
        </Box>
      ),
    },
    {
      id: 'revenue',
      label: 'Monthly Revenue',
      render: (property) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ${property.total_monthly_revenue.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (property) => <OwnerStatusChip status={property.status} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (property) => (
        <TableActions
          actions={[
            { icon: <ViewIcon fontSize="small" />, label: 'View Details', onClick: () => handleViewProperty(property) },
            { icon: <EditIcon fontSize="small" />, label: 'Edit Property', onClick: () => handleEditProperty(property) },
          ]}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={propertiesData.length}
            icon={<HomeIcon />}
            color="primary.main"
            subtitle="Active properties"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={propertiesData.reduce((sum, prop) => sum + prop.total_units, 0)}
            icon={<ApartmentIcon />}
            color="info.main"
            subtitle="Managed units"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupied Units"
            value={propertiesData.reduce((sum, prop) => sum + prop.occupied_units, 0)}
            icon={<PeopleIcon />}
            color="success.main"
            subtitle="Currently occupied"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Portfolio rent (monthly)"
            value={`UGX ${propertiesData.reduce((sum, prop) => sum + prop.total_monthly_revenue, 0).toLocaleString()}`}
            icon={<MoneyIcon />}
            color="success.main"
            subtitle="Landlord rent inventory"
          />
        </Grid>
      </Grid>

      <DataTable
        columns={propertyColumns}
        rows={propertiesData}
        title="All Properties in System"
        subtitle="Properties with units, occupancy, and revenue"
        emptyTitle="No properties found"
        emptyDescription="There are no properties in the system yet."
        emptyIcon={HomeIcon}
        searchPlaceholder="Search by property, location, or owner…"
        getRowId={(row) => row.id}
      />

      {/* View Property Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon />
          Property Details - {selectedProperty?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProperty && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Property Name</Typography>
                  <Typography variant="body1">{selectedProperty.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Property Type</Typography>
                  <Typography variant="body1">{selectedProperty.property_type}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{selectedProperty.address}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">City</Typography>
                  <Typography variant="body1">{selectedProperty.city}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">State</Typography>
                  <Typography variant="body1">{selectedProperty.state}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Zip Code</Typography>
                  <Typography variant="body1">{selectedProperty.zip_code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Country</Typography>
                  <Typography variant="body1">{selectedProperty.country}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Units</Typography>
                  <Typography variant="body1">{selectedProperty.total_units}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Occupied Units</Typography>
                  <Typography variant="body1" color="success.main">{selectedProperty.occupied_units}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Monthly Revenue</Typography>
                  <Typography variant="body1" color="success.main">${selectedProperty.total_monthly_revenue?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Occupancy Rate</Typography>
                  <Typography variant="body1">{selectedProperty.occupancy_rate}%</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedProperty.status} 
                    color={selectedProperty.status === 'active' ? "success" : "default"}
                    size="small" 
                  />
                </Grid>
                {selectedProperty.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{selectedProperty.description}</Typography>
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

      {/* Edit Property Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          Edit Property - {selectedProperty?.name}
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={editFormData.property_type}
                    onChange={(e) => setEditFormData({...editFormData, property_type: e.target.value})}
                    label="Property Type"
                  >
                    <MenuItem value="apartment">Apartment</MenuItem>
                    <MenuItem value="house">House</MenuItem>
                    <MenuItem value="condo">Condo</MenuItem>
                    <MenuItem value="townhouse">Townhouse</MenuItem>
                    <MenuItem value="commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={editFormData.zip_code}
                  onChange={(e) => setEditFormData({...editFormData, zip_code: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Units"
                  type="number"
                  value={editFormData.total_units}
                  onChange={(e) => setEditFormData({...editFormData, total_units: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Update Property</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminPropertiesOverview;
