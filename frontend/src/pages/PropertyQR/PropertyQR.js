import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { propertyAPI } from '../../services/api/propertyAPI';

const PropertyQR = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);

  const [selectedProperty, setSelectedProperty] = useState('');
  const [propertyQR, setPropertyQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configData, setConfigData] = useState({
    mtn_mobile_money_number: '',
    airtel_money_number: ''
  });

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProperty) {
      const property = properties.find(p => p.id === parseInt(selectedProperty));
      if (property) {
        setConfigData({
          mtn_mobile_money_number: property.mtn_mobile_money_number || '',
          airtel_money_number: property.airtel_money_number || ''
        });
        // Check if property has QR code
        checkPropertyQR(property.id);
      }
    }
  }, [selectedProperty, properties]);

  const checkPropertyQR = async (propertyId) => {
    try {
      // This would check if property already has a QR code
      // For now, we'll assume no existing QR code
      setPropertyQR(null);
    } catch (error) {
      console.error('Error checking property QR:', error);
    }
  };

  const handlePropertyChange = (event) => {
    setSelectedProperty(event.target.value);
    setPropertyQR(null);
    setError(null);
    setSuccess(null);
  };

  const handleConfigChange = (field) => (event) => {
    setConfigData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveConfig = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      await propertyAPI.updateProperty(selectedProperty, configData);
      setSuccess('Mobile money numbers updated successfully!');
      setConfigDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate QR code for the property
      const response = await propertyAPI.generatePropertyQR(selectedProperty);
      
      setPropertyQR(response.data);
      setSuccess('Property QR code generated successfully!');
      setQrDialogOpen(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshQR = async () => {
    if (!selectedProperty) return;
    await handleGenerateQR();
  };

  const downloadQRCode = () => {
    if (propertyQR?.qr_image) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${propertyQR.qr_image}`;
      link.download = `property-${selectedProperty}-qr-code.png`;
      link.click();
    }
  };

  const printQRCode = () => {
    if (propertyQR?.qr_image) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>Property QR Code</title></head>
          <body style="text-align: center; padding: 20px;">
            <h2>Property QR Code</h2>
            <img src="data:image/png;base64,${propertyQR.qr_image}" style="max-width: 300px;" />
            <p><strong>Property:</strong> ${properties.find(p => p.id === parseInt(selectedProperty))?.name}</p>
            <p><strong>Scan to pay rent and utilities</strong></p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const selectedPropertyData = properties.find(p => p.id === parseInt(selectedProperty));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Property QR Code Management
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Generate a single QR code for your property that tenants can scan to pay rent and utilities for their specific units.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Property Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Property
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Property</InputLabel>
                <Select
                  value={selectedProperty}
                  onChange={handlePropertyChange}
                  label="Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedPropertyData && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Property Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedPropertyData.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {selectedPropertyData.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Units:</strong> {selectedPropertyData.total_units}
                  </Typography>
                  <Typography variant="body2">
                    <strong>MTN Number:</strong> {selectedPropertyData.mtn_mobile_money_number || 'Not configured'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Airtel Number:</strong> {selectedPropertyData.airtel_money_number || 'Not configured'}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                QR Code Management
              </Typography>

              {selectedProperty ? (
                <Box>
                  {propertyQR ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        QR code is active for this property
                      </Alert>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<QrCodeIcon />}
                          onClick={() => setQrDialogOpen(true)}
                        >
                          View QR Code
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={handleRefreshQR}
                          disabled={loading}
                        >
                          Refresh
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No QR code generated for this property
                      </Alert>
                      
                      <Button
                        variant="contained"
                        startIcon={<QrCodeIcon />}
                        onClick={handleGenerateQR}
                        disabled={loading}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        {loading ? 'Generating...' : 'Generate Property QR Code'}
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setConfigDialogOpen(true)}
                    fullWidth
                  >
                    Configure Mobile Money Numbers
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">
                  Please select a property to manage its QR code
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <QrCodeIcon sx={{ mr: 1 }} />
            Property QR Code
          </Box>
        </DialogTitle>
        <DialogContent>
          {propertyQR && (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <img
                  src={`data:image/png;base64,${propertyQR.qr_image}`}
                  alt="Property QR Code"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
              
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Property Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Property:</strong> {selectedPropertyData?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {selectedPropertyData?.address}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment URL:</strong> {propertyQR.payment_url}
                </Typography>
              </Paper>

              <Alert severity="info" sx={{ textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>How it works:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  1. Tenants scan this QR code with their phone
                </Typography>
                <Typography variant="body2" component="div">
                  2. They select their unit and enter payment details
                </Typography>
                <Typography variant="body2" component="div">
                  3. Payment is processed via mobile money
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadQRCode} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={printQRCode} startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button onClick={() => setQrDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Configure Mobile Money Numbers
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="MTN Mobile Money Number"
              value={configData.mtn_mobile_money_number}
              onChange={handleConfigChange('mtn_mobile_money_number')}
              sx={{ mb: 2 }}
              placeholder="e.g., 256700000000"
            />
            
            <TextField
              fullWidth
              label="Airtel Money Number"
              value={configData.airtel_money_number}
              onChange={handleConfigChange('airtel_money_number')}
              placeholder="e.g., 256700000000"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveConfig} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyQR;
