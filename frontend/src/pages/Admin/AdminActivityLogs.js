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
  Button,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Pagination,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
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
import { useDispatch, useSelector } from 'react-redux';

const AdminActivityLogs = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadActivityLogs();
    }
  }, [user]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, levelFilter, categoryFilter, dateFilter]);

  const loadActivityLogs = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockLogs = [
        {
          id: 1,
          timestamp: '2024-10-21T12:05:00Z',
          level: 'INFO',
          category: 'Authentication',
          user: 'admin@example.com',
          action: 'User login',
          description: 'Admin user logged in successfully',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { login_method: 'email', session_duration: '2h 30m' }
        },
        {
          id: 2,
          timestamp: '2024-10-21T12:03:00Z',
          level: 'WARNING',
          category: 'API',
          user: 'system',
          action: 'High response time',
          description: 'API endpoint /api/v1/properties took 2.5s to respond',
          ip_address: '127.0.0.1',
          user_agent: 'System',
          details: { endpoint: '/api/v1/properties', response_time: '2500ms', threshold: '1000ms' }
        },
        {
          id: 3,
          timestamp: '2024-10-21T12:01:00Z',
          level: 'ERROR',
          category: 'Database',
          user: 'system',
          action: 'Connection timeout',
          description: 'Database connection timeout after 30s',
          ip_address: '127.0.0.1',
          user_agent: 'System',
          details: { connection_pool: 'exhausted', retry_count: 3 }
        },
        {
          id: 4,
          timestamp: '2024-10-21T11:58:00Z',
          level: 'INFO',
          category: 'Property',
          user: 'owner@example.com',
          action: 'Property created',
          description: 'New property "Sunset Apartments" created',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          details: { property_id: 3, property_name: 'Sunset Apartments', location: 'Entebbe' }
        },
        {
          id: 5,
          timestamp: '2024-10-21T11:55:00Z',
          level: 'INFO',
          category: 'Payment',
          user: 'tenant@example.com',
          action: 'Payment received',
          description: 'Rent payment of $1,200 received via mobile money',
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          details: { amount: 1200, method: 'MTN Mobile Money', transaction_id: 'MTN123456' }
        },
        {
          id: 6,
          timestamp: '2024-10-21T11:50:00Z',
          level: 'WARNING',
          category: 'Security',
          user: 'unknown',
          action: 'Failed login attempt',
          description: 'Multiple failed login attempts from IP 192.168.1.200',
          ip_address: '192.168.1.200',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { attempts: 5, blocked: true, duration: '10 minutes' }
        },
        {
          id: 7,
          timestamp: '2024-10-21T11:45:00Z',
          level: 'INFO',
          category: 'Inspection',
          user: 'agent@example.com',
          action: 'Inspection completed',
          description: 'Property inspection completed for Unit 101',
          ip_address: '192.168.1.103',
          user_agent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
          details: { unit_id: 1, inspection_type: 'routine', status: 'completed', findings: 'Minor maintenance needed' }
        },
        {
          id: 8,
          timestamp: '2024-10-21T11:40:00Z',
          level: 'ERROR',
          category: 'System',
          user: 'system',
          action: 'Backup failed',
          description: 'Daily backup process failed due to insufficient disk space',
          ip_address: '127.0.0.1',
          user_agent: 'System',
          details: { backup_size: '2.5GB', available_space: '1.2GB', retry_scheduled: '2024-10-22T02:00:00Z' }
        }
      ];
      setLogs(mockLogs);
    } catch (err) {
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    // Date filter
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
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
      }
    }

    setFilteredLogs(filtered);
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
    // TODO: Implement CSV/JSON export
    console.log('Exporting logs...');
  };

  const refreshLogs = () => {
    loadActivityLogs();
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

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
        Monitor system activity, user actions, and system events across the platform.
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

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="INFO">Info</MenuItem>
                  <MenuItem value="WARNING">Warning</MenuItem>
                  <MenuItem value="ERROR">Error</MenuItem>
                  <MenuItem value="DEBUG">Debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
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
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refreshLogs}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportLogs}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Logs ({filteredLogs.length} results)
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getLevelIcon(log.level)}
                        label={log.level} 
                        color={getLevelColor(log.level)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: 'primary.light' }}>
                          {getCategoryIcon(log.category)}
                        </Avatar>
                        <Typography variant="body2">{log.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.user === 'system' ? 'System' : log.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminActivityLogs;
