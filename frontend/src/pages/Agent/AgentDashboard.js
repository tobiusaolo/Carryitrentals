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
  Grow,
  Slide,
  Zoom
} from '@mui/material';
import {
  Home,
  CheckCircle,
  Visibility,
  AttachMoney,
  Add,
  Assignment,
  TrendingUp
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
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading agent stats...');
      console.log('📦 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      console.log('👤 User in localStorage:', localStorage.getItem('user') ? 'EXISTS' : 'MISSING');
      
      const response = await api.get('/agents/my-stats');
      console.log('✅ Agent stats loaded:', response.data);
      setAgentData(response.data);
    } catch (err) {
      console.error('❌ Error loading agent data:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error detail:', err.response?.data?.detail);
      setError(err.response?.data?.detail || 'Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Default data if API doesn't exist yet
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
  
  // Add alerts based on agent performance
  if (stats.pending_inspections > 0) {
    alerts.push({
      type: 'due',
      title: `${stats.pending_inspections} Pending Inspection${stats.pending_inspections > 1 ? 's' : ''}`,
      message: 'You have inspections waiting for approval',
      count: stats.pending_inspections,
      actions: [
        { label: 'View Inspections', key: 'view_inspections' }
      ]
    });
  }

  const handleAlertAction = (type, key) => {
    if (key === 'view_inspections') {
      navigate('/agent/inspections');
    }
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Fade in={true} timeout={600}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome back, {user?.first_name || 'Agent'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your Performance Dashboard
          </Typography>
        </Box>
      </Fade>

      {/* Critical Alerts */}
      <Slide in={true} direction="down" timeout={700}>
        <Box>
          <CriticalAlerts alerts={alerts} onAction={handleAlertAction} />
        </Box>
      </Slide>

      {/* Quick Actions */}
      <Grow in={true} timeout={800}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/agent/add-unit')}
              sx={{
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)'
                }
              }}
            >
              Add Rental Unit
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Assignment />}
              onClick={() => navigate('/agent/inspections')}
              sx={{
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderWidth: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderWidth: 2,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              My Inspections
            </Button>
          </Grid>
        </Grid>
      </Grow>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Zoom in={true} timeout={900}>
            <Box>
              <EnhancedStatCard
                title="Units Added"
                value={stats.total_units_added}
                subtitle="Total rentals"
                icon={<Home sx={{ fontSize: 32, color: '#1976d2' }} />}
                color="#1976d2"
                onClick={() => navigate('/agent/my-units')}
              />
            </Box>
          </Zoom>
        </Grid>
        <Grid item xs={6} md={3}>
          <Zoom in={true} timeout={1000}>
            <Box>
              <EnhancedStatCard
                title="Occupied"
                value={stats.occupied_units}
                subtitle="Units rented"
                icon={<CheckCircle sx={{ fontSize: 32, color: '#10b981' }} />}
                color="#10b981"
                progress={stats.total_units_added > 0 ? (stats.occupied_units / stats.total_units_added) * 100 : 0}
              />
            </Box>
          </Zoom>
        </Grid>
        <Grid item xs={6} md={3}>
          <Zoom in={true} timeout={1100}>
            <Box>
              <EnhancedStatCard
                title="Vacant"
                value={stats.vacant_units}
                subtitle="Available"
                icon={<Home sx={{ fontSize: 32, color: '#f59e0b' }} />}
                color="#f59e0b"
              />
            </Box>
          </Zoom>
        </Grid>
        <Grid item xs={6} md={3}>
          <Zoom in={true} timeout={1200}>
            <Box>
              <EnhancedStatCard
                title="Inspections"
                value={stats.total_inspections}
                subtitle="Total bookings"
                icon={<Visibility sx={{ fontSize: 32, color: '#0ea5e9' }} />}
                color="#0ea5e9"
                onClick={() => navigate('/agent/inspections')}
              />
            </Box>
          </Zoom>
        </Grid>
      </Grid>

      {/* Earnings Section */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        💰 Earnings
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <EnhancedStatCard
            title="Total Earnings"
            value={`$${(stats.total_earnings || 0).toLocaleString()}`}
            subtitle="From approved inspections"
            icon={<AttachMoney sx={{ fontSize: 32, color: '#10b981' }} />}
            color="#10b981"
            trend={stats.total_earnings > 0 ? 5 : 0}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <EnhancedStatCard
            title="Pending Earnings"
            value={`$${(stats.pending_earnings || 0).toLocaleString()}`}
            subtitle="Awaiting approval"
            icon={<AttachMoney sx={{ fontSize: 32, color: '#f59e0b' }} />}
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* Inspection Status */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        📋 Inspection Status
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold">
              {stats.approved_inspections}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Approved Inspections
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold">
              {stats.pending_inspections}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Pending Review
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold">
              {stats.total_inspections}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Total Inspections
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentDashboard;

