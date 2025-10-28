import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Phone,
  CreditCard,
  Notifications,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    mtn_mobile_money_number: '+256700000000',
    airtel_money_number: '+256750000000',
    payment_merchant_name: 'CarryIT Property Manager',
    enable_sms_notifications: 'true',
    prepayment_percentage: '50'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://carryit-backend.onrender.com/api/v1/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        // Convert array of settings to object
        const settingsObj = {};
        response.data.forEach(setting => {
          settingsObj[setting.setting_key] = setting.setting_value;
        });
        setSettings(settingsObj);
        setInitialized(true);
      } else {
        // No settings found, need to initialize
        setInitialized(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      if (error.response?.status === 404 || error.response?.data?.detail?.includes('not found')) {
        setInitialized(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://carryit-backend.onrender.com/api/v1/admin/settings/initialize-defaults',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      showAlert('success', 'Default settings initialized successfully!');
      await loadSettings();
    } catch (error) {
      console.error('Error initializing settings:', error);
      showAlert('error', error.response?.data?.detail || 'Failed to initialize settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://carryit-backend.onrender.com/api/v1/admin/settings/bulk-update',
        settings,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      showAlert('success', 'Settings saved successfully!');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!initialized) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure payment numbers and system preferences
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <SettingsIcon sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Settings Not Initialized
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Click the button below to initialize default system settings including mobile money payment numbers.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={initializeDefaults}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5
            }}
          >
            {saving ? 'Initializing...' : 'Initialize Default Settings'}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure mobile money payment numbers and system preferences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Settings">
            <IconButton onClick={loadSettings} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Mobile Money Settings */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, border: '2px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Phone sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Mobile Money Payment Numbers
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Configure the mobile money numbers that will receive payments from customers
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="MTN Mobile Money Number"
                    value={settings.mtn_mobile_money_number || ''}
                    onChange={(e) => handleChange('mtn_mobile_money_number', e.target.value)}
                    placeholder="+256700000000"
                    helperText="This number will receive MTN Mobile Money payments"
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ 
                          bgcolor: '#FFEB3B', 
                          color: '#000', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          mr: 1,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          MTN
                        </Box>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Airtel Money Number"
                    value={settings.airtel_money_number || ''}
                    onChange={(e) => handleChange('airtel_money_number', e.target.value)}
                    placeholder="+256750000000"
                    helperText="This number will receive Airtel Money payments"
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ 
                          bgcolor: '#FF0000', 
                          color: '#fff', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          mr: 1,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          AIRTEL
                        </Box>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Make sure these mobile money numbers are registered and active. 
                  Customers will be prompted to send payments to these numbers when booking Airbnb properties or making other payments.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '2px solid #e0e0e0', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CreditCard sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Payment Settings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Configure payment-related settings
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Merchant Name"
                value={settings.payment_merchant_name || ''}
                onChange={(e) => handleChange('payment_merchant_name', e.target.value)}
                placeholder="CarryIT Property Manager"
                helperText="Name displayed to customers during payment"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Prepayment Percentage"
                type="number"
                value={settings.prepayment_percentage || '50'}
                onChange={(e) => handleChange('prepayment_percentage', e.target.value)}
                placeholder="50"
                helperText="Default percentage required as prepayment (e.g., 50 for 50%)"
                InputProps={{
                  endAdornment: <Typography sx={{ color: 'text.secondary', ml: 1 }}>%</Typography>
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '2px solid #e0e0e0', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Notification Settings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Configure notification preferences
                  </Typography>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enable_sms_notifications === 'true'}
                    onChange={(e) => handleChange('enable_sms_notifications', e.target.checked ? 'true' : 'false')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      SMS Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Send SMS confirmations for bookings and payments
                    </Typography>
                  </Box>
                }
              />

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  SMS notifications use Africa's Talking API. Make sure your account has sufficient credits.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Information Section */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5', borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          ℹ️ How Mobile Money Payments Work
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          When customers book an Airbnb property, they can choose to pay via MTN Mobile Money or Airtel Money. 
          The system will prompt them to send the payment to the corresponding number you've configured above.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Payment Flow:</strong>
        </Typography>
        <Box component="ol" sx={{ pl: 3, mt: 1 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            Customer selects payment method (MTN or Airtel)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            System sends payment request to customer's phone
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Customer approves payment on their mobile money app
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Payment is sent to your configured mobile money number
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            System confirms booking and sends SMS confirmation
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminSettings;

