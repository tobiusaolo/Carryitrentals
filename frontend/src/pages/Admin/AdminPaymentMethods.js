import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
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
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { adminConfirm } from '../../components/Admin/AdminConfirmDialog';
import paymentMethodAPI from '../../services/api/paymentMethodAPI';
import { adminPrimaryButtonSx } from '../../theme/designTokens';

const AdminPaymentMethods = () => {
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
    setError(null);
    try {
      const { data } = await paymentMethodAPI.list(0, 200);
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load payment methods');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...formData,
        bank_name: formData.type === 'bank_account' ? formData.bank_name : null,
        bank_code: formData.type === 'bank_account' ? formData.bank_code : null,
      };
      if (editingMethod) {
        await paymentMethodAPI.update(editingMethod.id, payload);
      } else {
        await paymentMethodAPI.create(payload);
      }
      handleCloseDialog();
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (methodId) => {
    const ok = await adminConfirm('Delete payment method?', 'This cannot be undone.');
    if (!ok) return;
    try {
      setLoading(true);
      await paymentMethodAPI.remove(methodId);
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (method) => {
    try {
      setLoading(true);
      await paymentMethodAPI.update(method.id, { is_active: !method.is_active });
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update payment method status');
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

  const paymentMethodColumns = [
    {
      id: 'name',
      label: 'Payment Method',
      getSearchValue: (row) => `${row.name} ${row.account_name}`,
      render: (method) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: getPaymentMethodColor(method.type) }}>
            {getPaymentMethodIcon(method.type)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{method.name}</Typography>
            <Typography variant="caption" color="text.secondary">{method.account_name}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      getSearchValue: (row) => getTypeLabel(row.type),
      render: (method) => (
        <Chip label={getTypeLabel(method.type)} color="primary" size="small" />
      ),
    },
    {
      id: 'account_number',
      label: 'Account Details',
      getSearchValue: (row) => `${row.account_number} ${row.bank_name || ''}`,
      render: (method) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">{method.account_number}</Typography>
          {method.bank_name && (
            <Typography variant="caption" color="text.secondary">{method.bank_name}</Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      render: (method) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={method.is_active}
            onChange={() => handleToggleActive(method)}
            size="small"
            disabled={loading}
          />
          <AdminStatusChip status={method.is_active ? 'active' : 'inactive'} label={method.is_active ? 'Active' : 'Inactive'} />
        </Box>
      ),
    },
    {
      id: 'created_at',
      label: 'Created',
      render: (method) => (
        <Typography variant="body2" color="text.secondary">
          {method.created_at ? new Date(method.created_at).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (method) => (
        <TableActions
          actions={[
            { icon: <EditIcon fontSize="small" />, label: 'Edit Payment Method', onClick: () => handleOpenDialog(method) },
            { icon: <DeleteIcon fontSize="small" />, label: 'Delete Payment Method', onClick: () => handleDelete(method.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Payment methods"
        subtitle="Guest payment options"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={adminPrimaryButtonSx}>
            Add payment method
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={paymentMethodColumns}
        rows={paymentMethods}
        loading={loading}
        getRowId={(row) => String(row.id)}
        title="Payment methods"
        subtitle="Mobile money and bank accounts shown on viewing-fee checkout"
        emptyTitle="No payment methods"
        emptyDescription="Add a payment method so prospects can pay viewing fees manually."
        emptyIcon={PaymentIcon}
        emptyActionLabel="Add payment method"
        onEmptyAction={() => handleOpenDialog()}
        searchPlaceholder="Search by name, account, or bank…"
      />

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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    label="Payment Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  name="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Code"
                      name="bank_code"
                      value={formData.bank_code}
                      onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading} sx={adminPrimaryButtonSx}>
              {loading ? <CircularProgress size={20} /> : (editingMethod ? 'Update' : 'Add')} payment method
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AdminPage>
  );
};

export default AdminPaymentMethods;
