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
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  SupervisorAccount as AdminIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Apartment as ApartmentIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  ElectricalServices as UtilitiesIcon,
  QrCode as QrCodeIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  HomeWork as HomeWorkIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { propertyAPI } from '../../services/api/propertyAPI';

const EnhancedAdminDashboard = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const [stats, setStats] = useState({
    // System Overview
    totalOwners: 0,
    totalTenants: 0,
    totalProperties: 0,
    totalUnits: 0,
    totalRevenue: 0,
    activeProperties: 0,
    
    // Financial Metrics
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
    averageRent: 0,
    
    // Occupancy & Performance
    occupancyRate: 0,
    collectionRate: 0,
    maintenanceRequests: 0,
    pendingPayments: 0,
    overduePayments: 0,
    
    // System Health
    activeUsers: 0,
    systemUptime: 0,
    recentActivity: 0,
    alertsCount: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchProperties());
      
      // Calculate comprehensive stats
      const totalProperties = properties.length;
      const totalUnits = properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0);
      const totalRevenue = properties.reduce((sum, prop) => {
        const monthlyRent = parseFloat(prop.monthly_rent) || 0;
        const totalUnits = prop.total_units || 0;
        return sum + (monthlyRent * totalUnits);
      }, 0);
      
      setStats({
        totalOwners: 5,
        totalTenants: 12,
        totalProperties,
        totalUnits,
        totalRevenue,
        activeProperties: properties.filter(p => p.status === 'active').length,
        monthlyRevenue: totalRevenue,
        quarterlyRevenue: totalRevenue * 3,
        yearlyRevenue: totalRevenue * 12,
        revenueGrowth: 12.5,
        averageRent: totalRevenue / totalUnits || 0,
        occupancyRate: 85.3,
        collectionRate: 92.1,
        maintenanceRequests: 8,
        pendingPayments: 15,
        overduePayments: 3,
        activeUsers: 25,
        systemUptime: 99.9,
        recentActivity: 45,
        alertsCount: 2
      });

      // Mock recent activity data
      setRecentActivity([
        { id: 1, type: 'payment', message: 'New payment received from John Doe', time: '2 minutes ago', amount: 1200 },
        { id: 2, type: 'property', message: 'New property added: Sunset Apartments', time: '1 hour ago', user: 'Test User' },
        { id: 3, type: 'tenant', message: 'New tenant registered: Jane Smith', time: '3 hours ago', property: 'Kiwo Estates' },
        { id: 4, type: 'maintenance', message: 'Maintenance request: Unit 201 - Plumbing', time: '5 hours ago', priority: 'High' },
        { id: 5, type: 'qr', message: 'QR code generated for Kiwo Estates', time: '1 day ago', property: 'Kiwo Estates' }
      ]);

      // Mock system alerts
      setSystemAlerts([
        { id: 1, type: 'warning', message: '3 overdue payments detected', severity: 'medium' },
        { id: 2, type: 'info', message: 'System maintenance scheduled for tonight', severity: 'low' }
      ]);

      // Mock top performers
      setTopPerformers([
        { name: 'Admin User', revenue: 360000, properties: 1, units: 300, growth: 15.2 },
        { name: 'Test User', revenue: 27000, properties: 5, units: 15, growth: 8.5 }
      ]);

    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
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
    const updatedProperties = properties.map(property => 
      property.id === selectedProperty.id 
        ? { ...property, ...editFormData }
        : property
    );
    // Note: In a real app, you would dispatch an action to update the backend
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
        System Administration Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Comprehensive oversight and management of the entire property management platform.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* System Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Property Owners"
            value={stats.totalOwners}
            icon={<BusinessIcon />}
            color="primary.main"
            subtitle="Active owners"
            trend="up"
            trendValue={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tenants"
            value={stats.totalTenants}
            icon={<PeopleIcon />}
            color="success.main"
            subtitle="Across all properties"
            trend="up"
            trendValue={12.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Properties"
            value={stats.totalProperties}
            icon={<HomeIcon />}
            color="info.main"
            subtitle="Managed properties"
            trend="up"
            trendValue={8.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={stats.totalUnits}
            icon={<ApartmentIcon />}
            color="warning.main"
            subtitle="Available units"
            trend="up"
            trendValue={3.7}
          />
        </Grid>
      </Grid>

      {/* Financial Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="success.main"
            subtitle="Total monthly income"
            trend="up"
            trendValue={stats.revenueGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            icon={<HomeIcon />}
            color="info.main"
            subtitle="Average occupancy"
            trend="up"
            trendValue={2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Collection Rate"
            value={`${stats.collectionRate}%`}
            icon={<PaymentIcon />}
            color="success.main"
            subtitle="Payment collection"
            trend="up"
            trendValue={1.8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Uptime"
            value={`${stats.systemUptime}%`}
            icon={<CheckCircleIcon />}
            color="success.main"
            subtitle="Platform availability"
            trend="up"
            trendValue={0.1}
          />
        </Grid>
      </Grid>

      {/* Alerts and Notifications */}
      {systemAlerts.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  System Alerts
                </Typography>
                <List>
                  {systemAlerts.map((alert) => (
                    <ListItem key={alert.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alert.type === 'warning' ? 'warning.main' : 'info.main' }}>
                          {alert.type === 'warning' ? <WarningIcon /> : <NotificationsIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={alert.message}
                        secondary={`Severity: ${alert.severity}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="System Overview" icon={<DashboardIcon />} />
            <Tab label="Property Owners" icon={<BusinessIcon />} />
            <Tab label="All Properties" icon={<HomeIcon />} />
            <Tab label="Tenant Management" icon={<PeopleIcon />} />
            <Tab label="Financial Analytics" icon={<AssessmentIcon />} />
            <Tab label="System Health" icon={<SecurityIcon />} />
            <Tab label="Recent Activity" icon={<TimelineIcon />} />
          </Tabs>
        </Box>

        {/* System Overview Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Revenue Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Revenue distribution chart would be here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Monthly Performance
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Performance chart would be here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Property Owners Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Property Owners Management
            </Typography>
            <Button variant="contained" startIcon={<PersonAddIcon />}>
              Add Owner
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>Properties</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Monthly Revenue</TableCell>
                  <TableCell>Growth</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPerformers.map((owner, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{owner.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">{owner.name}</Typography>
                          <Typography variant="caption">Owner ID: {index + 1}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{owner.properties}</TableCell>
                    <TableCell>{owner.units}</TableCell>
                    <TableCell>${owner.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`+${owner.growth}%`} 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* All Properties Tab */}
        <TabPanel value={selectedTab} index={2}>
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
                      <Button size="small" startIcon={<ViewIcon />} onClick={() => handleViewProperty(property)}>
                        View
                      </Button>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditProperty(property)}>
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
        <TabPanel value={selectedTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Tenant Management
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Rent Status</TableCell>
                  <TableCell>Last Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>J</Avatar>
                      <Box>
                        <Typography variant="subtitle2">Jane Smith</Typography>
                        <Typography variant="caption">tenant@example.com</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>Kiwo Estates</TableCell>
                  <TableCell>Unit 101</TableCell>
                  <TableCell>
                    <Chip label="Paid" color="success" size="small" />
                  </TableCell>
                  <TableCell>2 days ago</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>J</Avatar>
                      <Box>
                        <Typography variant="subtitle2">John Doe</Typography>
                        <Typography variant="caption">tenant2@example.com</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>Kiwo Estates</TableCell>
                  <TableCell>Unit 102</TableCell>
                  <TableCell>
                    <Chip label="Overdue" color="error" size="small" />
                  </TableCell>
                  <TableCell>15 days ago</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Financial Analytics Tab */}
        <TabPanel value={selectedTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Financial Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by Owner
                  </Typography>
                  <List>
                    {topPerformers.map((owner, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={owner.name}
                          secondary={`$${owner.revenue.toLocaleString()}/month`}
                        />
                        <LinearProgress 
                          variant="determinate" 
                          value={(owner.revenue / stats.monthlyRevenue) * 100} 
                          sx={{ width: 100 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Status Overview
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Collected</Typography>
                    <Typography variant="body2">${(stats.monthlyRevenue * 0.92).toLocaleString()}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={92} sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Pending</Typography>
                    <Typography variant="body2">${(stats.monthlyRevenue * 0.05).toLocaleString()}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={5} color="warning" sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Overdue</Typography>
                    <Typography variant="body2">${(stats.monthlyRevenue * 0.03).toLocaleString()}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={3} color="error" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Health Tab */}
        <TabPanel value={selectedTab} index={5}>
          <Typography variant="h6" gutterBottom>
            System Health & Performance
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    System Status
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.systemUptime}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Active Users
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently online
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Alerts
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.alertsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active alerts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Recent Activity Tab */}
        <TabPanel value={selectedTab} index={6}>
          <Typography variant="h6" gutterBottom>
            Recent System Activity
          </Typography>
          
          <List>
            {recentActivity.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: activity.type === 'payment' ? 'success.main' : 
                            activity.type === 'property' ? 'primary.main' :
                            activity.type === 'tenant' ? 'info.main' :
                            activity.type === 'maintenance' ? 'warning.main' : 'secondary.main'
                  }}>
                    {activity.type === 'payment' ? <PaymentIcon /> :
                     activity.type === 'property' ? <HomeIcon /> :
                     activity.type === 'tenant' ? <PeopleIcon /> :
                     activity.type === 'maintenance' ? <BuildIcon /> : <QrCodeIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.message}
                  secondary={activity.time}
                />
                {activity.amount && (
                  <Typography variant="body2" color="success.main">
                    ${activity.amount}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Card>
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

export default EnhancedAdminDashboard;
