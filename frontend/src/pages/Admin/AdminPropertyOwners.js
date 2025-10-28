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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Business as BusinessIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';

const AdminPropertyOwners = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyOwners, setPropertyOwners] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'active'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPropertyOwners();
    }
  }, [user]);

  const loadPropertyOwners = async () => {
    setLoading(true);
    try {
      await dispatch(fetchProperties());
      
      // Mock property owners data with high-level information
      const ownersData = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          phone: '+256 700 123 456',
          location: 'Kampala, Uganda',
          totalProperties: 1,
          totalUnits: 300,
          occupiedUnits: 285,
          availableUnits: 15,
          totalTenants: 285,
          monthlyRevenue: 360000,
          growthRate: 15.2,
          status: 'active',
          joinDate: '2024-01-15',
          lastActivity: '2 hours ago',
          properties: [
            {
              id: 1,
              name: 'Kiwo Estates',
              location: 'Kampala, Uganda',
              units: 300,
              occupied: 285,
              revenue: 360000
            }
          ]
        },
        {
          id: 2,
          name: 'Test User',
          email: 'test@example.com',
          phone: '+256 700 789 012',
          location: 'Entebbe, Uganda',
          totalProperties: 5,
          totalUnits: 15,
          occupiedUnits: 12,
          availableUnits: 3,
          totalTenants: 12,
          monthlyRevenue: 27000,
          growthRate: 8.5,
          status: 'active',
          joinDate: '2024-02-20',
          lastActivity: '1 day ago',
          properties: [
            {
              id: 2,
              name: 'Sunset Apartments',
              location: 'Entebbe, Uganda',
              units: 8,
              occupied: 6,
              revenue: 18000
            },
            {
              id: 3,
              name: 'Garden Villas',
              location: 'Entebbe, Uganda',
              units: 7,
              occupied: 6,
              revenue: 9000
            }
          ]
        }
      ];

      setPropertyOwners(ownersData);
    } catch (err) {
      setError('Failed to load property owners data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOwner = (owner) => {
    setSelectedOwner(owner);
    setViewDialogOpen(true);
    setTabValue(0);
  };

  const handleEditOwner = (owner) => {
    setSelectedOwner(owner);
    setEditFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      location: owner.location,
      status: owner.status
    });
    setEditDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedOwner(null);
    setTabValue(0);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedOwner(null);
    setEditFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      status: 'active'
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Update the owner in the list
    const updatedOwners = propertyOwners.map(owner => 
      owner.id === selectedOwner.id 
        ? { ...owner, ...editFormData }
        : owner
    );
    setPropertyOwners(updatedOwners);
    handleCloseEditDialog();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteOwner = (owner) => {
    setOwnerToDelete(owner);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOwnerToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (ownerToDelete) {
      const updatedOwners = propertyOwners.filter(owner => owner.id !== ownerToDelete.id);
      setPropertyOwners(updatedOwners);
      handleCloseDeleteDialog();
    }
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Property Owners Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Overview of all property owners, their properties, and high-level performance metrics.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Owners"
            value={propertyOwners.length}
            icon={<BusinessIcon />}
            color="primary.main"
            subtitle="Active property owners"
            trend="up"
            trendValue={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={propertyOwners.reduce((sum, owner) => sum + owner.totalProperties, 0)}
            icon={<HomeIcon />}
            color="info.main"
            subtitle="Across all owners"
            trend="up"
            trendValue={8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={propertyOwners.reduce((sum, owner) => sum + owner.totalUnits, 0)}
            icon={<ApartmentIcon />}
            color="warning.main"
            subtitle="Managed units"
            trend="up"
            trendValue={5.7}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${propertyOwners.reduce((sum, owner) => sum + owner.monthlyRevenue, 0).toLocaleString()}`}
            icon={<MoneyIcon />}
            color="success.main"
            subtitle="Total monthly income"
            trend="up"
            trendValue={18.2}
          />
        </Grid>
      </Grid>

      {/* Property Owners Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Property Owners Overview
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Properties</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Tenants</TableCell>
                  <TableCell>Monthly Revenue</TableCell>
                  <TableCell>Growth</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {propertyOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{owner.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">{owner.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined: {new Date(owner.joinDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{owner.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{owner.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{owner.location}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {owner.totalProperties}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <strong>{owner.occupiedUnits}</strong> / {owner.totalUnits}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round((owner.occupiedUnits / owner.totalUnits) * 100)}% occupied
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {owner.totalTenants}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${owner.monthlyRevenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`+${owner.growthRate}%`} 
                        color={owner.growthRate > 10 ? "success" : "default"}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={owner.status} 
                        color={owner.status === 'active' ? "success" : "default"}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewOwner(owner)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Owner">
                          <IconButton size="small" onClick={() => handleEditOwner(owner)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Owner">
                          <IconButton size="small" color="error" onClick={() => handleDeleteOwner(owner)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>


      {/* View Owner Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon />
          Owner Details - {selectedOwner?.name}
        </DialogTitle>
        <DialogContent>
          {selectedOwner && (
            <Box>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Properties" />
                <Tab label="Financials" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedOwner.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedOwner.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedOwner.phone}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">{selectedOwner.location}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedOwner.status} 
                        color={selectedOwner.status === 'active' ? "success" : "default"}
                        size="small" 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Join Date</Typography>
                      <Typography variant="body1">{selectedOwner.joinDate}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Properties ({selectedOwner.totalProperties})</Typography>
                  <List>
                    {selectedOwner.properties.map((property, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <HomeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={property.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {property.location}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {property.occupied}/{property.units} units occupied
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ${property.revenue.toLocaleString()}/month revenue
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Total Units</Typography>
                          <Typography variant="h4" color="primary.main">{selectedOwner.totalUnits}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Occupied Units</Typography>
                          <Typography variant="h4" color="success.main">{selectedOwner.occupiedUnits}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Monthly Revenue</Typography>
                          <Typography variant="h4" color="success.main">${selectedOwner.monthlyRevenue.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">Growth Rate</Typography>
                          <Typography variant="h4" color={selectedOwner.growthRate > 0 ? "success.main" : "error.main"}>
                            {selectedOwner.growthRate > 0 ? '+' : ''}{selectedOwner.growthRate}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Owner Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          Edit Owner - {selectedOwner?.name}
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Update Owner</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon color="error" />
          Delete Owner
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{ownerToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPropertyOwners;
