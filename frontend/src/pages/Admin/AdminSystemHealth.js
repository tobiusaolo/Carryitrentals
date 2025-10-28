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
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Memory as MemoryIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  BugReport as BugReportIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

const AdminSystemHealth = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 120,
    memoryUsage: 65,
    cpuUsage: 45,
    diskUsage: 78,
    activeUsers: 25,
    totalRequests: 15420,
    errorRate: 0.2,
    lastBackup: '2024-10-21T10:30:00Z',
    version: '1.2.3'
  });

  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSystemHealth();
      loadAlerts();
      loadLogs();
    }
  }, [user]);

  const loadSystemHealth = async () => {
    setLoading(true);
    try {
      // Mock system health data
      const mockHealth = {
        status: 'healthy',
        uptime: 99.9,
        responseTime: 120,
        memoryUsage: 65,
        cpuUsage: 45,
        diskUsage: 78,
        activeUsers: 25,
        totalRequests: 15420,
        errorRate: 0.2,
        lastBackup: '2024-10-21T10:30:00Z',
        version: '1.2.3'
      };
      setSystemHealth(mockHealth);
    } catch (err) {
      setError('Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      // Mock alerts data
      const mockAlerts = [
        {
          id: 1,
          type: 'warning',
          message: 'High memory usage detected',
          severity: 'medium',
          timestamp: '2024-10-21T12:00:00Z',
          resolved: false
        },
        {
          id: 2,
          type: 'info',
          message: 'Database backup completed successfully',
          severity: 'low',
          timestamp: '2024-10-21T10:30:00Z',
          resolved: true
        },
        {
          id: 3,
          type: 'error',
          message: 'Failed login attempts exceeded threshold',
          severity: 'high',
          timestamp: '2024-10-21T11:45:00Z',
          resolved: false
        }
      ];
      setAlerts(mockAlerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  const loadLogs = async () => {
    try {
      // Mock logs data
      const mockLogs = [
        {
          id: 1,
          level: 'INFO',
          message: 'User admin@example.com logged in',
          timestamp: '2024-10-21T12:05:00Z',
          source: 'auth'
        },
        {
          id: 2,
          level: 'WARNING',
          message: 'High response time detected for /api/v1/properties',
          timestamp: '2024-10-21T12:03:00Z',
          source: 'api'
        },
        {
          id: 3,
          level: 'ERROR',
          message: 'Database connection timeout',
          timestamp: '2024-10-21T12:01:00Z',
          source: 'database'
        },
        {
          id: 4,
          level: 'INFO',
          message: 'System backup completed',
          timestamp: '2024-10-21T10:30:00Z',
          source: 'backup'
        }
      ];
      setLogs(mockLogs);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'critical': return <ErrorIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'INFO': return 'success';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      default: return 'default';
    }
  };

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
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        System Health Monitoring
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Monitor system performance, health metrics, and security alerts.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* System Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  {getStatusIcon(systemHealth.status)}
                </Avatar>
                <Box>
                  <Typography variant="h5">System Status</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall system health
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={systemHealth.status.toUpperCase()} 
                color={getStatusColor(systemHealth.status)}
                size="large"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">Uptime</Typography>
                  <Typography variant="body2" color="text.secondary">
                    System availability
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" color="success.main">
                {systemHealth.uptime}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Response Time
                </Typography>
              </Box>
              <Typography variant="h4">
                {systemHealth.responseTime}ms
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemHealth.responseTime / 2} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MemoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Memory Usage
                </Typography>
              </Box>
              <Typography variant="h4">
                {systemHealth.memoryUsage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemHealth.memoryUsage} 
                color={systemHealth.memoryUsage > 80 ? 'error' : 'primary'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Disk Usage
                </Typography>
              </Box>
              <Typography variant="h4">
                {systemHealth.diskUsage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemHealth.diskUsage} 
                color={systemHealth.diskUsage > 80 ? 'error' : 'primary'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NetworkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Box>
              <Typography variant="h4">
                {systemHealth.activeUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and Logs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                System Alerts
              </Typography>
              <List>
                {alerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getAlertColor(alert.severity) + '.main' }}>
                        {alert.type === 'error' ? <ErrorIcon /> : 
                         alert.type === 'warning' ? <WarningIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.message}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                          <Chip 
                            label={alert.severity} 
                            color={getAlertColor(alert.severity)}
                            size="small" 
                          />
                        </Box>
                      }
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
                <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Logs
              </Typography>
              <List>
                {logs.map((log) => (
                  <ListItem key={log.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getLogColor(log.level) + '.main' }}>
                        {log.level === 'ERROR' ? <ErrorIcon /> : 
                         log.level === 'WARNING' ? <WarningIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={log.message}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                          <Chip 
                            label={log.level} 
                            color={getLogColor(log.level)}
                            size="small" 
                          />
                          <Chip 
                            label={log.source} 
                            color="default"
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Version: {systemHealth.version}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Last Backup: {new Date(systemHealth.lastBackup).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Requests: {systemHealth.totalRequests.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Error Rate: {systemHealth.errorRate}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSystemHealth;
