import React from 'react';
import {
  Alert,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { OpenInNew, Refresh, Payment } from '@mui/icons-material';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import { formatMoney } from '../../utils/formatMoney';
import { useSelector } from 'react-redux';
import { portalOutlinedButtonSx } from '../../theme/designTokens';

const AdminViewingPayments = () => {
  const { user } = useSelector((state) => state.auth);

  const {
    data,
    loading,
    refreshing,
    error,
    refresh: load,
  } = useCachedQuery('/inspection-payments/?limit=500', {
    enabled: user?.role === 'admin',
    select: (payload) => (Array.isArray(payload) ? payload : []),
  });

  const rows = Array.isArray(data) ? data : [];

  if (user?.role !== 'admin') {
    return <Alert severity="error">Admin access required</Alert>;
  }

  const columns = [
    {
      id: 'id',
      label: 'Payment ID',
      render: (p) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem' }}>{p.id}</span>
      ),
    },
    {
      id: 'booking',
      label: 'Booking',
      render: (p) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem' }}>{p.inspection_booking_id}</span>
      ),
    },
    {
      id: 'amount',
      label: 'Amount due now',
      render: (p) => formatMoney(p.amount, p.currency || 'UGX'),
    },
    {
      id: 'status',
      label: 'Status',
      render: (p) => <OwnerStatusChip status={p.status} />,
    },
    {
      id: 'transaction',
      label: 'Transaction',
      render: (p) => p.transaction_id || '—',
    },
    {
      id: 'link',
      label: 'Actions',
      align: 'right',
      render: (p) => (
        <Tooltip title="Open payment page">
          <IconButton
            size="small"
            onClick={() => window.open(`/inspection-payment/${p.id}`, '_blank')}
          >
            <OpenInNew fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        variant="admin"
        title="Viewing payments"
        action={
          <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small" sx={portalOutlinedButtonSx}>
            Refresh
          </Button>
        }
      />

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading && !rows.length}
        title="All payments"
        emptyTitle="No payments"
        emptyDescription="Created when a guest books a viewing."
        emptyIcon={Payment}
      />
    </>
  );
};

export default AdminViewingPayments;
