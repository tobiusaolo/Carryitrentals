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
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminPanel from '../../components/Admin/AdminPanel';
import adminAPI from '../../services/api/adminAPI';
import { portalOutlinedButtonSx } from '../../theme/designTokens';

const AdminActivityLogs = () => {
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [detailLog, setDetailLog] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadActivityLogs();
    }
    const handler = () => loadActivityLogs();
    window.addEventListener('carryit:admin-refresh', handler);
    return () => window.removeEventListener('carryit:admin-refresh', handler);
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
      render: (log) => (
        <TableActions
          actions={[
            { icon: <ViewIcon fontSize="small" />, label: 'View details', onClick: () => setDetailLog(log) },
          ]}
        />
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">You need admin privileges to access this page.</Alert>
      </AdminPage>
    );
  }

  const errorCount = logs.filter((log) => log.level === 'ERROR').length;
  const warningCount = logs.filter((log) => log.level === 'WARNING').length;
  const infoCount = logs.filter((log) => log.level === 'INFO').length;

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Activity logs"
        subtitle="Audit log"
        action={
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportLogs} size="small" sx={portalOutlinedButtonSx}>
            Export CSV
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AdminStatStrip
        loading={loading}
        stats={[
          { id: 'total', title: 'Total logs', value: logs.length, icon: <ScheduleIcon /> },
          { id: 'errors', title: 'Errors', value: errorCount, icon: <ErrorIcon /> },
          { id: 'warnings', title: 'Warnings', value: warningCount, icon: <WarningIcon /> },
          { id: 'info', title: 'Info', value: infoCount, icon: <CheckCircleIcon /> },
        ]}
      />

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
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshLogs} size="small" sx={portalOutlinedButtonSx}>
              Refresh
            </Button>
          </Box>
        }
      />

      {detailLog && (
        <AdminPanel title="Log details" sx={{ mt: 2 }} contentSx={{ py: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Time:</strong> {new Date(detailLog.timestamp).toLocaleString()}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Level:</strong> {detailLog.level}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Category:</strong> {detailLog.category}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>User:</strong> {detailLog.user}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Action:</strong> {detailLog.action}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Description:</strong> {detailLog.description}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>IP:</strong> {detailLog.ip_address || '-'}</Typography>
          <Button size="small" onClick={() => setDetailLog(null)}>Close</Button>
        </AdminPanel>
      )}
    </AdminPage>
  );
};

export default AdminActivityLogs;
