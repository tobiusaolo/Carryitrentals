import React from 'react';
import { Box, Typography, Chip, Stack, Tooltip, Button, IconButton } from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import AdminStatusChip from '../../../components/Admin/AdminStatusChip';

export function buildAdminInspectionColumns({
  handlePaymentManagement,
  handleApproveBooking,
  handleRejectBooking,
  setActionMenuAnchor,
  setSelectedInspectionForMenu,
}) {
  return [
    {
      id: 'id',
      label: 'Inspection ID',
      getSearchValue: (row) => `#${row.id}`,
      render: (inspection) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            #{inspection.id}
          </Typography>
          {inspection.is_public_booking && (
            <Chip label="Public" size="small" color="info" sx={{ mt: 0.5 }} />
          )}
        </Box>
      ),
    },
    {
      id: 'property',
      label: 'Property',
      getSearchValue: (row) =>
        `${row.rental_unit?.title || row.rental_unit?.name || ''} ${row.rental_unit?.location || ''} ${row.rental_unit_id || ''}`,
      render: (inspection) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {inspection.rental_unit?.title || inspection.rental_unit?.name || inspection.rental_unit_id || `Booking ID: ${inspection.id}`}
          </Typography>
          {inspection.rental_unit?.location && (
            <Typography variant="caption" color="text.secondary" display="block">
              {inspection.rental_unit.location}
            </Typography>
          )}
          {inspection.rental_unit?.unit_type && (
            <Typography variant="caption" display="block" color="primary">
              {inspection.rental_unit.unit_type}
            </Typography>
          )}
          {inspection.rental_unit_id && !inspection.rental_unit && (
            <Typography variant="caption" color="text.secondary" display="block">
              Unit ID: {inspection.rental_unit_id}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'client',
      label: 'Client',
      getSearchValue: (row) =>
        `${row.contact_name || row.tenant?.name || ''} ${row.contact_email || ''}`,
      render: (inspection) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {inspection.contact_name || inspection.tenant?.name || 'N/A'}
          </Typography>
          {inspection.contact_email && (
            <Typography variant="caption" color="text.secondary" display="block">
              {inspection.contact_email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'contact_phone',
      label: 'Contact',
      getSearchValue: (row) => row.contact_phone,
      render: (inspection) => (
        <Typography variant="body2">{inspection.contact_phone || 'N/A'}</Typography>
      ),
    },
    {
      id: 'booking_date',
      label: 'Date & Time',
      getSearchValue: (row) =>
        `${new Date(row.booking_date).toLocaleDateString()} ${row.preferred_time_slot || ''}`,
      render: (inspection) => (
        <Box>
          <Typography variant="body2">
            {new Date(inspection.booking_date).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {inspection.preferred_time_slot
              ? inspection.preferred_time_slot.charAt(0).toUpperCase() + inspection.preferred_time_slot.slice(1)
              : 'Not specified'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (inspection) => <AdminStatusChip status={inspection.status} />,
    },
    {
      id: 'payment',
      label: 'Payment',
      render: (inspection) =>
        inspection.payment?.payment_id ? (
          <Chip
            size="small"
            label={inspection.payment_status || inspection.payment?.status || 'pending'}
            color={
              (inspection.payment_status || inspection.payment?.status) === 'paid'
                ? 'success'
                : 'warning'
            }
            onClick={() => handlePaymentManagement(inspection)}
            sx={{ cursor: 'pointer' }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            No payment
          </Typography>
        ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (inspection) => (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
          {inspection.status?.toLowerCase() === 'pending' && (
            <>
              <Tooltip title="Approve Inspection">
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => handleApproveBooking(inspection.id)}
                  sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject Inspection">
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => handleRejectBooking(inspection.id)}
                  sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          {inspection.status?.toLowerCase() !== 'pending' && (
            <AdminStatusChip status={inspection.status} />
          )}
          <Tooltip title="More Actions">
            <IconButton
              size="small"
              onClick={(e) => {
                setActionMenuAnchor(e.currentTarget);
                setSelectedInspectionForMenu(inspection);
              }}
              sx={{ border: '1px solid', borderColor: 'divider', ml: 'auto' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
