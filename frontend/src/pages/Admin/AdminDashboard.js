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
  IconButton,
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
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  SupervisorAccount as AdminIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { propertyAPI } from '../../services/api/propertyAPI';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalTenants: 0,
    totalProperties: 0,
    totalUnits: 0,
    totalRevenue: 0,
    activeProperties: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load all properties
      await dispatch(fetchProperties());
      
      // Calculate stats
      const totalProperties = properties.length;
      const totalUnits = properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0);
      const totalRevenue = properties.reduce((sum, prop) => sum + (prop.monthly_rent || 0), 0);
      
      setStats({
        totalOwners: 5, // This would come from API
        totalTenants: 12, // This would come from API
        totalProperties,
        totalUnits,
        totalRevenue,
        activeProperties: properties.filter(p => p.status === 'active').length
      });
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
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
        </Box>
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Admin Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        System-wide management and oversight for all properties, owners, and tenants.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Property Owners"
            value={stats.totalOwners}
            icon={<BusinessIcon />}
            color="primary.main"
            subtitle="Active owners"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Tenants"
            value={stats.totalTenants}
            icon={<PeopleIcon />}
            color="success.main"
            subtitle="Across all properties"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Properties"
            value={stats.totalProperties}
            icon={<HomeIcon />}
            color="info.main"
            subtitle="Managed properties"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Units"
            value={stats.totalUnits}
            icon={<HomeIcon />}
            color="warning.main"
            subtitle="Available units"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="success.main"
            subtitle="Total monthly income"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Active Properties"
            value={stats.activeProperties}
            icon={<TrendingUpIcon />}
            color="success.main"
            subtitle="Currently active"
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="System Overview" icon={<DashboardIcon />} />
            <Tab label="Property Owners" icon={<BusinessIcon />} />
            <Tab label="Properties Overview" icon={<HomeIcon />} />
            <Tab label="Financial Analytics" icon={<AssessmentIcon />} />
            <Tab label="System Health" icon={<SecurityIcon />} />
          </Tabs>
        </Box>

        {/* System Overview Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Typography variant="h6" gutterBottom>
            System Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome to the admin dashboard. Use the navigation menu to access different sections:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Property Owners
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Manage all property owners, view their performance metrics, and track their properties.
                  </Typography>
                  <Button variant="outlined" startIcon={<BusinessIcon />}>
                    View Property Owners
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Properties Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    View all properties in the system with units, tenants, and location information.
                  </Typography>
                  <Button variant="outlined" startIcon={<HomeIcon />}>
                    View Properties
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Property Owners Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Property Owners Overview
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>Properties</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Monthly Revenue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>A</Avatar>
                      <Box>
                        <Typography variant="subtitle2">Admin User</Typography>
                        <Typography variant="caption">admin@example.com</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>300</TableCell>
                  <TableCell>$360,000</TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>T</Avatar>
                      <Box>
                        <Typography variant="subtitle2">Test User</Typography>
                        <Typography variant="caption">test@example.com</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>15</TableCell>
                  <TableCell>$27,000</TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* All Properties Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Properties in System
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Add Property
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {properties.map((property) => (
              <Grid item xs={12} md={6} lg={4} key={property.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6">{property.name}</Typography>
                      <Chip 
                        label={property.property_type} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {property.address}, {property.city}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Units:</strong> {property.total_units}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Owner:</strong> {property.owner_id}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<ViewIcon />}>
                        View
                      </Button>
                      <Button size="small" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Tenant Management Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Tenant Management
          </Typography>
          
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>J</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Jane Smith"
                secondary="tenant@example.com • Unit 101, Kiwo Estates"
              />
              <ListItemSecondaryAction>
                <IconButton edge="end">
                  <ViewIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemAvatar>
                <Avatar>J</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="John Doe"
                secondary="tenant2@example.com • Unit 102, Kiwo Estates"
              />
              <ListItemSecondaryAction>
                <IconButton edge="end">
                  <ViewIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Revenue Analytics Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Revenue Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Revenue by Owner
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Admin User"
                        secondary="$360,000/month"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Test User"
                        secondary="$27,000/month"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Property Performance
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Kiwo Estates"
                        secondary="300 units • $360,000/month"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Enhanced Test Property"
                        secondary="4 units • $7,200/month"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={selectedTab} index={4}>
          <Typography variant="h6" gutterBottom>
            System Administration
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Management
                  </Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} sx={{ mr: 1 }}>
                    Add User
                  </Button>
                  <Button variant="outlined" startIcon={<PeopleIcon />}>
                    Manage Users
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Configuration
                  </Typography>
                  <Button variant="outlined" startIcon={<SecurityIcon />} sx={{ mr: 1 }}>
                    Security Settings
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />}>
                    System Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
