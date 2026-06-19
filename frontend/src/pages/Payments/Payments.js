import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
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
  Tabs,
  Tab,
  Badge,
  Divider,
  Tooltip,
  LinearProgress,
  IconButton,
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
  Close,
  Refresh,
  HourglassTop,
} from '@mui/icons-material';
import {
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
import { paymentIntentAPI } from '../../services/api/subscriptionAPI';
import PageHeader from '../../components/UI/PageHeader';
import { ownerPrimaryButtonSx, colors } from '../../theme/designTokens';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerDataGrid from '../../components/Owner/OwnerDataGrid';
import { formatMoney } from '../../utils/formatMoney';

// ─── Pending Rent Proof Card ───────────────────────────────────────────────
function PendingProofCard({ intent, onApprove, onReject, acting }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleReject = async () => {
    await onReject(intent.id, reason);
    setRejectOpen(false);
    setReason('');
  };

  const meta = intent.metadata || {};

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: 'warning.main',
        borderWidth: 1.5,
        position: 'relative',
        bgcolor: '#fffbeb',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <HourglassTop fontSize="small" sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
              Awaiting Approval
            </Typography>
            <Chip label="Manual" size="small" sx={{ fontSize: 11, height: 20, bgcolor: '#fde68a', color: '#92400e' }} />
          </Box>
          <Typography variant="body1" fontWeight={700} sx={{ fontSize: 18, color: 'text.primary' }}>
            {formatMoney(intent.amount, intent.currency || 'UGX')}
          </Typography>
          {intent.tenant_name && (
            <Typography variant="body2" color="text.secondary">
              Tenant: <strong>{intent.tenant_name}</strong>
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Reference: <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{intent.proof_reference}</code>
          </Typography>
          {meta.months_advance && (
            <Typography variant="caption" color="text.secondary" display="block">
              Months paid: {meta.months_advance}
            </Typography>
          )}
          {intent.created_at && (
            <Typography variant="caption" color="text.secondary" display="block">
              Submitted: {new Date(intent.created_at).toLocaleString()}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 140 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={acting === intent.id + '_approve' ? <CircularProgress size={14} color="inherit" /> : <CheckCircle />}
            disabled={!!acting}
            onClick={() => onApprove(intent.id)}
            sx={{ bgcolor: colors.brand, '&:hover': { bgcolor: colors.brandDark }, fontWeight: 700, textTransform: 'none' }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={acting === intent.id + '_reject' ? <CircularProgress size={14} color="inherit" /> : <Close />}
            disabled={!!acting}
            onClick={() => setRejectOpen(true)}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Reject
          </Button>
        </Box>
      </Box>

      {/* Reject reason dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Payment Proof</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Optionally add a reason — the tenant will be notified.
          </Typography>
          <TextField
            fullWidth
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

// ─── Main Payments Page ────────────────────────────────────────────────────
const Payments = () => {
  const dispatch = useDispatch();
  const { payments, isLoading, error } = useSelector((state) => state.payments);
  const { units } = useSelector((state) => state.units);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
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

  // Pending rent proofs state
  const [pendingProofs, setPendingProofs] = useState([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [proofsError, setProofsError] = useState(null);
  const [acting, setActing] = useState(null); // intentId_action
  const [proofActionMsg, setProofActionMsg] = useState(null);

  const loadPendingProofs = useCallback(async () => {
    setProofsLoading(true);
    setProofsError(null);
    try {
      const res = await paymentIntentAPI.listPending();
      const all = Array.isArray(res.data) ? res.data : [];
      // Only show rent category proofs
      setPendingProofs(all.filter((i) => i.category === 'rent' || !i.category));
    } catch (e) {
      setProofsError('Could not load pending proofs. Check your connection.');
    } finally {
      setProofsLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchUnits());
    loadPendingProofs();
  }, [dispatch, loadPendingProofs]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearPaymentError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleApprove = async (intentId) => {
    setActing(intentId + '_approve');
    setProofActionMsg(null);
    try {
      await paymentIntentAPI.approve(intentId);
      setProofActionMsg({ type: 'success', text: 'Payment approved! The payment record has been created.' });
      await loadPendingProofs();
      dispatch(fetchPayments());
    } catch (e) {
      setProofActionMsg({ type: 'error', text: e.response?.data?.detail || 'Could not approve payment.' });
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (intentId, reason) => {
    setActing(intentId + '_reject');
    setProofActionMsg(null);
    try {
      await paymentIntentAPI.reject(intentId, reason);
      setProofActionMsg({ type: 'warning', text: 'Payment proof rejected.' });
      await loadPendingProofs();
    } catch (e) {
      setProofActionMsg({ type: 'error', text: e.response?.data?.detail || 'Could not reject payment.' });
    } finally {
      setActing(null);
    }
  };

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData, amount: parseFloat(formData.amount) };
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
    const map = { pending: 'warning', paid: 'success', overdue: 'error', partial: 'info' };
    return map[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const map = { pending: <Schedule />, paid: <CheckCircle />, overdue: <Warning />, partial: <Payment /> };
    return map[status] || <Payment />;
  };

  const getPaymentTypeColor = (type) => {
    const map = { rent: 'primary', deposit: 'secondary', utility: 'info', maintenance: 'warning', penalty: 'error' };
    return map[type] || 'default';
  };

  const filteredPayments = payments.filter((payment) => {
    switch (activeTab) {
      case 0: return true;
      case 1: return payment.status === 'pending';
      case 2: return payment.status === 'paid';
      case 3: return payment.status === 'overdue';
      default: return true;
    }
  });

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'unit_number', headerName: 'Unit', width: 100 },
    { field: 'tenant_name', headerName: 'Tenant', width: 140 },
    { field: 'payer_name', headerName: 'Payer', width: 150 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {formatMoney(params.value, 'UGX')}
        </Typography>
      ),
    },
    {
      field: 'payment_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getPaymentTypeColor(params.value)} size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'payment_method',
      headerName: 'Method',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value ? params.value.replace('_', ' ') : 'N/A'} variant="outlined" size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'payment_date',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => {
        const raw = params.value || params.row.due_date || params.row.payment_date;
        return raw ? new Date(raw).toLocaleDateString() : '—';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip icon={getStatusIcon(params.value)} label={params.value} color={getStatusColor(params.value)} size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem icon={<Visibility fontSize="small" />} label="View" onClick={() => handleOpenDialog(params.row)} showInMenu />,
        <GridActionsCellItem icon={<Edit fontSize="small" />} label="Edit" onClick={() => handleOpenDialog(params.row)} showInMenu />,
        ...(params.row.status === 'pending'
          ? [<GridActionsCellItem icon={<CheckCircle fontSize="small" />} label="Mark as Paid" onClick={() => handleMarkAsPaid(params.id)} showInMenu />]
          : []),
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.id)} showInMenu />,
      ],
    },
  ];

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Payments"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={ownerPrimaryButtonSx}>
            Add payment
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      {/* ── Pending Rent Proofs Section ───────────────── */}
      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          borderColor: pendingProofs.length > 0 ? 'warning.main' : 'divider',
          borderWidth: pendingProofs.length > 0 ? 2 : 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: pendingProofs.length > 0 ? '#fefce8' : 'background.default',
            borderBottom: '1px solid',
            borderColor: pendingProofs.length > 0 ? 'warning.light' : 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassTop sx={{ color: pendingProofs.length > 0 ? 'warning.main' : 'text.disabled' }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Pending Rent Proofs
            </Typography>
            {pendingProofs.length > 0 && (
              <Chip
                label={`${pendingProofs.length} awaiting`}
                color="warning"
                size="small"
                sx={{ fontWeight: 700, fontSize: 12 }}
              />
            )}
          </Box>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadPendingProofs} disabled={proofsLoading}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {proofsLoading && <LinearProgress color="warning" />}

        <Box sx={{ p: 2 }}>
          {proofActionMsg && (
            <Alert
              severity={proofActionMsg.type}
              onClose={() => setProofActionMsg(null)}
              sx={{ mb: 2, borderRadius: 1.5 }}
            >
              {proofActionMsg.text}
            </Alert>
          )}

          {proofsError && (
            <Alert severity="error" sx={{ mb: 2 }}>{proofsError}</Alert>
          )}

          {!proofsLoading && pendingProofs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No pending payment proofs — you're all caught up!
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pendingProofs.map((intent) => (
                <PendingProofCard
                  key={intent.id}
                  intent={intent}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  acting={acting}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* ── Payment History ───────────────────────────── */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, mt: 1 }}>
        Payment History
      </Typography>

      <Paper sx={{ mb: 3, border: `1px solid ${colors.border}`, borderRadius: 2, boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={<Badge badgeContent={payments.length} color="primary">All Payments</Badge>} />
          <Tab label={<Badge badgeContent={payments.filter((p) => p.status === 'pending').length} color="primary">Pending</Badge>} />
          <Tab label={<Badge badgeContent={payments.filter((p) => p.status === 'paid').length} color="primary">Paid</Badge>} />
          <Tab label={<Badge badgeContent={payments.filter((p) => p.status === 'overdue').length} color="primary">Overdue</Badge>} />
        </Tabs>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Collected"
            value={formatMoney(payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0), 'UGX')}
            icon={<AttachMoney />}
            variantIndex={0}
            subtitle="Paid"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Pending"
            value={formatMoney(payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0), 'UGX')}
            icon={<Schedule />}
            variantIndex={1}
            subtitle="Outstanding"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Overdue"
            value={formatMoney(payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0), 'UGX')}
            icon={<Warning />}
            variantIndex={2}
            subtitle="Late"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard
            title="Collection rate"
            value={`${payments.length > 0 ? Math.round((payments.filter((p) => p.status === 'paid').length / payments.length) * 100) : 0}%`}
            icon={<CheckCircle />}
            variantIndex={0}
            subtitle="Success rate"
          />
        </Grid>
      </Grid>

      <OwnerDataGrid
        rows={filteredPayments}
        columns={columns}
        loading={isLoading}
        emptyTitle="No payments yet"
        emptyDescription="Record rent payments to track collections."
        emptyIcon={Payment}
        emptyActionLabel="Add payment"
        onEmptyAction={() => handleOpenDialog()}
      />

      {/* Add/Edit Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPayment ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit</InputLabel>
                  <Select name="unit_id" value={formData.unit_id} onChange={handleInputChange} label="Unit">
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>Unit #{unit.unit_number} - {unit.property_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Payer ID" name="payer_id" value={formData.payer_id} onChange={handleInputChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Lease ID" name="lease_id" value={formData.lease_id} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required inputProps={{ min: 0, step: 0.01 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Type</InputLabel>
                  <Select name="payment_type" value={formData.payment_type} onChange={handleInputChange} label="Payment Type">
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
                  <Select name="payment_method" value={formData.payment_method} onChange={handleInputChange} label="Payment Method">
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                    <MenuItem value="online">Online Payment</MenuItem>
                    <MenuItem value="manual">Manual / Mobile Money</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Payment Date" name="payment_date" type="date" value={formData.payment_date} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleInputChange} label="Status">
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="partial">Partial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" name="notes" value={formData.notes} onChange={handleInputChange} multiline rows={3} />
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
    </OwnerPageContainer>
  );
};

export default Payments;
