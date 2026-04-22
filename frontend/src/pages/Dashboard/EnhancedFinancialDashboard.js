import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
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
  Divider,
  Container,
  Avatar
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
  Visibility as ViewIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import api from '../../services/api/api';
import CriticalAlerts from '../../components/UI/CriticalAlerts';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';
import StatusBadge from '../../components/UI/StatusBadge';
import QuickActionButton from '../../components/UI/QuickActionButton';
import { DashboardSkeleton } from '../../components/UI/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

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

    if (overall.tenants_unpaid > 0 && overall.remaining_to_collect > 0) {
      alerts.push({
        type: 'overdue',
        title: `${overall.tenants_unpaid} Unpaid Payments`,
        message: `${overall.tenants_unpaid} tenants haven't paid this month yet.`,
        amount: overall.remaining_to_collect,
        count: overall.tenants_unpaid,
        actions: [
          { label: 'Remind All', key: 'send_reminder', icon: <SendIcon /> },
          { label: 'Review', key: 'view_details', icon: <ViewIcon /> }
        ]
      });
    }

    setCriticalAlerts(alerts);
  };

  const handleAlertAction = (alertType, actionKey) => {
    switch (actionKey) {
      case 'send_reminder': navigate('/communications'); break;
      case 'view_details': case 'view_payments': navigate('/payments'); break;
      case 'view_units': navigate('/units'); break;
      default: break;
    }
  };

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/owner-financial-summary');
      setFinancialData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container sx={{ mt: 4 }}><DashboardSkeleton /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!financialData || !financialData.overall) return <Container sx={{ mt: 4 }}><Alert severity="info">No dashboard data available</Alert></Container>;

  const { overall, properties, current_month } = financialData;

  return (
    <Box sx={{ pb: 8 }}>
      {/* Premium Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #EEE', pt: 6, pb: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 1 }}>
                Welcome, {user?.first_name}!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={current_month} size="small" sx={{ fontWeight: 700, bgcolor: '#F7F7F7', border: '1px solid #DDD' }} />
                <Typography variant="body2" color="text.secondary">
                  Here's what's happening with your properties today.
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Avatar 
                sx={{ width: 56, height: 56, bgcolor: '#667eea', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}
              >
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <CriticalAlerts alerts={criticalAlerts} onAction={handleAlertAction} />
          </Box>
        )}

        {/* Financial Highlights */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney sx={{ color: '#667eea' }} /> Financial Highlights
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Expected Revenue"
              value={`$${overall.expected_monthly_revenue.toLocaleString()}`}
              subtitle="Current billing cycle"
              icon={<AttachMoney />}
              color="#667eea"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Collected"
              value={`$${overall.current_month_collected.toLocaleString()}`}
              subtitle="Payments confirmed"
              icon={<CheckCircle />}
              color="#10b981"
              progress={(overall.current_month_collected / overall.expected_monthly_revenue) * 100}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Outstanding"
              value={`$${overall.remaining_to_collect.toLocaleString()}`}
              subtitle="Pending collection"
              icon={<TrendingUp />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Collection Rate"
              value={`${overall.collection_rate.toFixed(1)}%`}
              subtitle="Performance target: 95%"
              icon={<TrendingUp />}
              color="#8b5cf6"
              progress={overall.collection_rate}
            />
          </Grid>
        </Grid>

        {/* Occupancy & Tenants */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Home sx={{ color: '#667eea' }} /> Portfolio Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <EnhancedStatCard
                  title="Total Units"
                  value={overall.total_units}
                  icon={<Home />}
                  color="#6366f1"
                />
              </Grid>
              <Grid item xs={6}>
                <EnhancedStatCard
                  title="Occupancy"
                  value={`${overall.occupancy_rate.toFixed(1)}%`}
                  icon={<People />}
                  color="#10b981"
                  progress={overall.occupancy_rate}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <People sx={{ color: '#667eea' }} /> Tenant Activity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <EnhancedStatCard
                  title="Paid Ahead"
                  value={overall.tenants_paid_ahead}
                  icon={<FastForward />}
                  color="#8b5cf6"
                />
              </Grid>
              <Grid item xs={6}>
                <EnhancedStatCard
                  title="Unpaid"
                  value={overall.tenants_unpaid}
                  icon={<Cancel />}
                  color="#ef4444"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Property Detailed Breakdown */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2 }}>
          Property Breakdown
        </Typography>
        
        {properties.map((property) => (
          <Accordion 
            key={property.property_id} 
            elevation={0}
            sx={{ 
              mb: 2, 
              borderRadius: '16px !important', 
              border: '1px solid #EEE',
              '&:before': { display: 'none' },
              overflow: 'hidden'
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Box sx={{ bgcolor: '#F7F7F7', p: 1, borderRadius: '12px' }}>
                  <Home sx={{ color: '#667eea' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#222' }}>
                    {property.property_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {property.occupied_units}/{property.total_units} Units Occupied • {property.collection_rate.toFixed(0)}% Collected
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mr: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#667eea' }}>
                    ${property.current_month_collected.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4, bgcolor: '#FAFAFA' }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #EEE' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Collection Progress</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Collected</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>${property.current_month_collected.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Remaining</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>${property.remaining_to_collect.toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={property.collection_rate}
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#EEE', '& .MuiLinearProgress-bar': { bgcolor: '#667eea' } }}
                    />
                  </Paper>
                </Grid>
                
                {property.tenants_unpaid_list.length > 0 && (
                  <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #EEE' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#ef4444' }}>Unpaid Tenants</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>Remaining</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {property.tenants_unpaid_list.map((tenant) => (
                              <TableRow key={tenant.id}>
                                <TableCell sx={{ fontWeight: 600 }}>{tenant.name}</TableCell>
                                <TableCell align="right" sx={{ color: '#ef4444', fontWeight: 700 }}>
                                  ${tenant.remaining.toLocaleString()}
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <QuickActionButton 
                                      icon={<SendIcon sx={{ fontSize: 18 }} />} 
                                      tooltip="Remind" 
                                      onClick={() => navigate('/communications')}
                                      color="primary"
                                    />
                                    <QuickActionButton 
                                      icon={<PaymentIcon sx={{ fontSize: 18 }} />} 
                                      tooltip="Record" 
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
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};

export default EnhancedFinancialDashboard;
