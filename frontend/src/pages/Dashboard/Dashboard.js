import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Home,
  Apartment,
  Assignment,
  Payment,
  Build,
  CalendarToday,
  TrendingUp,
  People,
  ElectricalServices,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchDashboardData } from '../../store/slices/analyticsSlice';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 1,
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardData, isLoading, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {typeof error === 'string' ? error : JSON.stringify(error)}
      </Alert>
    );
  }

  // Use real data from API
  const stats = {
    totalProperties: dashboardData?.total_properties || 0,
    totalUnits: dashboardData?.total_units || 0,
    occupiedUnits: dashboardData?.occupied_units || 0,
    availableUnits: dashboardData?.available_units || 0,
    totalMonthlyRent: dashboardData?.total_monthly_rent || 0,
    collectedRent: dashboardData?.collected_rent || 0,
    pendingRent: dashboardData?.pending_rent || 0,
    overdueRent: dashboardData?.overdue_rent || 0,
    occupancyRate: dashboardData?.occupancy_rate || 0,
    collectionRate: dashboardData?.collection_rate || 0,
    totalMonthlyUtilities: dashboardData?.total_monthly_utilities || 0,
    collectedUtilities: dashboardData?.collected_utilities || 0,
    pendingUtilities: dashboardData?.pending_utilities || 0,
    overdueUtilities: dashboardData?.overdue_utilities || 0,
    utilityCollectionRate: dashboardData?.utility_collection_rate || 0,
  };

  const occupancyData = [
    { name: 'Occupied', value: stats.occupiedUnits, color: '#4caf50' },
    { name: 'Available', value: stats.availableUnits, color: '#2196f3' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Welcome back, {user?.first_name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your rental properties today.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={<Home color="white" />}
            color="#1976d2"
            subtitle="Active properties"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={stats.totalUnits}
            icon={<Apartment color="white" />}
            color="#4caf50"
            subtitle="Rental units"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate.toFixed(1)}%`}
            icon={<TrendingUp color="white" />}
            color="#ff9800"
            subtitle="Current occupancy"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.totalMonthlyRent.toLocaleString()}`}
            icon={<Payment color="white" />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Utility Payment Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Utility Payments
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Utility Costs"
            value={`$${stats.totalMonthlyUtilities.toLocaleString()}`}
            icon={<ElectricalServices color="white" />}
            color="#ff9800"
            subtitle="Monthly utility costs"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Collected Utilities"
            value={`$${stats.collectedUtilities.toLocaleString()}`}
            icon={<Payment color="white" />}
            color="#4caf50"
            subtitle="Utilities paid this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Utilities"
            value={`$${stats.pendingUtilities.toLocaleString()}`}
            icon={<Assignment color="white" />}
            color="#ff9800"
            subtitle="Utilities pending payment"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Utility Collection Rate"
            value={`${stats.utilityCollectionRate.toFixed(1)}%`}
            icon={<TrendingUp color="white" />}
            color="#9c27b0"
            subtitle="Utility payment rate"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Monthly Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Unit Occupancy
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent payments data available
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Pending Maintenance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No maintenance data available
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

