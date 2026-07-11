import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Assignment as RequestIcon,
  Storefront,
  Bed,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { listingRequestAPI } from '../../services/api/listingRequestAPI';
import { adminPrimaryButtonSx } from '../../theme/designTokens';
import { showSuccess, showError } from '../../utils/sweetAlert';

const TYPE_LABELS = {
  rental_unit: 'Unit for rent',
  short_stay: 'Short stay',
};

const AdminListingRequests = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [fulfillTarget, setFulfillTarget] = useState(null);
  const [fulfillListingId, setFulfillListingId] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listingRequestAPI.getAll();
      setRequests(res.data || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setRequests([]);
        setError('Listing requests API is not available. Restart the backend server.');
      } else {
        setError('Failed to load listing requests');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadRequests();
  }, [user, loadRequests]);

  const patchRequest = async (id, payload) => {
    setSubmitting(true);
    try {
      await listingRequestAPI.update(id, payload);
      await loadRequests();
      showSuccess('Updated', 'Listing request updated.');
    } catch (err) {
      showError('Failed', err.response?.data?.detail || 'Could not update request');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateListing = async (row) => {
    await patchRequest(row.id, { status: 'in_review' });
    const params = new URLSearchParams({
      request_id: row.id,
      property_id: row.property_id,
      owner_id: row.owner_id,
    });
    if (row.unit_id) params.set('unit_id', row.unit_id);
    if (row.title) params.set('title', row.title);
    if (row.message) params.set('notes', row.message);

    if (row.request_type === 'short_stay') {
      navigate(`/admin/airbnb?${params.toString()}`);
    } else {
      navigate(`/admin/units?${params.toString()}`);
    }
  };

  const handleFulfill = async () => {
    if (!fulfillTarget) return;
    await patchRequest(fulfillTarget.id, {
      status: 'fulfilled',
      fulfilled_listing_id: fulfillListingId.trim() || undefined,
    });
    setFulfillTarget(null);
    setFulfillListingId('');
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    await patchRequest(rejectTarget.id, {
      status: 'rejected',
      admin_notes: rejectNotes.trim() || undefined,
    });
    setRejectTarget(null);
    setRejectNotes('');
  };

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">Admin access required.</Alert>
      </AdminPage>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const inReviewCount = requests.filter((r) => r.status === 'in_review').length;
  const fulfilledCount = requests.filter((r) => r.status === 'fulfilled').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const columns = [
    {
      id: 'type',
      label: 'Type',
      render: (r) => (
        <Chip
          size="small"
          icon={r.request_type === 'short_stay' ? <Bed /> : <Storefront />}
          label={TYPE_LABELS[r.request_type] || r.request_type}
        />
      ),
    },
    {
      id: 'owner',
      label: 'Owner',
      render: (r) => (
        <>
          <Typography variant="body2" fontWeight={600}>
            {r.owner_name || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {r.owner_email || ''}
          </Typography>
        </>
      ),
    },
    {
      id: 'property',
      label: 'Property',
      render: (r) => (
        <>
          <Typography variant="body2">{r.property_name || '-'}</Typography>
          {r.unit_number && (
            <Typography variant="caption" color="text.secondary">
              Unit {r.unit_number}
            </Typography>
          )}
        </>
      ),
    },
    {
      id: 'title',
      label: 'Title / notes',
      render: (r) => (
        <>
          {r.title && (
            <Typography variant="body2" fontWeight={600}>
              {r.title}
            </Typography>
          )}
          {r.message?.startsWith('Owner marked unit') ? (
            <Chip size="small" label="Unit marked available" color="info" variant="outlined" sx={{ mt: 0.5, mb: 0.5 }} />
          ) : null}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {r.message || '-'}
          </Typography>
        </>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (r) => <AdminStatusChip status={r.status} />,
    },
    {
      id: 'date',
      label: 'Submitted',
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (r) => (
        <TableActions
          actions={[
            ...(r.status === 'pending' || r.status === 'in_review'
              ? [
                  {
                    icon: <RequestIcon fontSize="small" />,
                    label: 'Create listing',
                    onClick: () => openCreateListing(r),
                  },
                  {
                    icon: <CheckCircle fontSize="small" />,
                    label: 'Mark fulfilled',
                    onClick: () => setFulfillTarget(r),
                  },
                  {
                    icon: <Cancel fontSize="small" />,
                    label: 'Reject',
                    onClick: () => setRejectTarget(r),
                    danger: true,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Listing requests"
        subtitle="Owner publish requests"
        action={
          <Button variant="outlined" onClick={loadRequests} disabled={loading}>
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
          { id: 'pending', title: 'Awaiting review', value: pendingCount, icon: <RequestIcon /> },
          { id: 'in_review', title: 'In review', value: inReviewCount, icon: <Storefront /> },
          { id: 'fulfilled', title: 'Published', value: fulfilledCount, icon: <CheckCircle /> },
          { id: 'rejected', title: 'Declined', value: rejectedCount, icon: <Cancel /> },
        ]}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          title="Owner listing requests"
          subtitle="Create listings under Units for rent or Short stays, then mark fulfilled."
          columns={columns}
          rows={requests}
          emptyTitle="No listing requests"
          emptyDescription="When owners request a unit for rent or short stay, they appear here."
          emptyIcon={RequestIcon}
        />
      )}

      <Dialog open={Boolean(fulfillTarget)} onClose={() => setFulfillTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark request fulfilled</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Confirm the listing is live for <strong>{fulfillTarget?.owner_name}</strong>.
          </Typography>
          <TextField
            fullWidth
            label="Published listing ID (optional)"
            value={fulfillListingId}
            onChange={(e) => setFulfillListingId(e.target.value)}
            placeholder="Rental unit or short-stay ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillTarget(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleFulfill} disabled={submitting} sx={adminPrimaryButtonSx}>
            Mark fulfilled
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject listing request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason (sent to owner)"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject} disabled={submitting}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
};

export default AdminListingRequests;
