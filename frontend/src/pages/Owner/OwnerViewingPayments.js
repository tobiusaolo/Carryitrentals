import React from 'react';
import {
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import { OpenInNew, Refresh, Payment } from '@mui/icons-material';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import PageHeader from '../../components/UI/PageHeader';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerDataTable from '../../components/Owner/OwnerDataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import TableActions from '../../components/UI/TableActions';
import { formatMoney } from '../../utils/formatMoney';
import { portalOutlinedButtonSx } from '../../theme/designTokens';

const OwnerViewingPayments = () => {
  const {
    data,
    loading,
    refreshing,
    error,
    refresh: load,
  } = useCachedQuery('/inspection-payments/mine', {
    select: (payload) => (Array.isArray(payload) ? payload : []),
  });

  const rows = Array.isArray(data) ? data : [];

  const columns = [
    {
      id: 'id',
      label: 'Payment',
      render: (p) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.id}</span>
      ),
    },
    {
      id: 'booking',
      label: 'Booking',
      render: (p) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.inspection_booking_id}</span>
      ),
    },
    {
      id: 'amount',
      label: 'Amount (due now)',
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
        <TableActions
          actions={[
            {
              icon: <OpenInNew fontSize="small" />,
              label: 'Open guest payment page',
              onClick: () => window.open(`/inspection-payment/${p.id}`, '_blank'),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Viewing payments"
        action={
          <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small" sx={portalOutlinedButtonSx}>
            Refresh
          </Button>
        }
      />

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <OwnerDataTable
        columns={columns}
        rows={rows}
        loading={loading && !rows.length}
        emptyTitle="No viewing payments yet"
        emptyDescription="They are created when a guest books a tour on your listing."
        emptyIcon={Payment}
      />
    </OwnerPageContainer>
  );
};

export default OwnerViewingPayments;
