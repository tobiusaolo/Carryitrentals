import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import api from '../../services/api/api';
import { useCachedQueries } from '../../hooks/useCachedQuery';
import PageHeader from '../../components/UI/PageHeader';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerDataTable from '../../components/Owner/OwnerDataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import { colors, portalOutlinedButtonSx } from '../../theme/designTokens';

const formatStatus = (s) => {
  const v = s?.value || s || 'pending';
  return String(v).replace(/_/g, ' ');
};

const OwnerViewings = () => {
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState(null);
  const [actionError, setActionError] = useState(null);

  const {
    data,
    loading,
    refreshing,
    error,
    refresh: load,
  } = useCachedQueries([
    {
      url: '/rental-units/inspections/my-bookings',
      select: (payload) => (Array.isArray(payload) ? payload : []),
    },
    {
      url: '/rental-units/',
      select: (payload) => (Array.isArray(payload) ? payload : []),
    },
  ]);

  const bookings = Array.isArray(data?.[0]) ? data[0] : [];
  const units = Array.isArray(data?.[1]) ? data[1] : [];

  const unitMap = useMemo(() => {
    const m = {};
    (units || []).forEach((u) => {
      m[String(u.id)] = u;
    });
    return m;
  }, [units]);

  const filtered = bookings.filter((b) => {
    const st = (b.status?.value || b.status || '').toLowerCase();
    if (tab === 1) return st === 'pending';
    if (tab === 2) return st === 'confirmed' || st === 'completed';
    if (tab === 3) return st === 'cancelled';
    return true;
  });

  const updateStatus = async (bookingId, status) => {
    const id = String(bookingId);
    try {
      setActionError(null);
      await api.put(`/rental-units/inspections/${id}`, { status });
      await load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setActionError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
            : 'Could not update booking'
      );
    }
  };

  const pendingCount = bookings.filter(
    (b) => (b.status?.value || b.status || '').toLowerCase() === 'pending'
  ).length;

  const columns = [
    {
      id: 'listing',
      label: 'Listing',
      render: (b) => {
        const unit = unitMap[String(b.rental_unit_id)];
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {unit?.title || `Unit ${b.rental_unit_id}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unit?.location}
            </Typography>
          </>
        );
      },
    },
    {
      id: 'guest',
      label: 'Guest',
      render: (b) => (
        <>
          <Typography variant="body2">{b.contact_name || '—'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {b.contact_phone}
          </Typography>
        </>
      ),
    },
    {
      id: 'date',
      label: 'Date',
      render: (b) => (
        <>
          {b.booking_date
            ? new Date(b.booking_date).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'}
          {b.preferred_time_slot && (
            <Typography variant="caption" display="block" color="text.secondary">
              {b.preferred_time_slot}
            </Typography>
          )}
        </>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (b) => <OwnerStatusChip status={b.status} label={formatStatus(b.status)} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (b) => {
        const st = (b.status?.value || b.status || 'pending').toLowerCase();
        return (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <Tooltip title="Details">
              <IconButton size="small" onClick={() => setDetail(b)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {st === 'pending' && (
              <>
                <Button
                  size="small"
                  sx={{ textTransform: 'none', color: colors.brand, fontWeight: 700 }}
                  startIcon={<CheckCircle />}
                  onClick={() => updateStatus(b.id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  size="small"
                  sx={{ textTransform: 'none', color: colors.text, fontWeight: 700 }}
                  startIcon={<Cancel />}
                  onClick={() => updateStatus(b.id, 'cancelled')}
                >
                  Decline
                </Button>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Viewings"
        action={
          <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={load} disabled={refreshing} sx={portalOutlinedButtonSx}>
            Refresh
          </Button>
        }
      />

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {pendingCount} pending — confirm after viewing fee is paid.
        </Alert>
      )}

      {(error || actionError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError || error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`All (${bookings.length})`} />
        <Tab label={`Pending (${pendingCount})`} />
        <Tab label="Confirmed" />
        <Tab label="Cancelled" />
      </Tabs>

      <OwnerDataTable
        columns={columns}
        rows={filtered}
        loading={loading && !bookings.length}
        emptyTitle="No bookings"
        emptyDescription="Public tour requests appear here."
        emptyIcon={Visibility}
      />

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking details</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2">
                <strong>Guest:</strong> {detail.contact_name} · {detail.contact_phone}
              </Typography>
              {detail.contact_email && (
                <Typography variant="body2">
                  <strong>Email:</strong> {detail.contact_email}
                </Typography>
              )}
              {detail.message && (
                <Typography variant="body2">
                  <strong>Message:</strong> {detail.message}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Fee note:</strong> Guest pays 60% upfront via the payment link sent after booking; you receive the balance after the viewing per platform rules.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </OwnerPageContainer>
  );
};

export default OwnerViewings;
