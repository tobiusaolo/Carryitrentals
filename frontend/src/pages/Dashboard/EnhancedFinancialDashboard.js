import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  Home,
  CheckCircle,
  Cancel,
  FastForward,
  ExpandMore,
  Send as SendIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import api from '../../services/api/api';
import CriticalAlerts from '../../components/UI/CriticalAlerts';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';
import StatusBadge from '../../components/UI/StatusBadge';
import QuickActionButton from '../../components/UI/QuickActionButton';
import { DashboardSkeleton } from '../../components/UI/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { Send, Payment as PaymentIcon } from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon, color, progress }) => (
  <Card sx={{ height: '100%', borderLeft: 4, borderColor: color }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          bgcolor: `${color}15`, 
          p: 1.5, 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      {progress !== undefined && (
        <Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 1,
              bgcolor: `${color}20`,
              '& .MuiLinearProgress-bar': { bgcolor: color }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {progress.toFixed(1)}% Complete
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const EnhancedFinancialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState([]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  useEffect(() => {
    if (financialData && financialData.overall) {
      generateCriticalAlerts();
    }
  }, [financialData]);

  const generateCriticalAlerts = () => {
    const alerts = [];
    const { overall } = financialData;

    // Overdue tenants alert
    if (overall.tenants_unpaid > 0 && overall.remaining_to_collect > 0) {
      alerts.push({
        type: 'overdue',
        title: `${overall.tenants_unpaid} Tenant${overall.tenants_unpaid > 1 ? 's' : ''} Haven't Paid`,
        message: `You have ${overall.tenants_unpaid} tenant${overall.tenants_unpaid > 1 ? 's' : ''} who haven't paid this month.`,
        amount: overall.remaining_to_collect,
        count: overall.tenants_unpaid,
        actions: [
          { label: 'Send Reminders', key: 'send_reminder', icon: <SendIcon /> },
          { label: 'View Details', key: 'view_details', icon: <ViewIcon /> }
        ]
      });
    }

    // Low collection rate alert
    if (overall.collection_rate < 60 && overall.collection_rate > 0) {
      alerts.push({
        type: 'due',
        title: 'Low Collection Rate',
        message: `Only ${overall.collection_rate.toFixed(0)}% of expected revenue has been collected this month.`,
        actions: [
          { label: 'View Payments', key: 'view_payments', icon: <ViewIcon /> }
        ]
      });
    }

    // High vacancy alert
    if (overall.occupancy_rate < 70 && overall.occupancy_rate > 0) {
      alerts.push({
        type: 'vacant',
        title: 'High Vacancy Rate',
        message: `${overall.vacant_units} unit${overall.vacant_units > 1 ? 's' : ''} are currently vacant (${(100 - overall.occupancy_rate).toFixed(0)}% vacancy rate).`,
        actions: [
          { label: 'View Units', key: 'view_units', icon: <ViewIcon /> }
        ]
      });
    }

    setCriticalAlerts(alerts);
  };

  const handleAlertAction = (alertType, actionKey) => {
    switch (actionKey) {
      case 'send_reminder':
        navigate('/communications');
        break;
      case 'view_details':
      case 'view_payments':
        navigate('/payments');
        break;
      case 'view_units':
        navigate('/units');
        break;
      default:
        break;
    }
  };

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      try {
        // Try the enhanced endpoint first
        const response = await api.get('/analytics/owner-financial-summary');
        setFinancialData(response.data);
        setError(null);
      } catch (enhancedError) {
        // If enhanced endpoint fails, try the basic dashboard-summary as fallback
        console.log('Enhanced endpoint failed, trying fallback...');
        const fallbackResponse = await api.get('/analytics/dashboard-summary');
        
        // Transform the basic data to match enhanced structure
        const basicData = fallbackResponse.data;
        setFinancialData({
          overall: {
            expected_monthly_revenue: basicData.total_monthly_rent || 0,
            current_month_collected: basicData.collected_rent || 0,
            remaining_to_collect: (basicData.total_monthly_rent || 0) - (basicData.collected_rent || 0),
            total_tenants: 0, // Not available in basic endpoint
            tenants_paid: 0,
            tenants_unpaid: 0,
            tenants_paid_ahead: 0,
            total_units: basicData.total_units || 0,
            occupied_units: basicData.occupied_units || 0,
            vacant_units: basicData.available_units || 0,
            occupancy_rate: basicData.occupancy_rate || 0,
            collection_rate: basicData.collection_rate || 0
          },
          properties: [],
          current_month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error loading financial data:', err);
      console.error('Error details:', err.response);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Session expired. Please log out and log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view this data.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load financial data. Please try logging out and back in.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!financialData || !financialData.overall) {
    return <Alert severity="info">No financial data available</Alert>;
  }

  const { overall, properties, current_month } = financialData;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome back, {user?.first_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Financial Overview for {current_month}
        </Typography>
      </Box>

      {/* Critical Alerts */}
      <CriticalAlerts alerts={criticalAlerts} onAction={handleAlertAction} />

      {/* Overall Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Expected Monthly Revenue"
            value={`$${overall.expected_monthly_revenue.toLocaleString()}`}
            subtitle="Total from all tenants"
            icon={<AttachMoney sx={{ fontSize: 32, color: '#1976d2' }} />}
            color="#1976d2"
            onClick={() => navigate('/tenants')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Collected This Month"
            value={`$${overall.current_month_collected.toLocaleString()}`}
            subtitle="Payments received"
            icon={<CheckCircle sx={{ fontSize: 32, color: '#10b981' }} />}
            color="#10b981"
            progress={(overall.current_month_collected / overall.expected_monthly_revenue) * 100}
            onClick={() => navigate('/payments')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Remaining to Collect"
            value={`$${overall.remaining_to_collect.toLocaleString()}`}
            subtitle="Outstanding this month"
            icon={<TrendingUp sx={{ fontSize: 32, color: "#f59e0b" }} />}
            color="#f59e0b"
            progress={((overall.expected_monthly_revenue - overall.remaining_to_collect) / overall.expected_monthly_revenue) * 100}
            onClick={() => navigate('/communications')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Collection Rate"
            value={`${overall.collection_rate.toFixed(1)}%`}
            subtitle="Of expected revenue"
            icon={<AttachMoney sx={{ fontSize: 32, color: '#8b5cf6' }} />}
            color="#8b5cf6"
            progress={overall.collection_rate}
            trend={overall.collection_rate >= 80 ? 5 : -5}
          />
        </Grid>
      </Grid>

      {/* Tenant Payment Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Total Tenants"
            value={overall.total_tenants}
            subtitle="Active tenants"
            icon={<People sx={{ fontSize: 32, color: '#0ea5e9' }} />}
            color="#0ea5e9"
            onClick={() => navigate('/tenants')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Tenants Paid"
            value={overall.tenants_paid}
            subtitle={overall.total_tenants > 0 ? `${((overall.tenants_paid / overall.total_tenants) * 100).toFixed(0)}% of tenants` : 'No tenants'}
            icon={<CheckCircle sx={{ fontSize: 32, color: '#10b981' }} />}
            color="#10b981"
            progress={overall.total_tenants > 0 ? (overall.tenants_paid / overall.total_tenants) * 100 : 0}
            trend={overall.total_tenants > 0 ? ((overall.tenants_paid / overall.total_tenants) * 100) - 70 : 0}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Tenants Unpaid"
            value={overall.tenants_unpaid}
            subtitle={overall.total_tenants > 0 ? `${((overall.tenants_unpaid / overall.total_tenants) * 100).toFixed(0)}% pending` : 'No tenants'}
            icon={<Cancel sx={{ fontSize: 32, color: '#ef4444' }} />}
            color="#ef4444"
            onClick={() => navigate('/communications')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EnhancedStatCard
            title="Paid Ahead"
            value={overall.tenants_paid_ahead}
            subtitle="Advance payments"
            icon={<FastForward sx={{ fontSize: 32, color: '#8b5cf6' }} />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Occupancy Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <EnhancedStatCard
            title="Total Units"
            value={overall.total_units}
            subtitle="Across all properties"
            icon={<Home sx={{ fontSize: 32, color: '#6366f1' }} />}
            color="#6366f1"
            onClick={() => navigate('/units')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EnhancedStatCard
            title="Occupied Units"
            value={overall.occupied_units}
            subtitle={`${overall.occupancy_rate.toFixed(1)}% occupancy`}
            icon={<CheckCircle sx={{ fontSize: 32, color: '#10b981' }} />}
            color="#10b981"
            progress={overall.occupancy_rate}
            trend={overall.occupancy_rate - 75}
            trendLabel={`${overall.occupancy_rate >= 75 ? 'Above' : 'Below'} target`}
            onClick={() => navigate('/units')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <EnhancedStatCard
            title="Vacant Units"
            value={overall.vacant_units}
            subtitle="Available for rent"
            icon={<Home sx={{ fontSize: 32, color: '#f59e0b' }} />}
            color="#f59e0b"
            onClick={() => navigate('/units-for-rent')}
          />
        </Grid>
      </Grid>

      {/* Per-Property Breakdown */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Property Breakdown
      </Typography>
      
      {properties.map((property) => (
        <Accordion key={property.property_id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
              <Home sx={{ mr: 2, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {property.property_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.total_tenants} tenants • {property.occupied_units}/{property.total_units} units occupied
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', mr: 2 }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${property.current_month_collected.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  of ${property.expected_monthly_revenue.toLocaleString()}
                </Typography>
              </Box>
              <Chip 
                label={`${property.collection_rate.toFixed(0)}%`}
                color={property.collection_rate >= 80 ? 'success' : property.collection_rate >= 50 ? 'warning' : 'error'}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Property Stats */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Expected Revenue:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${property.expected_monthly_revenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Collected:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ${property.current_month_collected.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Remaining:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      ${property.remaining_to_collect.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={property.collection_rate}
                    sx={{ mt: 2, height: 8, borderRadius: 1 }}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Occupancy & Payments
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tenants Paid:</Typography>
                    <Chip label={property.tenants_paid} size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tenants Unpaid:</Typography>
                    <Chip label={property.tenants_unpaid} size="small" color="error" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Paid Ahead:</Typography>
                    <Chip label={property.tenants_paid_ahead} size="small" color="secondary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2">Occupancy:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {property.occupied_units}/{property.total_units} ({property.occupancy_rate.toFixed(0)}%)
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Tenant Lists */}
              {property.tenants_unpaid_list.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Unpaid Tenants ({property.tenants_unpaid})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tenant</TableCell>
                            <TableCell align="right">Expected</TableCell>
                            <TableCell align="right">Paid</TableCell>
                            <TableCell align="right">Remaining</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {property.tenants_unpaid_list.map((tenant) => (
                            <TableRow 
                              key={tenant.id}
                              sx={{ 
                                '&:hover': { bgcolor: 'action.hover' },
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {tenant.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  ${tenant.expected.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="success.main">
                                  ${tenant.amount_paid.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                  ${tenant.remaining.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={tenant.payment_status} />
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <QuickActionButton 
                                    icon={<Send />} 
                                    tooltip="Send SMS Reminder" 
                                    onClick={() => navigate('/communications')}
                                    color="primary"
                                  />
                                  <QuickActionButton 
                                    icon={<PaymentIcon />} 
                                    tooltip="Record Payment" 
                                    onClick={() => navigate('/payments')}
                                    color="success"
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}

              {property.tenants_paid_ahead_list.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'secondary.50' }}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Tenants Paid Ahead ({property.tenants_paid_ahead})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tenant</TableCell>
                            <TableCell align="right">Months Ahead</TableCell>
                            <TableCell align="right">Extra Amount</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {property.tenants_paid_ahead_list.map((tenant) => (
                            <TableRow 
                              key={tenant.id}
                              sx={{ 
                                '&:hover': { bgcolor: 'secondary.50' },
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {tenant.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`+${tenant.months_ahead} month${tenant.months_ahead > 1 ? 's' : ''}`} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#ede9fe', 
                                    color: '#5b21b6',
                                    fontWeight: 600
                                  }}
                                  icon={<FastForward sx={{ fontSize: 16, color: '#5b21b6' }} />}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                                  ${tenant.extra_amount.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <StatusBadge status="paid_ahead" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default EnhancedFinancialDashboard;

