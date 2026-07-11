import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Build as BuildIcon,
  HourglassEmpty,
  PlayArrow,
  CheckCircle,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import adminAPI from '../../services/api/adminAPI';
import authService from '../../services/authService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminMaintenance = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllMaintenanceRequests(0, 500);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadRequests();
  }, [user, loadRequests]);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      const api = authService.createAxiosInstance();
      await api.put(`/maintenance/${id}`, { status });
      showSuccess('Updated', 'Maintenance request status updated.');
      await loadRequests();
    } catch (err) {
      showError('Failed', err.response?.data?.detail || 'Could not update status');
    } finally {
      setUpdating(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">Admin access required.</Alert>
      </AdminPage>
    );
  }

  const pendingCount = requests.filter((r) => {
    const s = String(r.status?.value || r.status || '').toLowerCase();
    return s === 'pending';
  }).length;
  const activeCount = requests.filter((r) => {
    const s = String(r.status?.value || r.status || '').toLowerCase();
    return s === 'pending' || s === 'in_progress';
  }).length;
  const completedCount = requests.filter((r) => {
    const s = String(r.status?.value || r.status || '').toLowerCase();
    return s === 'completed';
  }).length;

  const normalizeStatus = (row) => String(row.status?.value || row.status || 'pending').toLowerCase();

  const columns = [
    {
      id: 'title',
      label: 'Request',
      render: (r) => (
        <>
          <Typography variant="body2" fontWeight={600}>
            {r.title || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {r.description?.slice(0, 80) || '—'}
            {r.description?.length > 80 ? '…' : ''}
          </Typography>
        </>
      ),
    },
    {
      id: 'property',
      label: 'Property / unit',
      render: (r) => (
        <Typography variant="body2">
          Property #{r.property_id}
          {r.unit_id ? ` · Unit #${r.unit_id}` : ''}
        </Typography>
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      render: (r) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {r.priority || 'medium'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (r) => <AdminStatusChip status={normalizeStatus(r)} />,
    },
    {
      id: 'created_at',
      label: 'Submitted',
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'),
    },
    {
      id: 'actions',
      label: 'Update status',
      align: 'right',
      render: (r) => (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={normalizeStatus(r)}
            onChange={(e) => handleStatusChange(r.id, e.target.value)}
            disabled={updating === r.id}
            displayEmpty
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
  ];

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Maintenance"
        subtitle="All property maintenance requests"
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
          { id: 'active', title: 'Open requests', value: activeCount, icon: <HourglassEmpty /> },
          { id: 'pending', title: 'Pending', value: pendingCount, icon: <BuildIcon /> },
          { id: 'in_progress', title: 'In progress', value: activeCount - pendingCount, icon: <PlayArrow /> },
          { id: 'completed', title: 'Completed', value: completedCount, icon: <CheckCircle /> },
        ]}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          title="Maintenance requests"
          subtitle="Update status as work progresses."
          columns={columns}
          rows={requests}
          emptyTitle="No maintenance requests"
          emptyDescription="Tenant and owner maintenance requests appear here."
          emptyIcon={BuildIcon}
          searchPlaceholder="Search by title, property, or status…"
        />
      )}
    </AdminPage>
  );
};

export default AdminMaintenance;
