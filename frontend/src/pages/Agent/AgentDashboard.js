import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Alert,
  Fade,
  Container,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Home,
  CheckCircle,
  Visibility,
  AttachMoney,
  Add,
  Assignment,
  FastForward,
  Cancel
} from '@mui/icons-material';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';
import CriticalAlerts from '../../components/UI/CriticalAlerts';
import { DashboardSkeleton } from '../../components/UI/LoadingSkeleton';
import api from '../../services/api/api';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents/my-stats');
      setAgentData(response.data);
    } catch (err) {
      console.error('Error loading agent data:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container sx={{ mt: 4 }}><DashboardSkeleton /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const stats = agentData || {
    total_units_added: 0,
    occupied_units: 0,
    vacant_units: 0,
    total_inspections: 0,
    approved_inspections: 0,
    pending_inspections: 0,
    total_earnings: 0,
    pending_earnings: 0
  };

  const alerts = [];
  if (stats.pending_inspections > 0) {
    alerts.push({
      type: 'due',
      title: `${stats.pending_inspections} Pending Approvals`,
      message: 'You have inspections waiting for administrator review.',
      count: stats.pending_inspections,
      actions: [{ label: 'View Inspections', key: 'view_inspections' }]
    });
  }

  const handleAlertAction = (type, key) => {
    if (key === 'view_inspections') navigate('/agent/inspections');
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Premium Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #EEE', pt: 6, pb: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 1 }}>
                Agent Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Property Agent" size="small" sx={{ fontWeight: 700, bgcolor: '#F7F7F7', border: '1px solid #DDD' }} />
                <Typography variant="body2" color="text.secondary">
                  Welcome back, {user?.first_name || 'Agent'}!
                </Typography>
              </Box>
            </Grid>
            <Grid item sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/agent/add-unit')}
                sx={{
                  bgcolor: '#667eea', borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 3,
                  '&:hover': { bgcolor: '#5a6fd8' }
                }}
              >
                Add Unit
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <CriticalAlerts alerts={alerts} onAction={handleAlertAction} />

        {/* Performance Metrics */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment sx={{ color: '#667eea' }} /> Performance Metrics
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Units Listed"
              value={stats.total_units_added}
              subtitle="Portfolio size"
              icon={<Home />}
              color="#667eea"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Total Earnings"
              value={`$${(stats.total_earnings || 0).toLocaleString()}`}
              subtitle="Paid to date"
              icon={<AttachMoney />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Pending Earnings"
              value={`$${(stats.pending_earnings || 0).toLocaleString()}`}
              subtitle="Awaiting approval"
              icon={<FastForward />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <EnhancedStatCard
              title="Conversion"
              value={`${stats.total_units_added > 0 ? ((stats.occupied_units / stats.total_units_added) * 100).toFixed(0) : 0}%`}
              subtitle="Occupancy rate"
              icon={<CheckCircle />}
              color="#8b5cf6"
              progress={stats.total_units_added > 0 ? (stats.occupied_units / stats.total_units_added) * 100 : 0}
            />
          </Grid>
        </Grid>

        {/* Detailed Stats */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #EEE' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Inspection Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>{stats.approved_inspections}</Typography>
                    <Typography variant="body2" color="text.secondary">Approved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>{stats.pending_inspections}</Typography>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#667eea' }}>{stats.total_inspections}</Typography>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 4 }}>
                <Button 
                  fullWidth variant="outlined" onClick={() => navigate('/agent/inspections')}
                  sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', py: 1.5 }}
                >
                  View All Inspections
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #EEE' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Inventory Status</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Occupied Units</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#10b981' }}>{stats.occupied_units}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Vacant Units</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#ef4444' }}>{stats.vacant_units}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Portfolio</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>{stats.total_units_added}</Typography>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Button 
                  fullWidth variant="outlined" onClick={() => navigate('/agent/my-units')}
                  sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', py: 1.5 }}
                >
                  Manage Inventory
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AgentDashboard;
