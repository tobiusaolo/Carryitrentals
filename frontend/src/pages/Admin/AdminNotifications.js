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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
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
import notificationAPI from '../../services/api/notificationAPI';
import authService from '../../services/authService';
import DataTable from '../../components/UI/DataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import TableActions from '../../components/UI/TableActions';

const AdminNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notification_type: 'info',
    user_id: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadNotifications();
    }
  }, [user]);

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];
    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.notification_type === typeFilter);
    }
    if (statusFilter === 'read') {
      filtered = filtered.filter((n) => n.is_read === true);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter((n) => n.is_read === false);
    }
    return filtered;
  }, [notifications, typeFilter, statusFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = authService.createAxiosInstance();
      const response = await api.get('/notifications/all');
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (notification) => {
    try {
      const api = authService.createAxiosInstance();
      const response = await api.get(`/notifications/${notification.id}`);
      const notificationData = response.data;
      setViewingNotification(notificationData);
      setOpenViewDialog(true);
      
      // Automatically mark as read when viewing (if not already read)
      if (!notificationData.is_read) {
        try {
          await api.post(`/notifications/${notificationData.id}/mark-read`);
          // Update the notification in the list immediately
          setNotifications(prevNotifications =>
            prevNotifications.map(n =>
              n.id === notificationData.id ? { ...n, is_read: true } : n
            )
          );
          // Update the viewing notification state
          setViewingNotification(prev => prev ? { ...prev, is_read: true } : null);
          
          // Refresh unread count in navbar if available
          if (typeof window !== 'undefined' && window.refreshNotificationCount) {
            window.refreshNotificationCount();
          }
        } catch (markReadErr) {
          console.error('Error marking notification as read:', markReadErr);
          // Don't show error to user, just log it
        }
      }
    } catch (err) {
      console.error('Error loading notification:', err);
      setError(err.response?.data?.detail || 'Failed to load notification details');
    }
  };

  const handleOpenDialog = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        notification_type: notification.notification_type,
        user_id: notification.user_id,
        is_read: notification.is_read
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        notification_type: 'info',
        user_id: user?.id || '',
        is_read: false
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
    setLoading(true);
    setError(null);
    try {
      const api = authService.createAxiosInstance();
      if (editingNotification) {
        // Update notification
        await api.put(`/notifications/${editingNotification.id}`, {
          is_read: formData.is_read !== undefined ? formData.is_read : editingNotification.is_read
        });
      } else {
        // Create notification
        await api.post('/notifications/', {
          title: formData.title,
          message: formData.message,
          notification_type: formData.notification_type,
          user_id: formData.user_id,
          is_read: false
        });
      }
      handleCloseDialog();
      setTimeout(() => loadNotifications(), 300);
    } catch (err) {
      console.error('Error saving notification:', err);
      setError(err.response?.data?.detail || 'Failed to save notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setLoading(true);
      setError(null);
      try {
        const api = authService.createAxiosInstance();
        await api.delete(`/notifications/${notificationId}`);
        setTimeout(() => loadNotifications(), 300);
      } catch (err) {
        console.error('Error deleting notification:', err);
        setError(err.response?.data?.detail || 'Failed to delete notification');
      } finally {
        setLoading(false);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const api = authService.createAxiosInstance();
      await api.post(`/notifications/${notificationId}/mark-read`);
      setTimeout(() => loadNotifications(), 300);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.response?.data?.detail || 'Failed to mark notification as read');
    } finally {
      setLoading(false);
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

  const notificationColumns = [
    {
      id: 'title',
      label: 'Notification',
      getSearchValue: (row) => `${row.title || ''} ${row.message || ''}`,
      render: (notification) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {notification.title || 'No Title'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {notification.message && notification.message.length > 100
              ? `${notification.message.substring(0, 100)}...`
              : notification.message || 'No message'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'notification_type',
      label: 'Type',
      render: (notification) => (
        <Chip
          icon={getTypeIcon(notification.notification_type)}
          label={notification.notification_type || 'info'}
          color={getTypeColor(notification.notification_type)}
          size="small"
        />
      ),
    },
    {
      id: 'is_read',
      label: 'Read Status',
      render: (notification) => (
        <OwnerStatusChip
          status={notification.is_read ? 'completed' : 'pending'}
          label={notification.is_read ? 'Read' : 'Unread'}
        />
      ),
    },
    {
      id: 'user_id',
      label: 'User ID',
      getSearchValue: (row) => String(row.user_id || ''),
      render: (notification) => (
        <Typography variant="body2">{notification.user_id || 'N/A'}</Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Created',
      render: (notification) => (
        <Typography variant="caption" color="text.secondary">
          {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (notification) => (
        <TableActions
          actions={[
            { icon: <ViewIcon fontSize="small" />, label: 'View Details', onClick: () => handleView(notification) },
            { icon: <EditIcon fontSize="small" />, label: 'Edit Notification', onClick: () => handleOpenDialog(notification) },
            {
              icon: <MarkAsReadIcon fontSize="small" />,
              label: 'Mark as Read',
              onClick: () => markAsRead(notification.id),
              hidden: notification.is_read,
            },
            { icon: <DeleteIcon fontSize="small" />, label: 'Delete Notification', onClick: () => handleDelete(notification.id) },
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
                    {notifications.filter(n => n.is_read === true).length}
                  </Typography>
                  <Typography color="text.secondary">Read</Typography>
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
                    {notifications.filter(n => n.is_read === false).length}
                  </Typography>
                  <Typography color="text.secondary">Unread</Typography>
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
                    {notifications.filter(n => n.notification_type === 'error' || n.notification_type === 'warning').length}
                  </Typography>
                  <Typography color="text.secondary">Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        columns={notificationColumns}
        rows={filteredNotifications}
        loading={loading}
        title="Notifications"
        subtitle={`${filteredNotifications.length} shown · ${notifications.length} total`}
        emptyTitle="No notifications found"
        emptyDescription="Create a notification to alert users across the platform."
        emptyIcon={NotificationsIcon}
        emptyActionLabel="Create Notification"
        onEmptyAction={() => handleOpenDialog()}
        searchPlaceholder="Search by title or message…"
        toolbar={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="payment_due">Payment Due</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="lease_expiry">Lease Expiry</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Create Notification
            </Button>
          </Box>
        }
      />

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
                    name="notification_type"
                    value={formData.notification_type}
                    onChange={(e) => setFormData({...formData, notification_type: e.target.value})}
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="payment_due">Payment Due</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="lease_expiry">Lease Expiry</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="User ID"
                  name="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  required
                  helperText="Enter the user ID to send notification to"
                />
              </Grid>
              {editingNotification && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_read || false}
                        onChange={(e) => setFormData({...formData, is_read: e.target.checked})}
                      />
                    }
                    label="Mark as Read"
                  />
                </Grid>
              )}
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

      {/* View Notification Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewingNotification && getTypeIcon(viewingNotification.notification_type)}
            <Typography variant="h6">Notification Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingNotification && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, mb: 2 }}>
                    {viewingNotification.title}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, mb: 2 }}>
                    {viewingNotification.message}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip 
                    icon={getTypeIcon(viewingNotification.notification_type)}
                    label={viewingNotification.notification_type} 
                    color={getTypeColor(viewingNotification.notification_type)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={viewingNotification.is_read ? 'Read' : 'Unread'} 
                    color={viewingNotification.is_read ? 'success' : 'warning'}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {viewingNotification.user_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {viewingNotification.created_at 
                      ? new Date(viewingNotification.created_at).toLocaleString() 
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {viewingNotification && (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => {
                setOpenViewDialog(false);
                handleOpenDialog(viewingNotification);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;
