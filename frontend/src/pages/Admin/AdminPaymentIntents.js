import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { paymentIntentAPI } from '../../services/api/subscriptionAPI';
import { adminPrimaryButtonSx } from '../../theme/designTokens';
import { formatMoney } from '../../utils/formatMoney';
import { showSuccess, showError } from '../../utils/sweetAlert';

const CATEGORY_LABELS = {
  rent: 'Rent',
  inspection: 'Inspection',
  airbnb: 'Short stay',
};

const AdminPaymentIntents = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [intents, setIntents] = useState([]);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadIntents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentIntentAPI.listPending();
      const rows = Array.isArray(res.data) ? res.data : [];
      setIntents(rows.filter((i) => i.status === 'awaiting_approval'));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load payment intents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadIntents();
  }, [user, loadIntents]);

  const handleApprove = async (id) => {
    setActing(`${id}_approve`);
    try {
      await paymentIntentAPI.approve(id);
      showSuccess('Approved', 'Payment proof approved and recorded.');
      await loadIntents();
    } catch (err) {
      showError('Failed', err.response?.data?.detail || 'Could not approve payment');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActing(`${rejectTarget.id}_reject`);
    try {
      await paymentIntentAPI.reject(rejectTarget.id, rejectReason.trim() || undefined);
      showSuccess('Rejected', 'Payment proof rejected.');
      setRejectTarget(null);
      setRejectReason('');
      await loadIntents();
    } catch (err) {
      showError('Failed', err.response?.data?.detail || 'Could not reject payment');
    } finally {
      setActing(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">Admin access required.</Alert>
      </AdminPage>
    );
  }

  const rentCount = intents.filter((i) => i.category === 'rent').length;
  const otherCount = intents.length - rentCount;

  const columns = [
    {
      id: 'category',
      label: 'Type',
      render: (row) => (
        <Chip
          size="small"
          label={CATEGORY_LABELS[row.category] || row.category || '—'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'payer',
      label: 'Payer',
      render: (row) => (
        <>
          <Typography variant="body2" fontWeight={600}>
            {row.tenant_name || row.payer_id || '—'}
          </Typography>
          {row.proof_reference && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              Ref: {row.proof_reference}
            </Typography>
          )}
        </>
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {formatMoney(row.amount, row.currency || 'UGX')}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <AdminStatusChip status={row.status} />,
    },
    {
      id: 'date',
      label: 'Submitted',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : '—'),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <TableActions
          actions={[
            {
              icon: <CheckCircle fontSize="small" />,
              label: 'Approve',
              onClick: () => handleApprove(row.id),
              disabled: acting === `${row.id}_approve`,
            },
            {
              icon: <Cancel fontSize="small" />,
              label: 'Reject',
              onClick: () => {
                setRejectTarget(row);
                setRejectReason('');
              },
              danger: true,
              disabled: acting === `${row.id}_reject`,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Payment approvals"
        subtitle="Manual payment proofs awaiting admin review"
        action={
          <Button variant="outlined" onClick={loadIntents} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AdminStatStrip
        loading={loading}
        stats={[
          { id: 'pending', title: 'Awaiting approval', value: intents.length, icon: <HourglassEmpty /> },
          { id: 'rent', title: 'Rent proofs', value: rentCount, icon: <PaymentIcon /> },
          { id: 'other', title: 'Other', value: otherCount, icon: <PaymentIcon /> },
        ]}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          title="Pending payment intents"
          subtitle="Approve or reject tenant and owner manual payment proofs."
          columns={columns}
          rows={intents}
          emptyTitle="No pending approvals"
          emptyDescription="When tenants or owners submit manual payment proofs, they appear here."
          emptyIcon={PaymentIcon}
        />
      )}

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject payment proof</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Rejecting {formatMoney(rejectTarget?.amount, rejectTarget?.currency || 'UGX')} from{' '}
            <strong>{rejectTarget?.tenant_name || rejectTarget?.payer_id || 'payer'}</strong>.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject} disabled={Boolean(acting)}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
};

export default AdminPaymentIntents;
