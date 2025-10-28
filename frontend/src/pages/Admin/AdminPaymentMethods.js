import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  Switch,
  FormControlLabel,
  Grid,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

const AdminPaymentMethods = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    account_number: '',
    account_name: '',
    bank_name: '',
    bank_code: '',
    is_active: true
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockPaymentMethods = [
        { 
          id: 1, 
          name: 'MTN Mobile Money', 
          type: 'mtn_mobile_money',
          account_number: '256700000000',
          account_name: 'Admin MTN',
          bank_name: null,
          bank_code: null,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z'
        },
        { 
          id: 2, 
          name: 'Airtel Money', 
          type: 'airtel_money',
          account_number: '256700000001',
          account_name: 'Admin Airtel',
          bank_name: null,
          bank_code: null,
          is_active: true,
          created_at: '2024-01-15T10:30:00Z'
        },
        { 
          id: 3, 
          name: 'Bank Account', 
          type: 'bank_account',
          account_number: '1234567890',
          account_name: 'Admin Bank Account',
          bank_name: 'Example Bank',
          bank_code: '001',
          is_active: true,
          created_at: '2024-01-15T11:00:00Z'
        }
      ];
      setPaymentMethods(mockPaymentMethods);
    } catch (err) {
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        type: method.type,
        account_number: method.account_number,
        account_name: method.account_name,
        bank_name: method.bank_name || '',
        bank_code: method.bank_code || '',
        is_active: method.is_active
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        type: '',
        account_number: '',
        account_name: '',
        bank_name: '',
        bank_code: '',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMethod(null);
    setFormData({
      name: '',
      type: '',
      account_number: '',
      account_name: '',
      bank_name: '',
      bank_code: '',
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingMethod) {
        // Update existing payment method
        const updatedMethods = paymentMethods.map(method => 
          method.id === editingMethod.id 
            ? { ...method, ...formData }
            : method
        );
        setPaymentMethods(updatedMethods);
      } else {
        // Add new payment method
        const newMethod = {
          id: Date.now(), // Mock ID
          ...formData,
          created_at: new Date().toISOString()
        };
        setPaymentMethods([...paymentMethods, newMethod]);
      }
      
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        setLoading(true);
        const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
        setPaymentMethods(updatedMethods);
      } catch (err) {
        setError('Failed to delete payment method');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (methodId) => {
    try {
      setLoading(true);
      const updatedMethods = paymentMethods.map(method => 
        method.id === methodId 
          ? { ...method, is_active: !method.is_active }
          : method
      );
      setPaymentMethods(updatedMethods);
    } catch (err) {
      setError('Failed to update payment method status');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'mtn_mobile_money':
      case 'airtel_money':
        return <PhoneIcon />;
      case 'bank_account':
        return <BankIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const getPaymentMethodColor = (type) => {
    switch (type) {
      case 'mtn_mobile_money':
        return '#FFD700';
      case 'airtel_money':
        return '#E60012';
      case 'bank_account':
        return '#1976D2';
      default:
        return '#666';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'mtn_mobile_money':
        return 'MTN Mobile Money';
      case 'airtel_money':
        return 'Airtel Money';
      case 'bank_account':
        return 'Bank Account';
      default:
        return type;
    }
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Payment Methods Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Payment Method
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Account Details</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: getPaymentMethodColor(method.type) }}>
                          {getPaymentMethodIcon(method.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {method.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {method.account_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getTypeLabel(method.type)} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {method.account_number}
                        </Typography>
                        {method.bank_name && (
                          <Typography variant="caption" color="text.secondary">
                            {method.bank_name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={method.is_active}
                          onChange={() => handleToggleActive(method.id)}
                          size="small"
                        />
                        <Chip 
                          label={method.is_active ? 'Active' : 'Inactive'} 
                          color={method.is_active ? 'success' : 'default'} 
                          size="small" 
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(method.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit Payment Method">
                          <IconButton size="small" onClick={() => handleOpenDialog(method)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Payment Method">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDelete(method.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Method Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <MenuItem value="mtn_mobile_money">MTN Mobile Money</MenuItem>
                    <MenuItem value="airtel_money">Airtel Money</MenuItem>
                    <MenuItem value="bank_account">Bank Account</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={formData.type === 'bank_account' ? 'Account Number' : 'Phone Number'}
                  name="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  name="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  required
                />
              </Grid>
              {formData.type === 'bank_account' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Code"
                      name="bank_code"
                      value={formData.bank_code}
                      onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : (editingMethod ? 'Update' : 'Add')} Payment Method
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminPaymentMethods;
