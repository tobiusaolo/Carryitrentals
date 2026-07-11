import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  BugReport as BugReportIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import adminAPI from '../../services/api/adminAPI';
import PageHeader from '../../components/UI/PageHeader';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminPanel from '../../components/Admin/AdminPanel';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { portalOutlinedButtonSx } from '../../theme/designTokens';

const AdminSystemHealth = () => {
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSystemHealth();
    }
  }, [user]);

  const loadSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAPI.getSystemHealth();
      setSystemHealth(data);
      setAlerts(data.alerts || []);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">Admin access required</Alert>
      </AdminPage>
    );
  }

  if (loading && !systemHealth) {
    return (
      <AdminPage>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminPage>
    );
  }

  if (!systemHealth) {
    return null;
  }

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="System health"
        subtitle="Live operational metrics from payments, bookings, and maintenance"
        action={
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadSystemHealth}
            variant="outlined"
            size="small"
            disabled={loading}
            sx={portalOutlinedButtonSx}
          >
            Refresh
          </Button>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AdminStatStrip
        stats={[
          {
            title: 'System status',
            value: systemHealth.status,
            icon: <SecurityIcon />,
            subtitle: 'Overall health',
          },
          {
            title: 'Active users',
            value: `${systemHealth.active_users} / ${systemHealth.total_users}`,
            icon: <PeopleIcon />,
            subtitle: 'Registered accounts',
          },
          {
            title: 'Pending payments',
            value: systemHealth.pending_payments,
            icon: <MoneyIcon />,
          },
          {
            title: 'Pending viewings',
            value: systemHealth.pending_inspections,
            icon: <ScheduleIcon />,
          },
          {
            title: 'Overdue rent',
            value: systemHealth.overdue_payments,
            icon: <WarningIcon />,
          },
          {
            title: 'Open maintenance',
            value: systemHealth.active_maintenance,
            icon: <BugReportIcon />,
          },
        ]}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AdminPanel title="System alerts" contentSx={{ py: 0 }}>
            <List disablePadding>
              {alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No active alerts.
                </Typography>
              ) : (
                alerts.map((alert) => (
                  <ListItem key={alert.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      {alert.type === 'error' ? <ErrorIcon color="error" /> :
                       alert.type === 'warning' ? <WarningIcon color="warning" /> :
                       <CheckCircleIcon color="success" />}
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.message}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                          <AdminStatusChip status={alert.severity} label={alert.severity} />
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </AdminPanel>
        </Grid>

        <Grid item xs={12} md={6}>
          <AdminPanel title="Recent logs" contentSx={{ py: 0 }}>
            <List disablePadding>
              {logs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No recent logs.
                </Typography>
              ) : (
                logs.map((log) => (
                  <ListItem key={log.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      {log.level === 'ERROR' ? <ErrorIcon color="error" fontSize="small" /> :
                       log.level === 'WARNING' ? <WarningIcon color="warning" fontSize="small" /> :
                       <CheckCircleIcon color="success" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(log.timestamp).toLocaleString()} · {log.source}
                          </Typography>
                          <AdminStatusChip status={log.level?.toLowerCase()} label={log.level} />
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </AdminPanel>
        </Grid>
      </Grid>

      <AdminPanel title="System information" sx={{ mt: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Version: {systemHealth.version}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Manual proofs pending: {systemHealth.pending_manual_proofs}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <NetworkIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
              Infrastructure monitoring: {systemHealth.infrastructure_monitored ? 'Enabled' : 'Not configured'}
            </Typography>
          </Grid>
        </Grid>
        {!systemHealth.infrastructure_monitored && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Server CPU, memory, and disk are not monitored in this deployment. Metrics above
            reflect live business operations from your database.
          </Alert>
        )}
      </AdminPanel>
    </AdminPage>
  );
};

export default AdminSystemHealth;
