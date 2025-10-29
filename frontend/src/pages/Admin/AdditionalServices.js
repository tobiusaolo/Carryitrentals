import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as MovingIcon,
  Inventory as PackagingIcon,
  CleaningServices as CleaningIcon
} from '@mui/icons-material';
import axios from 'axios';
import additionalServicesAPI from '../../services/api/additionalServicesAPI';

const AdditionalServices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await additionalServicesAPI.getAllServices();
      setServices(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load additional services');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        is_active: service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      is_active: true
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingService) {
        await additionalServicesAPI.updateService(editingService.id, formData);
      } else {
        await additionalServicesAPI.createService(formData);
      }

      setSuccess(editingService ? 'Service updated successfully' : 'Service created successfully');
      handleCloseDialog();
      loadServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.detail || 'Failed to save service');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await additionalServicesAPI.deleteService(serviceId);

      setSuccess('Service deleted successfully');
      loadServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
      setTimeout(() => setError(null), 5000);
    }
  };

  const getServiceIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('moving')) return <MovingIcon />;
    if (lowerName.includes('packaging')) return <PackagingIcon />;
    if (lowerName.includes('cleaning')) return <CleaningIcon />;
    return <AddIcon />;
  };

  if (loading && services.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Additional Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Add Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price (UGX)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No additional services found. Click "Add Service" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(service.name)}
                          <Typography variant="body2" fontWeight={600}>
                            {service.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {service.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {parseInt(service.price).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.is_active ? 'Active' : 'Inactive'}
                          color={service.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(service)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(service.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Moving, Packaging, Cleaning"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Price (UGX)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 50000"
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.price}
            sx={{ textTransform: 'none' }}
          >
            {editingService ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdditionalServices;

