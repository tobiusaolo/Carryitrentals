import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import adminAPI from '../../services/api/adminAPI';

const AdminActivityLogs = () => {
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadActivityLogs();
    }
  }, [user]);

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    if (levelFilter !== 'all') {
      filtered = filtered.filter((log) => log.level === levelFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((log) => log.category === categoryFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter((log) => new Date(log.timestamp) >= filterDate);
    }

    return filtered;
  }, [logs, levelFilter, categoryFilter, dateFilter]);

  const loadActivityLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAPI.getActivityLogs(300);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'INFO': return 'success';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      case 'DEBUG': return 'info';
      default: return 'default';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'INFO': return <InfoIcon />;
      case 'WARNING': return <WarningIcon />;
      case 'ERROR': return <ErrorIcon />;
      case 'DEBUG': return <CheckCircleIcon />;
      default: return <InfoIcon />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Authentication': return <SecurityIcon />;
      case 'Property': return <HomeIcon />;
      case 'Payment': return <MoneyIcon />;
      case 'Inspection': return <AssignmentIcon />;
      case 'API': return <BusinessIcon />;
      case 'Database': return <BusinessIcon />;
      case 'System': return <SecurityIcon />;
      case 'Security': return <SecurityIcon />;
      default: return <InfoIcon />;
    }
  };

  const exportLogs = () => {
    const header = ['timestamp', 'level', 'category', 'user', 'action', 'description'];
    const rows = filteredLogs.map((log) =>
      header.map((key) => `"${String(log[key] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carryit-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshLogs = () => {
    loadActivityLogs();
  };

  const logColumns = [
    {
      id: 'timestamp',
      label: 'Timestamp',
      render: (log) => (
        <Typography variant="body2">{new Date(log.timestamp).toLocaleString()}</Typography>
      ),
    },
    {
      id: 'level',
      label: 'Level',
      render: (log) => (
        <Chip icon={getLevelIcon(log.level)} label={log.level} color={getLevelColor(log.level)} size="small" />
      ),
    },
    {
      id: 'category',
      label: 'Category',
      getSearchValue: (row) => row.category,
      render: (log) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: 'primary.light' }}>
            {getCategoryIcon(log.category)}
          </Avatar>
          <Typography variant="body2">{log.category}</Typography>
        </Box>
      ),
    },
    {
      id: 'user',
      label: 'User',
      getSearchValue: (row) => row.user,
      render: (log) => (
        <Typography variant="body2">{log.user === 'system' ? 'System' : log.user}</Typography>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      getSearchValue: (row) => row.action,
      render: (log) => (
        <Typography variant="body2" fontWeight="bold">{log.action}</Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      getSearchValue: (row) => row.description,
      render: (log) => (
        <Typography variant="body2">{log.description}</Typography>
      ),
    },
    {
      id: 'ip_address',
      label: 'IP Address',
      getSearchValue: (row) => row.ip_address,
      render: (log) => (
        <Typography variant="body2" color="text.secondary">{log.ip_address}</Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: () => (
        <TableActions
          actions={[
            { icon: <ViewIcon fontSize="small" />, label: 'View Details', onClick: () => {} },
          ]}
        />
      ),
    },
  ];

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
        <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Activity Logs
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Events derived from tenants, properties, payments, and viewing bookings in your database.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{logs.length}</Typography>
                  <Typography color="text.secondary">Total Logs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {logs.filter(log => log.level === 'ERROR').length}
                  </Typography>
                  <Typography color="text.secondary">Errors</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {logs.filter(log => log.level === 'WARNING').length}
                  </Typography>
                  <Typography color="text.secondary">Warnings</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {logs.filter(log => log.level === 'INFO').length}
                  </Typography>
                  <Typography color="text.secondary">Info Logs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        columns={logColumns}
        rows={filteredLogs}
        loading={loading}
        title="Activity Logs"
        subtitle={`${filteredLogs.length} shown · ${logs.length} total`}
        emptyTitle="No activity logs"
        emptyDescription="System events and user actions will appear here once logged."
        emptyIcon={ScheduleIcon}
        searchPlaceholder="Search by user, action, or description…"
        pageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        toolbar={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Level</InputLabel>
              <Select value={levelFilter} label="Level" onChange={(e) => setLevelFilter(e.target.value)}>
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="INFO">Info</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="ERROR">Error</MenuItem>
                <MenuItem value="DEBUG">Debug</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Authentication">Authentication</MenuItem>
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Payment">Payment</MenuItem>
                <MenuItem value="Inspection">Inspection</MenuItem>
                <MenuItem value="API">API</MenuItem>
                <MenuItem value="Database">Database</MenuItem>
                <MenuItem value="System">System</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Date Range</InputLabel>
              <Select value={dateFilter} label="Date Range" onChange={(e) => setDateFilter(e.target.value)}>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshLogs} size="small">
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportLogs} size="small">
              Export
            </Button>
          </Box>
        }
      />
    </Box>
  );
};

export default AdminActivityLogs;
