import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import {
  Report as ReportIcon,
  Flag,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import authService from '../../services/authService';
import { showError } from '../../utils/sweetAlert';

const REASON_LABELS = {
  fake_listing: 'Fake listing',
  wrong_price: 'Wrong price',
  already_rented: 'Already rented',
  scam_agent: 'Scam agent',
  duplicate: 'Duplicate',
  other: 'Other',
};

const AdminListingReports = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = authService.createAxiosInstance();
      const res = await api.get('/marketplace/listing-reports');
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load listing reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadReports();
  }, [user, loadReports]);

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">Admin access required.</Alert>
      </AdminPage>
    );
  }

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status !== 'pending').length;

  const columns = [
    {
      id: 'listing_id',
      label: 'Listing',
      render: (r) => (
        <>
          <Typography variant="body2" fontWeight={600}>
            {r.rental_unit_id || r.listing_id || '—'}
          </Typography>
          {r.listing_title && (
            <Typography variant="caption" color="text.secondary">
              {r.listing_title}
            </Typography>
          )}
        </>
      ),
    },
    {
      id: 'reason',
      label: 'Reason',
      render: (r) => (
        <Chip
          size="small"
          icon={<Flag fontSize="small" />}
          label={REASON_LABELS[r.reason] || r.reason || '—'}
          color={r.reason === 'scam_agent' || r.reason === 'fake_listing' ? 'error' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'reporter',
      label: 'Reporter',
      render: (r) => (
        <>
          <Typography variant="body2" fontWeight={600}>
            {r.reporter_name || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {[r.reporter_phone, r.reporter_email].filter(Boolean).join(' · ')}
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
      id: 'created_at',
      label: 'Reported',
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : '—'),
    },
  ];

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Listing reports"
        subtitle="Public abuse reports from the marketplace"
        action={
          <Button variant="outlined" onClick={loadReports} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <AdminStatStrip
        loading={loading}
        stats={[
          { id: 'pending', title: 'Pending review', value: pendingCount, icon: <HourglassEmpty /> },
          { id: 'resolved', title: 'Resolved', value: resolvedCount, icon: <CheckCircle /> },
          { id: 'total', title: 'Total reports', value: reports.length, icon: <ReportIcon /> },
        ]}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          title="Marketplace abuse reports"
          subtitle="Reports submitted from public rental listings."
          columns={columns}
          rows={reports}
          emptyTitle="No listing reports"
          emptyDescription="When visitors report suspicious listings, they appear here."
          emptyIcon={ReportIcon}
          searchPlaceholder="Search by listing, reporter, or reason…"
        />
      )}
    </AdminPage>
  );
};

export default AdminListingReports;
