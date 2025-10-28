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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Switch,
  FormControlLabel,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  Done as MarkAsReadIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

const AdminNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    target_audience: 'all',
    send_email: false,
    send_sms: false,
    scheduled_time: '',
    is_active: true
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockNotifications = [
        {
          id: 1,
          title: 'System Maintenance Scheduled',
          message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM. The system will be temporarily unavailable.',
          type: 'warning',
          priority: 'high',
          target_audience: 'all',
          send_email: true,
          send_sms: false,
          scheduled_time: '2024-10-27T02:00:00Z',
          is_active: true,
          status: 'scheduled',
          created_at: '2024-10-21T10:00:00Z',
          sent_at: null,
          read_count: 0,
          total_recipients: 25
        },
        {
          id: 2,
          title: 'Payment Overdue Alert',
          message: 'Tenant John Doe (Unit 101) has an overdue payment of $1,200. Please follow up.',
          type: 'error',
          priority: 'high',
          target_audience: 'property_owners',
          send_email: true,
          send_sms: true,
          scheduled_time: '2024-10-21T12:00:00Z',
          is_active: true,
          status: 'sent',
          created_at: '2024-10-21T11:30:00Z',
          sent_at: '2024-10-21T12:00:00Z',
          read_count: 3,
          total_recipients: 5
        },
        {
          id: 3,
          title: 'New Property Registration',
          message: 'A new property "Garden Villas" has been registered by owner@example.com. Please review and approve.',
          type: 'info',
          priority: 'medium',
          target_audience: 'admins',
          send_email: true,
          send_sms: false,
          scheduled_time: '2024-10-21T14:00:00Z',
          is_active: true,
          status: 'sent',
          created_at: '2024-10-21T13:45:00Z',
          sent_at: '2024-10-21T14:00:00Z',
          read_count: 1,
          total_recipients: 2
        },
        {
          id: 4,
          title: 'Inspection Completed',
          message: 'Property inspection for Unit 102 has been completed by Agent Smith. Report is available for review.',
          type: 'success',
          priority: 'low',
          target_audience: 'property_owners',
          send_email: true,
          send_sms: false,
          scheduled_time: '2024-10-21T16:30:00Z',
          is_active: true,
          status: 'sent',
          created_at: '2024-10-21T16:15:00Z',
          sent_at: '2024-10-21T16:30:00Z',
          read_count: 2,
          total_recipients: 3
        },
        {
          id: 5,
          title: 'System Security Alert',
          message: 'Multiple failed login attempts detected from IP 192.168.1.200. Security measures have been activated.',
          type: 'error',
          priority: 'high',
          target_audience: 'admins',
          send_email: true,
          send_sms: true,
          scheduled_time: '2024-10-21T18:00:00Z',
          is_active: true,
          status: 'sent',
          created_at: '2024-10-21T17:45:00Z',
          sent_at: '2024-10-21T18:00:00Z',
          read_count: 1,
          total_recipients: 2
        },
        {
          id: 6,
          title: 'Monthly Report Ready',
          message: 'Monthly financial report for October 2024 is ready for review. Revenue: $45,000, Expenses: $12,000.',
          type: 'info',
          priority: 'medium',
          target_audience: 'admins',
          send_email: true,
          send_sms: false,
          scheduled_time: '2024-10-22T09:00:00Z',
          is_active: true,
          status: 'scheduled',
          created_at: '2024-10-21T20:00:00Z',
          sent_at: null,
          read_count: 0,
          total_recipients: 2
        }
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleOpenDialog = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        target_audience: notification.target_audience,
        send_email: notification.send_email,
        send_sms: notification.send_sms,
        scheduled_time: notification.scheduled_time,
        is_active: notification.is_active
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        target_audience: 'all',
        send_email: false,
        send_sms: false,
        scheduled_time: '',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNotification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotification) {
        // Update notification
        console.log('Updating notification:', formData);
        // TODO: Implement update API call
      } else {
        // Create notification
        console.log('Creating notification:', formData);
        // TODO: Implement create API call
      }
      handleCloseDialog();
      loadNotifications();
    } catch (err) {
      setError('Failed to save notification');
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        console.log('Deleting notification:', notificationId);
        // TODO: Implement delete API call
        loadNotifications();
      } catch (err) {
        setError('Failed to delete notification');
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      // TODO: Implement mark as read API call
      loadNotifications();
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'info';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <InfoIcon />;
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'scheduled': return 'info';
      case 'failed': return 'error';
      case 'draft': return 'default';
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
        <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Notifications Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage system notifications, alerts, and communications to users across the platform.
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
                  <NotificationsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{notifications.length}</Typography>
                  <Typography color="text.secondary">Total Notifications</Typography>
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
                    {notifications.filter(n => n.status === 'sent').length}
                  </Typography>
                  <Typography color="text.secondary">Sent</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {notifications.filter(n => n.status === 'scheduled').length}
                  </Typography>
                  <Typography color="text.secondary">Scheduled</Typography>
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
                    {notifications.filter(n => n.priority === 'high').length}
                  </Typography>
                  <Typography color="text.secondary">High Priority</Typography>
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Create Notification
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications ({filteredNotifications.length} results)
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Notification</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notification.message.length > 100 
                            ? notification.message.substring(0, 100) + '...' 
                            : notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Created: {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getTypeIcon(notification.type)}
                        label={notification.type} 
                        color={getTypeColor(notification.type)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.priority} 
                        color={getPriorityColor(notification.priority)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {notification.target_audience}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.total_recipients} recipients
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.status} 
                        color={getStatusColor(notification.status)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notification.send_email && (
                          <Chip 
                            icon={<EmailIcon />}
                            label="Email" 
                            size="small" 
                            color="primary"
                          />
                        )}
                        {notification.send_sms && (
                          <Chip 
                            icon={<SmsIcon />}
                            label="SMS" 
                            size="small" 
                            color="secondary"
                          />
                        )}
                      </Box>
                      {notification.sent_at && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Sent: {new Date(notification.sent_at).toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Notification">
                        <IconButton size="small" onClick={() => handleOpenDialog(notification)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mark as Read">
                        <IconButton size="small" onClick={() => markAsRead(notification.id)}>
                          <MarkAsReadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Notification">
                        <IconButton size="small" color="error" onClick={() => handleDelete(notification.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Notification Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNotification ? 'Edit Notification' : 'Create New Notification'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notification Title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="admins">Admins Only</MenuItem>
                    <MenuItem value="property_owners">Property Owners</MenuItem>
                    <MenuItem value="tenants">Tenants Only</MenuItem>
                    <MenuItem value="agents">Agents Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Scheduled Time"
                  name="scheduled_time"
                  type="datetime-local"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.send_email}
                        onChange={(e) => setFormData({...formData, send_email: e.target.checked})}
                      />
                    }
                    label="Send Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.send_sms}
                        onChange={(e) => setFormData({...formData, send_sms: e.target.checked})}
                      />
                    }
                    label="Send SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      />
                    }
                    label="Active"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingNotification ? 'Update' : 'Create'} Notification
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;
