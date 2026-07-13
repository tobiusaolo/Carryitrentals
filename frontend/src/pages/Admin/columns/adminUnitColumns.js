import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Switch,
  Chip,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import TableActions from '../../../components/UI/TableActions';
import { isCommercialUnit } from '../../../constants/rentalUnit';
import { RENTAL_STATUS_OPTIONS } from '../../../utils/rentalStatus';
import { formatMoney } from '../../../utils/formatMoney';
import ListingVideoBadge from '../../../components/Public/ListingVideoBadge';

export function buildAdminUnitColumns({
  handleStatusChange,
  handleVerifiedChange,
  handleView,
  handleOpenDialog,
  handleDelete,
}) {
  return [
    {
      id: 'title',
      label: 'Title',
      getSearchValue: (row) => `${row.title} ${row.bedrooms} ${row.bathrooms}`,
      render: (unit) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'success.light' }}>
            <ApartmentIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{unit.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {isCommercialUnit(unit.unit_type)
                ? `${unit.square_feet || '—'} sq ft`
                : `${unit.bedrooms || '—'} bed, ${unit.bathrooms || '—'} bath`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      getSearchValue: (row) => `${row.location} ${row.country || ''}`,
      render: (unit) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">{unit.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {unit.location}{unit.country ? `, ${unit.country}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'monthly_rent',
      label: 'Rent Amount',
      render: (unit) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatMoney(unit.monthly_rent, unit.currency || 'UGX')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Details',
      getSearchValue: (row) => row.description || '',
      render: (unit) => <Typography variant="body2">{unit.description}</Typography>,
    },
    {
      id: 'agent_name',
      label: 'Agent',
      getSearchValue: (row) => row.agent_name || '',
      render: (unit) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {unit.agent_name || 'No Agent'}
          </Typography>
          {unit.agent_name && (
            <Typography variant="caption" color="text.secondary">Assigned Agent</Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'video',
      label: 'Video',
      render: (unit) => <ListingVideoBadge unit={unit} variant="outlined" />,
    },
    {
      id: 'status',
      label: 'Status',
      render: (unit) => (
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={unit.status || 'available'}
            onChange={(e) => handleStatusChange(unit.id, e.target.value)}
            sx={{ fontSize: '0.8rem' }}
          >
            {RENTAL_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      id: 'verified',
      label: 'Public verified',
      render: (unit) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Switch
            size="small"
            checked={Boolean(unit.is_verified)}
            onChange={(e) => handleVerifiedChange(unit.id, e.target.checked)}
            color="success"
          />
          {unit.is_verified && (
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
              label="Verified"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (unit) => (
        <TableActions
          actions={[
            { icon: <ViewIcon fontSize="small" />, label: 'View Details', onClick: () => handleView(unit) },
            { icon: <EditIcon fontSize="small" />, label: 'Edit Unit', onClick: () => handleOpenDialog({ ...unit, isRentalUnit: true }) },
            { icon: <DeleteIcon fontSize="small" />, label: 'Delete Unit', onClick: () => handleDelete(unit.id, true), danger: true },
          ]}
        />
      ),
    },
  ];
}
