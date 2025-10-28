import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Payment,
  AttachMoney,
  CheckCircle,
  Schedule,
  Warning,
  Visibility,
  FilterList,
  ElectricalServices,
} from '@mui/icons-material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  fetchPayments,
  createPayment,
  updatePayment,
  markPaymentAsPaid,
  deletePayment,
  clearPaymentError,
} from '../../store/slices/otherSlices';
import { fetchUnits } from '../../store/slices/unitSlice';
import { paymentAPI } from '../../services/api/paymentAPI';
import { utilityAPI } from '../../services/api/utilityAPI';

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, isLoading, error } = useSelector((state) => state.payments);
  const { units } = useSelector((state) => state.units);
  const { user } = useSelector((state) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [utilityPayments, setUtilityPayments] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [unitUtilities, setUnitUtilities] = useState([]);
  const [formData, setFormData] = useState({
    unit_id: '',
    payer_id: '',
    lease_id: '',
    amount: '',
    payment_type: 'rent',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchUnits());
    loadUtilityPayments();
    loadUtilities();
  }, [dispatch]);

  const loadUtilityPayments = async () => {
    try {
      const response = await paymentAPI.getUtilityPayments();
      setUtilityPayments(response.data);
    } catch (error) {
      console.error('Error loading utility payments:', error);
    }
  };

  const loadUtilities = async () => {
    try {
      const [utilitiesResponse, unitUtilitiesResponse] = await Promise.all([
        utilityAPI.getUtilities(),
        utilityAPI.getUnitUtilities()
      ]);
      setUtilities(utilitiesResponse.data);
      setUnitUtilities(unitUtilitiesResponse.data);
    } catch (error) {
      console.error('Error loading utilities:', error);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearPaymentError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        unit_id: payment.unit_id || '',
        payer_id: payment.payer_id || '',
        lease_id: payment.lease_id || '',
        amount: payment.amount || '',
        payment_type: payment.payment_type || 'rent',
        payment_method: payment.payment_method || 'bank_transfer',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
        status: payment.status || 'pending',
        notes: payment.notes || '',
      });
    } else {
      setEditingPayment(null);
      setFormData({
        unit_id: '',
        payer_id: '',
        lease_id: '',
        amount: '',
        payment_type: 'rent',
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPayment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };
    
    if (editingPayment) {
      await dispatch(updatePayment({ paymentId: editingPayment.id, paymentData: submitData }));
    } else {
      await dispatch(createPayment(submitData));
    }
    
    handleCloseDialog();
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      await dispatch(deletePayment(paymentId));
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
    await dispatch(markPaymentAsPaid(paymentId));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'error',
      partial: 'info',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      paid: <CheckCircle />,
      overdue: <Warning />,
      partial: <Payment />,
    };
    return icons[status] || <Payment />;
  };

  const getPaymentTypeColor = (type) => {
    const colors = {
      rent: 'primary',
      deposit: 'secondary',
      utility: 'info',
      maintenance: 'warning',
      penalty: 'error',
    };
    return colors[type] || 'default';
  };

  const filteredPayments = payments.filter(payment => {
    switch (activeTab) {
      case 0: return true; // All
      case 1: return payment.status === 'pending';
      case 2: return payment.status === 'paid';
      case 3: return payment.status === 'overdue';
      case 4: return payment.payment_type === 'utility'; // Utility payments
      default: return true;
    }
  });

  // For utility payments tab, show utility payments instead of regular payments
  const displayPayments = activeTab === 4 ? utilityPayments : filteredPayments;

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'unit_number', headerName: 'Unit', width: 100 },
    { field: 'payer_name', headerName: 'Payer', width: 150 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          ${params.value}
        </Typography>
      ),
    },
    {
      field: 'payment_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPaymentTypeColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'payment_method',
      headerName: 'Method',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? params.value.replace('_', ' ') : 'N/A'}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'payment_date',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row)}
        />,
        ...(params.row.status === 'pending' ? [
          <GridActionsCellItem
            icon={<CheckCircle />}
            label="Mark as Paid"
            onClick={() => handleMarkAsPaid(params.id)}
            showInMenu
          />
        ] : []),
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
          showInMenu
        />,
      ],
    },
  ];

  if (isLoading && payments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Payment Management
        </Typography>
        <Tooltip title="Add New Payment">
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => handleOpenDialog()}
            sx={{ boxShadow: 2 }}
          >
            <Add />
          </Fab>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      {/* Payment Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Badge badgeContent={payments.length} color="primary">
                All Payments
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={payments.filter(p => p.status === 'pending').length} color="warning">
                Pending
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={payments.filter(p => p.status === 'paid').length} color="success">
                Paid
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={payments.filter(p => p.status === 'overdue').length} color="error">
                Overdue
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={utilityPayments.length} color="info">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ElectricalServices />
                  Utilities
                </Box>
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Payment Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From paid payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                ${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting payment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Overdue
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                ${payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Past due date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Collection Rate
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Grid View */}
      

      {/* Data Grid View */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={displayPayments}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
          loading={isLoading}
          disableSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? 'Edit Payment' : 'Add New Payment'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit_id"
                    value={formData.unit_id}
                    onChange={handleInputChange}
                    label="Unit"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        Unit #{unit.unit_number} - {unit.property_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payer ID"
                  name="payer_id"
                  value={formData.payer_id}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lease ID"
                  name="lease_id"
                  value={formData.lease_id}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleInputChange}
                    label="Payment Type"
                  >
                    <MenuItem value="rent">Rent</MenuItem>
                    <MenuItem value="deposit">Deposit</MenuItem>
                    <MenuItem value="utility">Utility</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="penalty">Penalty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    label="Payment Method"
                  >
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                    <MenuItem value="online">Online Payment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  name="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="partial">Partial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : (editingPayment ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Payments;

