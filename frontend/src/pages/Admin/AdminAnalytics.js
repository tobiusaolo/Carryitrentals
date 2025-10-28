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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    occupancyRate: 0,
    topPerformers: [],
    revenueByOwner: [],
    propertyPerformance: []
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAnalytics();
    }
  }, [user, properties]);

  const loadAnalytics = async () => {
    try {
      // Calculate analytics from properties data
      const totalRevenue = properties.reduce((sum, prop) => {
        const monthlyRent = parseFloat(prop.monthly_rent) || 0;
        const totalUnits = prop.total_units || 0;
        return sum + (monthlyRent * totalUnits);
      }, 0);

      const revenueByOwner = properties.reduce((acc, prop) => {
        const existing = acc.find(item => item.ownerId === prop.owner_id);
        const revenue = (parseFloat(prop.monthly_rent) || 0) * (prop.total_units || 0);
        
        if (existing) {
          existing.revenue += revenue;
          existing.properties += 1;
        } else {
          acc.push({
            ownerId: prop.owner_id,
            ownerName: `Owner ${prop.owner_id}`,
            revenue,
            properties: 1
          });
        }
        return acc;
      }, []);

      setAnalytics({
        totalRevenue,
        monthlyGrowth: 12.5, // Mock data
        occupancyRate: 85.3, // Mock data
        topPerformers: revenueByOwner.sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        revenueByOwner,
        propertyPerformance: properties.map(prop => ({
          id: prop.id,
          name: prop.name,
          revenue: (parseFloat(prop.monthly_rent) || 0) * (prop.total_units || 0),
          units: prop.total_units || 0,
          occupancy: Math.floor(Math.random() * 30) + 70 // Mock occupancy
        }))
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
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
              {trend > 0 ? (
                <TrendingUpIcon color="success" />
              ) : (
                <TrendingDownIcon color="error" />
              )}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}%
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        System Analytics
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Comprehensive analytics and insights for the entire property management system.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="success.main"
            subtitle="Monthly revenue"
            trend={analytics.monthlyGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupancy Rate"
            value={`${analytics.occupancyRate}%`}
            icon={<PeopleIcon />}
            color="info.main"
            subtitle="Average occupancy"
            trend={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={properties.length}
            icon={<HomeIcon />}
            color="primary.main"
            subtitle="Managed properties"
            trend={8.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Owners"
            value={analytics.revenueByOwner.length}
            icon={<BusinessIcon />}
            color="warning.main"
            subtitle="Property owners"
            trend={2.3}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Performing Owners */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Top Performing Owners
              </Typography>
              
              <List>
                {analytics.topPerformers.map((owner, index) => (
                  <React.Fragment key={owner.ownerId}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={owner.ownerName}
                        secondary={`${owner.properties} properties • $${owner.revenue.toLocaleString()}/month`}
                      />
                    </ListItem>
                    {index < analytics.topPerformers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Property Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Property Performance
              </Typography>
              
              <List>
                {analytics.propertyPerformance.slice(0, 5).map((property) => (
                  <React.Fragment key={property.id}>
                    <ListItem>
                      <ListItemText
                        primary={property.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Revenue: ${property.revenue.toLocaleString()}/month
                            </Typography>
                            <Typography variant="body2">
                              Units: {property.units} • Occupancy: {property.occupancy}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={property.occupancy} 
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Revenue Breakdown by Owner
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Owner</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Monthly Revenue</TableCell>
                      <TableCell>Market Share</TableCell>
                      <TableCell>Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.revenueByOwner.map((owner) => {
                      const marketShare = (owner.revenue / analytics.totalRevenue) * 100;
                      return (
                        <TableRow key={owner.ownerId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {owner.ownerName.charAt(0)}
                              </Avatar>
                              {owner.ownerName}
                            </Box>
                          </TableCell>
                          <TableCell>{owner.properties}</TableCell>
                          <TableCell>${owner.revenue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={marketShare} 
                                sx={{ width: 100, mr: 1 }}
                              />
                              {marketShare.toFixed(1)}%
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={marketShare > 50 ? "High" : marketShare > 25 ? "Medium" : "Low"} 
                              color={marketShare > 50 ? "success" : marketShare > 25 ? "warning" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
