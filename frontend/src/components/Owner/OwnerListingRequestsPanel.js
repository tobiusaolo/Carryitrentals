import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Refresh,
  HourglassEmpty,
  RateReview,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import OwnerDataTable from './OwnerDataTable';
import { colors, ownerPalette } from '../../theme/designTokens';
import {
  getListingRequestStatusMeta,
  LISTING_REQUEST_TYPE_LABELS,
} from '../../constants/listingRequest';

const STATUS_ICONS = {
  pending: HourglassEmpty,
  in_review: RateReview,
  fulfilled: CheckCircle,
  rejected: Cancel,
};

function ListingRequestStatusCell({ row }) {
  const meta = getListingRequestStatusMeta(row.status);
  const Icon = STATUS_ICONS[row.status] || HourglassEmpty;
  const progress =
    row.status === 'fulfilled' || row.status === 'rejected'
      ? 100
      : row.status === 'in_review'
        ? 66
        : 33;

  return (
    <Box sx={{ minWidth: 180 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
        <Icon sx={{ fontSize: 16, color: colors.textMuted }} />
        <Chip
          size="small"
          label={meta.label}
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor:
              meta.tone === 'success'
                ? `${colors.success}18`
                : meta.tone === 'error'
                  ? `${colors.error}14`
                  : meta.tone === 'warning'
                    ? `${colors.warning}18`
                    : colors.surfaceMuted,
            color:
              meta.tone === 'success'
                ? colors.success
                : meta.tone === 'error'
                  ? colors.error
                  : meta.tone === 'warning'
                    ? ownerPalette.secondary
                    : ownerPalette.secondary,
          }}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          mb: 0.75,
          bgcolor: colors.surfaceMuted,
          '& .MuiLinearProgress-bar': {
            bgcolor:
              row.status === 'rejected'
                ? colors.error
                : row.status === 'fulfilled'
                  ? colors.success
                  : colors.brand,
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
        {meta.description}
      </Typography>
      {row.admin_notes && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: colors.textMuted }}>
          <strong>Admin:</strong> {row.admin_notes}
        </Typography>
      )}
    </Box>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function OwnerListingRequestsPanel({
  requests = [],
  requestType,
  loading = false,
  onRefresh,
  showUnitColumn = false,
  pollIntervalMs = 30000,
}) {
  const filtered = useMemo(
    () =>
      requestType
        ? requests.filter((r) => r.request_type === requestType)
        : requests,
    [requests, requestType]
  );

  const counts = useMemo(() => {
    const tally = { pending: 0, in_review: 0, fulfilled: 0, rejected: 0 };
    filtered.forEach((r) => {
      const key = r.status || 'pending';
      if (tally[key] !== undefined) tally[key] += 1;
    });
    return tally;
  }, [filtered]);

  useEffect(() => {
    if (!onRefresh || pollIntervalMs <= 0) return undefined;
    const id = setInterval(() => onRefresh(), pollIntervalMs);
    return () => clearInterval(id);
  }, [onRefresh, pollIntervalMs]);

  const typeLabel = requestType
    ? LISTING_REQUEST_TYPE_LABELS[requestType] || 'listing'
    : 'listing';

  const columns = [
    {
      id: 'property',
      label: 'Property',
      render: (r) => (
        <>
          <Typography variant="body2" fontWeight={600}>
            {r.property_name || '—'}
          </Typography>
          {r.title && (
            <Typography variant="caption" color="text.secondary">
              {r.title}
            </Typography>
          )}
        </>
      ),
    },
    ...(showUnitColumn
      ? [
          {
            id: 'unit',
            label: 'Unit',
            render: (r) => r.unit_number || '—',
          },
        ]
      : []),
    {
      id: 'status',
      label: 'Status & progress',
      render: (r) => <ListingRequestStatusCell row={r} />,
    },
    {
      id: 'submitted',
      label: 'Submitted',
      render: (r) => formatDate(r.created_at),
    },
    {
      id: 'updated',
      label: 'Last update',
      render: (r) => formatDate(r.updated_at),
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {counts.pending > 0 && (
            <Chip size="small" label={`${counts.pending} awaiting review`} variant="outlined" />
          )}
          {counts.in_review > 0 && (
            <Chip size="small" color="warning" label={`${counts.in_review} in review`} variant="outlined" />
          )}
          {counts.fulfilled > 0 && (
            <Chip size="small" color="success" label={`${counts.fulfilled} published`} variant="outlined" />
          )}
          {counts.rejected > 0 && (
            <Chip size="small" color="error" label={`${counts.rejected} declined`} variant="outlined" />
          )}
        </Stack>
        {onRefresh && (
          <Tooltip title="Refresh status">
            <IconButton size="small" onClick={onRefresh} disabled={loading}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <OwnerDataTable
        title="Your listing requests"
        subtitle={`Track ${typeLabel} requests from submission through admin review to publish.`}
        columns={columns}
        rows={filtered}
        loading={loading}
        searchable={false}
        emptyTitle="No listing requests yet"
        emptyDescription={`Use Request ${typeLabel.toLowerCase()} above — status updates appear here automatically.`}
      />
    </Box>
  );
}
