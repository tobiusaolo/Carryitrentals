import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  CreditCard,
} from '@mui/icons-material';
import TableActions from '../../../components/UI/TableActions';
import AdminStatusChip from '../../../components/Admin/AdminStatusChip';
import { getAirbnbPropertyTypeLabel } from '../../../constants/airbnb';
import { showError } from '../../../utils/sweetAlert';

export function buildAirbnbListingColumns({
  handleView,
  handleOpenDialog,
  handleDelete,
}) {
  return [
    {
      id: 'title',
      label: 'Title',
      getSearchValue: (row) => `${row.title} ${row.location} ${row.country}`,
      render: (airbnb) => (
        <Typography variant="body2" fontWeight={600}>{airbnb.title}</Typography>
      ),
    },
    {
      id: 'property_type',
      label: 'Type',
      render: (airbnb) => (
        <Chip label={getAirbnbPropertyTypeLabel(airbnb.property_type)} size="small" variant="outlined" />
      ),
    },
    {
      id: 'location',
      label: 'Location',
      getSearchValue: (row) => `${row.location} ${row.country || ''}`,
      render: (airbnb) => (
        <Box>
          <Typography variant="body2">{airbnb.location}</Typography>
          {airbnb.country && (
            <Typography variant="caption" color="text.secondary">{airbnb.country}</Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'country',
      label: 'Country',
      render: (airbnb) => (
        <Chip label={airbnb.country || 'N/A'} size="small" color="info" variant="outlined" />
      ),
    },
    {
      id: 'price_per_night',
      label: 'Price/Night',
      render: (airbnb) => (
        <Chip
          label={`${airbnb.currency} ${parseFloat(airbnb.price_per_night).toLocaleString()}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    { id: 'max_guests', label: 'Guests' },
    { id: 'bedrooms', label: 'Bedrooms' },
    {
      id: 'is_available',
      label: 'Status',
      render: (airbnb) => (
        <AdminStatusChip
          status={airbnb.is_available ? 'available' : 'inactive'}
          label={airbnb.is_available ? 'Available' : 'Unavailable'}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (airbnb) => (
        <TableActions
          actions={[
            { icon: <Visibility fontSize="small" />, label: 'View Details', onClick: () => handleView(airbnb) },
            { icon: <Edit fontSize="small" />, label: 'Edit', onClick: () => handleOpenDialog(airbnb) },
            { icon: <Delete fontSize="small" />, label: 'Delete', onClick: () => handleDelete(airbnb.id), danger: true },
          ]}
        />
      ),
    },
  ];
}

export function buildAirbnbBookingColumns({
  formatDate,
  formatCurrency,
  handleViewBookingDetails,
  handleApproveBooking,
  handleDeclineBooking,
}) {
  return [
    {
      id: 'id',
      label: 'Booking ID',
      render: (booking) => (
        <Typography variant="body2" fontWeight={600}>#{booking.id}</Typography>
      ),
    },
    {
      id: 'property',
      label: 'Property',
      getSearchValue: (row) => `${row.airbnb_title || ''} ${row.airbnb_location || ''} ${row.airbnb_id || ''}`,
      render: (booking) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {booking.airbnb_title || booking.airbnb_id || 'N/A'}
          </Typography>
          {booking.airbnb_location && (
            <Typography variant="caption" color="text.secondary" display="block">
              {booking.airbnb_location}
            </Typography>
          )}
          {booking.airbnb_id && (
            <Typography variant="caption" color="text.secondary" display="block">
              ID: {booking.airbnb_id}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'guest',
      label: 'Guest',
      getSearchValue: (row) => `${row.guest_name || ''} ${row.guest_phone || ''}`,
      render: (booking) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{booking.guest_name}</Typography>
          <Typography variant="caption" color="text.secondary">{booking.guest_phone}</Typography>
        </Box>
      ),
    },
    {
      id: 'check_in',
      label: 'Check-in',
      render: (booking) => formatDate(booking.check_in),
    },
    {
      id: 'check_out',
      label: 'Check-out',
      render: (booking) => formatDate(booking.check_out),
    },
    { id: 'number_of_guests', label: 'Guests' },
    {
      id: 'total_amount',
      label: 'Total Amount',
      render: (booking) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(booking.total_amount, booking.currency)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Prepaid: {formatCurrency(booking.prepayment_amount, booking.currency)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (booking) => <AdminStatusChip status={booking.status} />,
    },
    {
      id: 'payment_status',
      label: 'Payment',
      render: (booking) => <AdminStatusChip status={booking.payment_status} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (booking) => (
        <TableActions
          actions={[
            {
              icon: <Visibility fontSize="small" />,
              label: 'View Details',
              onClick: () => handleViewBookingDetails(booking),
            },
            {
              icon: <ApproveIcon fontSize="small" />,
              label: 'Approve Booking',
              hidden: !(booking.status && booking.status.toLowerCase() === 'pending'),
              onClick: () => {
                if (booking.id) handleApproveBooking(booking.id);
                else showError('Error', 'Booking ID is missing');
              },
            },
            {
              icon: <DeclineIcon fontSize="small" />,
              label: 'Decline Booking',
              hidden: !(booking.status && booking.status.toLowerCase() === 'pending'),
              onClick: () => {
                if (booking.id) handleDeclineBooking(booking.id);
                else showError('Error', 'Booking ID is missing');
              },
            },
          ]}
        />
      ),
    },
  ];
}

export function buildAirbnbPaymentColumns({ formatDate, formatCurrency }) {
  return [
    {
      id: 'payment_reference',
      label: 'Transaction ID',
      getSearchValue: (row) => row.payment_reference,
      render: (payment) => (
        <Typography variant="body2" fontFamily="monospace">{payment.payment_reference}</Typography>
      ),
    },
    {
      id: 'booking_id',
      label: 'Booking ID',
      render: (payment) => `#${payment.booking_id}`,
    },
    {
      id: 'guest_name',
      label: 'Guest',
      getSearchValue: (row) => row.guest_name,
    },
    {
      id: 'airbnb_title',
      label: 'Property',
      getSearchValue: (row) => row.airbnb_title,
    },
    {
      id: 'amount',
      label: 'Amount',
      render: (payment) => (
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(payment.amount, payment.currency)}
        </Typography>
      ),
    },
    {
      id: 'payment_method',
      label: 'Payment Method',
      render: (payment) => (
        <Chip
          label={payment.payment_method?.replace('_', ' ').toUpperCase()}
          size="small"
          icon={<CreditCard />}
          variant="outlined"
        />
      ),
    },
    {
      id: 'payment_status',
      label: 'Status',
      render: (payment) => <AdminStatusChip status={payment.payment_status} />,
    },
    {
      id: 'payment_date',
      label: 'Date',
      render: (payment) => formatDate(payment.payment_date),
    },
  ];
}
