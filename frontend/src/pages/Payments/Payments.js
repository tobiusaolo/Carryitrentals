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
  const [acting, setActing] = useState(null); // intentId_action
  const [proofActionMsg, setProofActionMsg] = useState(null);

  // Reject dialog state for inline actions
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectIntentId, setRejectIntentId] = useState(null);

  const loadPendingProofs = useCallback(async () => {
    setProofsLoading(true);
    try {
      const res = await paymentIntentAPI.listPending();
      const all = Array.isArray(res.data) ? res.data : [];
      setPendingProofs(all.filter((i) => i.category === 'rent' || !i.category));
    } catch (e) {
      console.error('Could not load pending proofs', e);
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

  const openRejectDialog = (intentId) => {
    setRejectIntentId(intentId);
    setRejectReason('');
    setRejectOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectIntentId) return;
    setActing(rejectIntentId + '_reject');
    setProofActionMsg(null);
    try {
      await paymentIntentAPI.reject(rejectIntentId, rejectReason);
      setProofActionMsg({ type: 'warning', text: 'Payment proof rejected.' });
      await loadPendingProofs();
    } catch (e) {
      setProofActionMsg({ type: 'error', text: e.response?.data?.detail || 'Could not reject payment.' });
    } finally {
      setActing(null);
      setRejectOpen(false);
      setRejectReason('');
      setRejectIntentId(null);
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
    const map = { pending: 'warning', paid: 'success', overdue: 'error', partial: 'info', awaiting_approval: 'warning' };
    return map[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const map = { pending: <Schedule />, paid: <CheckCircle />, overdue: <Warning />, partial: <Payment />, awaiting_approval: <HourglassTop /> };
    return map[status] || <Payment />;
  };

  const getPaymentTypeColor = (type) => {
    const map = { rent: 'primary', deposit: 'secondary', utility: 'info', maintenance: 'warning', penalty: 'error' };
    return map[type] || 'default';
  };

  // Merge pending proofs into the table data
  const pendingRows = pendingProofs.map(intent => {
    const meta = intent.metadata_json ? JSON.parse(intent.metadata_json) : (intent.metadata || {});
    return {
      id: intent.id,
      is_intent: true,
      unit_number: meta.unit_number || '—',
      tenant_name: intent.tenant_name || meta.tenant_name || '—',
      payer_name: intent.payer_name || '—',
      amount: intent.amount,
      payment_type: intent.category || 'rent',
      payment_method: intent.method || 'manual',
      payment_date: intent.created_at,
      status: intent.status || 'awaiting_approval',
      proof_reference: intent.proof_reference || '—',
    };
  });

  const allRows = [...pendingRows, ...payments];

  const filteredPayments = allRows.filter((row) => {
    switch (activeTab) {
      case 0: return true;
      case 1: return row.status === 'pending' || row.status === 'awaiting_approval';
      case 2: return row.status === 'paid';
      case 3: return row.status === 'overdue';
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
      headerName: 'Method / Ref',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1, pb: 1, height: '100%', justifyContent: 'center' }}>
          <Chip label={params.row.payment_method ? params.row.payment_method.replace('_', ' ') : 'N/A'} variant="outlined" size="small" sx={{ textTransform: 'capitalize', width: 'fit-content', mb: params.row.proof_reference && params.row.proof_reference !== '—' ? 0.5 : 0 }} />
          {params.row.proof_reference && params.row.proof_reference !== '—' && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>
              {params.row.proof_reference}
            </Typography>
          )}
        </Box>
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
      width: 130,
      renderCell: (params) => (
        <Chip icon={getStatusIcon(params.value)} label={params.value.replace('_', ' ')} color={getStatusColor(params.value)} size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 160,
      getActions: (params) => {
        if (params.row.is_intent) {
          return [
            <GridActionsCellItem icon={acting === params.id + '_approve' ? <CircularProgress size={14} color="inherit" /> : <CheckCircle color="success" />} label="Approve" onClick={() => handleApprove(params.id)} showInMenu={false} disabled={!!acting} />,
            <GridActionsCellItem icon={acting === params.id + '_reject' ? <CircularProgress size={14} color="inherit" /> : <Close color="error" />} label="Reject" onClick={() => openRejectDialog(params.id)} showInMenu={false} disabled={!!acting} />,
          ];
        }
        return [
          <GridActionsCellItem icon={<Visibility fontSize="small" />} label="View" onClick={() => handleOpenDialog(params.row)} showInMenu />,
          <GridActionsCellItem icon={<Edit fontSize="small" />} label="Edit" onClick={() => handleOpenDialog(params.row)} showInMenu />,
          ...(params.row.status === 'pending'
            ? [<GridActionsCellItem icon={<CheckCircle fontSize="small" />} label="Mark as Paid" onClick={() => handleMarkAsPaid(params.id)} showInMenu />]
            : []),
          <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.id)} showInMenu />,
        ];
      },
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

      {proofActionMsg && (
        <Alert
          severity={proofActionMsg.type}
          onClose={() => setProofActionMsg(null)}
          sx={{ mb: 2, borderRadius: 1.5 }}
        >
          {proofActionMsg.text}
        </Alert>
      )}

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
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectSubmit}>Reject</Button>
        </DialogActions>
      </Dialog>
    </OwnerPageContainer>
  );
};

export default Payments;
