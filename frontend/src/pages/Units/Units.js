import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Apartment,
  Visibility,
  Home,
  AttachMoney,
  CheckCircle,
  Business,
  MeetingRoom,
} from '@mui/icons-material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  clearError,
} from '../../store/slices/unitSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import PageHeader from '../../components/UI/PageHeader';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import { ownerPrimaryButtonSx, adminPrimaryButtonSx } from '../../theme/designTokens';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerDataGrid from '../../components/Owner/OwnerDataGrid';
import { formatMoney } from '../../utils/formatMoney';
import { showSuccess } from '../../utils/sweetAlert';

// ── Unit-type metadata ────────────────────────────────────────────────────────
const COMMERCIAL_TYPES = ['office', 'shop', 'warehouse', 'co_working', 'storage'];

const UNIT_TYPE_OPTIONS = [
  {
    group: 'Residential',
    options: [
      { value: 'single',        label: 'Single Room' },
      { value: 'double',        label: 'Double Room' },
      { value: 'studio',        label: 'Studio Apartment' },
      { value: 'semi_detached', label: 'Semi-Detached' },
      { value: 'one_bedroom',   label: '1 Bedroom' },
      { value: 'two_bedroom',   label: '2 Bedrooms' },
      { value: 'three_bedroom', label: '3 Bedrooms' },
      { value: 'penthouse',     label: 'Penthouse' },
    ],
  },
  {
    group: 'Commercial',
    options: [
      { value: 'office',     label: 'Office Space' },
      { value: 'shop',       label: 'Shop / Storefront' },
      { value: 'warehouse',  label: 'Warehouse' },
      { value: 'co_working', label: 'Co-Working Space' },
      { value: 'storage',    label: 'Storage Unit' },
    ],
  },
];

const isCommercial = (type) => COMMERCIAL_TYPES.includes(type);

const emptyForm = () => ({
  property_id:    '',
  unit_number:    '',
  unit_type:      'single',
  floor:          '',
  bedrooms:       '',
  bathrooms:      '',
  square_footage: '',
  monthly_rent:   '',
  currency:       'UGX',
  status:         'available',
  description:    '',
  amenities:      '',
});

const getStatusColor = (s) =>
  ({ available: 'success', occupied: 'primary', maintenance: 'warning', renovation: 'error' }[s] || 'default');

// ── Component ─────────────────────────────────────────────────────────────────
const Units = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = location.pathname.startsWith('/admin');
  const primaryButtonSx = isAdmin ? adminPrimaryButtonSx : ownerPrimaryButtonSx;
  const { units, isLoading, error } = useSelector((s) => s.units);
  const { properties }              = useSelector((s) => s.properties);
  const filterPropertyId = searchParams.get('property_id');
  const filterProperty = filterPropertyId
    ? properties.find((p) => String(p.id) === String(filterPropertyId))
    : null;
  const displayedUnits = filterPropertyId
    ? units.filter((u) => String(u.property_id) === String(filterPropertyId))
    : units;

  const [openDialog,  setOpenDialog]  = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData,    setFormData]    = useState(emptyForm());

  useEffect(() => {
    dispatch(fetchUnits());
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        property_id:    unit.property_id    || '',
        unit_number:    unit.unit_number    || '',
        unit_type:      unit.unit_type      || 'single',
        floor:          unit.floor          ?? '',
        bedrooms:       unit.bedrooms       ?? '',
        bathrooms:      unit.bathrooms      ?? '',
        square_footage: unit.square_footage ?? '',
        monthly_rent:   unit.monthly_rent   || '',
        currency:       unit.currency       || 'UGX',
        status:         unit.status         || 'available',
        description:    unit.description    || '',
        amenities:      unit.amenities      || '',
      });
    } else {
      setEditingUnit(null);
      setFormData({
        ...emptyForm(),
        property_id: filterPropertyId || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'unit_type') {
        if (isCommercial(value)) {
          next.bedrooms = '';
          next.bathrooms = '';
        } else {
          next.square_footage = '';
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const commercial = isCommercial(formData.unit_type);

    const submitData = {
      ...formData,
      floor:          formData.floor          !== '' ? parseInt(formData.floor)              : null,
      bedrooms:       !commercial && formData.bedrooms       !== '' ? parseInt(formData.bedrooms)       : null,
      bathrooms:      !commercial && formData.bathrooms      !== '' ? parseInt(formData.bathrooms)      : null,
      square_footage: commercial  && formData.square_footage !== '' ? parseFloat(formData.square_footage) : null,
      monthly_rent:   parseFloat(formData.monthly_rent),
    };

    const becameAvailable = submitData.status === 'available'
      && (!editingUnit || editingUnit.status !== 'available');

    if (editingUnit) {
      const result = await dispatch(updateUnit({ unitId: editingUnit.id, unitData: submitData }));
      if (!isAdmin && updateUnit.fulfilled.match(result) && result.payload?.listing_request_submitted) {
        showSuccess(
          'Listing request sent',
          'Admins were notified to publish this unit on the marketplace. Track status under Units for rent → Your listing requests.'
        );
      } else if (!isAdmin && becameAvailable && updateUnit.fulfilled.match(result)) {
        showSuccess('Unit updated', 'Unit saved. A listing request is already pending or this unit is already on the marketplace.');
      }
    } else {
      const result = await dispatch(createUnit(submitData));
      if (!isAdmin && createUnit.fulfilled.match(result) && result.payload?.listing_request_submitted) {
        showSuccess(
          'Listing request sent',
          'Admins were notified to publish this unit on the marketplace. Track status under Units for rent → Your listing requests.'
        );
      }
    }
    handleCloseDialog();
  };

  const handleDelete = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      await dispatch(deleteUnit(unitId));
    }
  };

  const columns = [
    { field: 'unit_number',   headerName: 'Unit #',   width: 90 },
    { field: 'property_name', headerName: 'Property', width: 200, flex: 1 },
    {
      field: 'unit_type', headerName: 'Type', width: 165,
      renderCell: (params) => (
        <Chip
          label={params.value?.replace(/_/g, ' ')}
          size="small"
          color={isCommercial(params.value) ? 'warning' : 'info'}
          icon={isCommercial(params.value) ? <Business sx={{ fontSize: 14 }} /> : <MeetingRoom sx={{ fontSize: 14 }} />}
          sx={{ textTransform: 'capitalize', fontSize: 11 }}
        />
      ),
    },
    {
      field: 'bedrooms', headerName: 'Beds', width: 65,
      renderCell: (params) =>
        isCommercial(params.row.unit_type)
          ? <Typography variant="caption" color="text.disabled">N/A</Typography>
          : (params.value ?? '—'),
    },
    {
      field: 'bathrooms', headerName: 'Baths', width: 65,
      renderCell: (params) =>
        isCommercial(params.row.unit_type)
          ? <Typography variant="caption" color="text.disabled">N/A</Typography>
          : (params.value ?? '—'),
    },
    {
      field: 'monthly_rent', headerName: 'Rent / mo', width: 140,
      renderCell: (params) => formatMoney(params.value, params.row.currency || 'UGX'),
    },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusColor(params.value)} size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'actions', type: 'actions', headerName: 'Actions', width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Visibility fontSize="small" />} label="View"   onClick={() => handleOpenDialog(params.row)} showInMenu />,
        <GridActionsCellItem icon={<Edit        fontSize="small" />} label="Edit"   onClick={() => handleOpenDialog(params.row)} showInMenu />,
        <GridActionsCellItem icon={<Delete      fontSize="small" />} label="Delete" onClick={() => handleDelete(params.id)}      showInMenu />,
      ],
    },
  ];

  const commercial = isCommercial(formData.unit_type);
  const availableCount = displayedUnits.filter((u) => u.status === 'available').length;
  const occupiedCount = displayedUnits.filter((u) => u.status === 'occupied').length;
  const rentPotential = displayedUnits.reduce((sum, u) => sum + (parseFloat(u.monthly_rent) || 0), 0);

  const clearPropertyFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('property_id');
    setSearchParams(next);
  };

  const pageContent = (
    <>
      <PageHeader
        variant={isAdmin ? 'admin' : 'owner'}
        title={isAdmin ? 'Internal units' : 'Units'}
        subtitle={isAdmin ? `${units.length} rooms & spaces across properties` : filterProperty ? `Units at ${filterProperty.name}` : undefined}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={primaryButtonSx}
          >
            Add unit
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}

      {!isAdmin && filterPropertyId && (
        <Chip
          label={`Showing units for ${filterProperty?.name || `property #${filterPropertyId}`}`}
          onDelete={clearPropertyFilter}
          color="primary"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" onClick={() => navigate('/owner/property-hub?tab=units-for-rent')}>
            Units for rent
          </Button>
        }>
          When you mark a unit <strong>Available</strong>, CarryIT automatically sends a listing request to admins
          to publish it on the marketplace. Track requests under <strong>Units for rent</strong>.
        </Alert>
      )}

      {isAdmin ? (
        <AdminStatStrip
          loading={isLoading}
          stats={[
            { title: 'Total units', value: units.length, icon: <Apartment />, subtitle: 'All spaces' },
            { title: 'Available', value: availableCount, icon: <CheckCircle />, subtitle: 'Ready for occupancy' },
            { title: 'Occupied', value: occupiedCount, icon: <Home />, subtitle: 'Currently rented' },
            {
              title: 'Rent potential',
              value: formatMoney(rentPotential, 'UGX'),
              icon: <AttachMoney />,
              subtitle: 'If all units filled',
            },
          ]}
        />
      ) : (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <OwnerStatCard title="Total units" value={displayedUnits.length} icon={<Apartment />} variantIndex={0} subtitle="All spaces" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <OwnerStatCard title="Available" value={availableCount} icon={<CheckCircle />} variantIndex={1} subtitle="Ready for occupancy" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <OwnerStatCard title="Occupied" value={occupiedCount} icon={<Home />} variantIndex={2} subtitle="Currently rented" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <OwnerStatCard
              title="Rent potential"
              value={formatMoney(rentPotential, 'UGX')}
              icon={<AttachMoney />}
              variantIndex={0}
              subtitle="If all units filled"
            />
          </Grid>
        </Grid>
      )}

      <OwnerDataGrid
        rows={displayedUnits} columns={columns} loading={isLoading}
        emptyTitle="No units yet"
        emptyDescription={isAdmin ? 'Add internal units to properties for tenant and rent tracking.' : 'Add units to your properties to start managing tenants and rent.'}
        emptyIcon={Apartment} emptyActionLabel="Add unit" onEmptyAction={() => handleOpenDialog()}
      />

      {/* ── Add / Edit Dialog ─────────────────────────────────────────── */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingUnit ? 'Edit unit' : 'Add new unit'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>

              {/* ── Identity ── */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select name="property_id" value={formData.property_id} onChange={handleInputChange} label="Property">
                    {properties.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Unit / Space number" name="unit_number"
                  value={formData.unit_number} onChange={handleInputChange}
                  placeholder="e.g. A1  ·  Office 3B  ·  Shop 12" />
              </Grid>

              {/* ── Space type & Status ── */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Space type</InputLabel>
                  <Select name="unit_type" value={formData.unit_type} onChange={handleInputChange} label="Space type">
                    {UNIT_TYPE_OPTIONS.map(({ group, options }) => [
                      <MenuItem key={`hdr-${group}`} disabled
                        sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', opacity: '1 !important',
                              letterSpacing: 1, textTransform: 'uppercase', pt: 1 }}>
                        {group}
                      </MenuItem>,
                      ...options.map((o) => (
                        <MenuItem key={o.value} value={o.value} sx={{ pl: 3 }}>{o.label}</MenuItem>
                      )),
                    ])}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleInputChange} label="Status">
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="occupied">Occupied</MenuItem>
                    <MenuItem value="maintenance">Under maintenance</MenuItem>
                    <MenuItem value="renovation">Under renovation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* ── RESIDENTIAL fields ─────────────────────────────────── */}
              {!commercial && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Home />} sx={{ py: 0.5 }}>
                      <strong>Residential unit</strong> — specify floor, bedrooms, and bathrooms.
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth type="number" label="Floor" name="floor"
                      value={formData.floor} onChange={handleInputChange}
                      inputProps={{ min: 0 }} helperText="Ground floor = 0" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth required type="number" label="Bedrooms" name="bedrooms"
                      value={formData.bedrooms} onChange={handleInputChange}
                      inputProps={{ min: 0 }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth required type="number" label="Bathrooms" name="bathrooms"
                      value={formData.bathrooms} onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.5 }} />
                  </Grid>
                </>
              )}

              {/* ── COMMERCIAL fields ──────────────────────────────────── */}
              {commercial && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<Business />} sx={{ py: 0.5 }}>
                      <strong>Commercial space</strong> — specify floor and usable area instead of rooms.
                    </Alert>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Floor" name="floor"
                      value={formData.floor} onChange={handleInputChange}
                      inputProps={{ min: 0 }} helperText="Ground floor = 0" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Size (sq ft)" name="square_footage"
                      value={formData.square_footage} onChange={handleInputChange}
                      inputProps={{ min: 0 }} helperText="Total usable area in sq ft" />
                  </Grid>
                </>
              )}

              <Grid item xs={12}><Divider /></Grid>

              {/* ── Shared: rent, description, amenities ── */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Monthly rent" name="monthly_rent"
                  value={formData.monthly_rent} onChange={handleInputChange}
                  inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select name="currency" value={formData.currency} onChange={handleInputChange} label="Currency">
                    {['UGX', 'USD', 'KES', 'TZS', 'RWF', 'EUR', 'GBP'].map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Description" name="description"
                  value={formData.description} onChange={handleInputChange}
                  placeholder={
                    commercial
                      ? 'e.g. Open-plan office with reception area and dedicated parking'
                      : 'e.g. Bright self-contained apartment with garden view'
                  } />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Amenities / Features" name="amenities"
                  value={formData.amenities} onChange={handleInputChange}
                  placeholder={
                    commercial
                      ? 'e.g. Fibre internet, Generator backup, Parking, CCTV, AC'
                      : 'e.g. WiFi, Water, Furnished, Parking, Solar power'
                  } />
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : (editingUnit ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );

  if (isAdmin) {
    return <AdminPage>{pageContent}</AdminPage>;
  }

  return <OwnerPageContainer>{pageContent}</OwnerPageContainer>;
};

export default Units;
