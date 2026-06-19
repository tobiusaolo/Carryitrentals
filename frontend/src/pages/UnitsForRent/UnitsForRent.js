import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteImageIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  LocationOn as LocationOnIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { unitAPI } from '../../services/api/unitAPI';
import { propertyAPI } from '../../services/api/propertyAPI';
import { agentAPI } from '../../services/api/agentAPI';
import { RENTAL_STATUS_OPTIONS } from '../../utils/rentalStatus';
import {
  UNIT_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  COUNTRY_OPTIONS,
  emptyRentalFormState,
  isCommercialUnit,
  normalizeUnitType,
} from '../../constants/rentalUnit';
import {
  buildRentalUnitPayload,
  rentalFormFromUnit,
  imagesPayloadFromSelection,
  splitListingImages,
  countListingImages,
  isListingDraft,
  isListingPublished,
  MIN_RENTAL_LISTING_IMAGES,
  formatRentalApiError,
} from '../../utils/rentalUnitForm';
import { normalizeRentalStatus } from '../../utils/rentalStatus';
import PageHeader from '../../components/UI/PageHeader';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerDataTable from '../../components/Owner/OwnerDataTable';
import TableActions from '../../components/UI/TableActions';
import { formatMoney } from '../../utils/formatMoney';
import { colors, ownerPrimaryButtonSx } from '../../theme/designTokens';
import { resolveMediaUrl } from '../../config/api';

const UnitsForRent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [rentalUnits, setRentalUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [internalUnits, setInternalUnits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [viewingUnit, setViewingUnit] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState(emptyRentalFormState());
  const [internalUnitsAll, setInternalUnitsAll] = useState([]);
  const [scrollToPhotos, setScrollToPhotos] = useState(false);
  const photosSectionRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'owner') {
      loadRentalUnits();
      loadProperties();
      loadAgents();
      loadInternalUnits();
    }
  }, [user?.id, user?.role]);

  const loadInternalUnits = async () => {
    try {
      const response = await unitAPI.getUnits();
      setInternalUnitsAll(response.data || []);
    } catch (err) {
      console.error('Failed to load internal units:', err);
    }
  };

  const listedInternalIds = useMemo(
    () => new Set(rentalUnits.map((u) => String(u.internal_unit_id || '')).filter(Boolean)),
    [rentalUnits]
  );

  const unlistedInternalUnits = useMemo(
    () => internalUnitsAll.filter((u) => !listedInternalIds.has(String(u.id))),
    [internalUnitsAll, listedInternalIds]
  );

  const draftListings = useMemo(
    () => rentalUnits.filter((u) => isListingDraft(u)),
    [rentalUnits]
  );

  const publishedListings = useMemo(
    () => rentalUnits.filter((u) => isListingPublished(u)),
    [rentalUnits]
  );

  const loadRentalUnits = async () => {
    setLoading(true);
    try {
      // Load rental units for the current owner's properties
      const response = await unitAPI.getRentalUnits();
      setRentalUnits(
        (response.data || []).map((u) => ({ ...u, status: normalizeRentalStatus(u.status) }))
      );
    } catch (err) {
      console.error('Failed to load rental units:', err);
      setError('Failed to load rental units');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await propertyAPI.getAllProperties();
      setProperties(response.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await agentAPI.getActiveAgents();
      setAgents(response.data || []);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  useEffect(() => {
    const fetchInternalUnits = async () => {
      if (!formData.property_id) {
        setInternalUnits([]);
        return;
      }
      try {
        const res = await unitAPI.getUnits({ property_id: formData.property_id });
        setInternalUnits(res.data || []);
      } catch (err) {
        console.error('Failed to load internal units:', err);
        setInternalUnits([]);
      }
    };
    if (openDialog) {
      fetchInternalUnits();
    }
  }, [formData.property_id, openDialog]);

  const handleOpenDialog = (unit = null, options = {}) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData(rentalFormFromUnit(unit));
      setSelectedImages(splitListingImages(unit.images));
    } else {
      setEditingUnit(null);
      setFormData(emptyRentalFormState());
      setSelectedImages([]);
    }
    setScrollToPhotos(Boolean(options.focusPhotos));
    setDialogError(null);
    setOpenDialog(true);
  };

  const handleCreateFromInternalUnit = (internalUnit) => {
    const prop = properties.find((p) => String(p.id) === String(internalUnit.property_id));
    setEditingUnit(null);
    setFormData({
      ...emptyRentalFormState(),
      property_id: internalUnit.property_id || '',
      internal_unit_id: internalUnit.id || '',
      title: `Unit ${internalUnit.unit_number || ''}`.trim(),
      location: prop ? `${prop.city || ''}${prop.address ? `, ${prop.address}` : ''}`.replace(/^,\s*/, '') : '',
      unit_type: normalizeUnitType(internalUnit.unit_type),
      floor: internalUnit.floor ?? '',
      bedrooms: internalUnit.bedrooms ?? '',
      bathrooms: internalUnit.bathrooms ?? '',
      square_feet: internalUnit.square_footage ?? internalUnit.square_feet ?? '',
      monthly_rent: internalUnit.monthly_rent ?? '',
      currency: internalUnit.currency || 'UGX',
      status: internalUnit.status === 'occupied' ? 'occupied' : 'available',
    });
    setSelectedImages([]);
    setScrollToPhotos(true);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (!openDialog || !scrollToPhotos) return;
    const timer = setTimeout(() => {
      photosSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollToPhotos(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [openDialog, scrollToPhotos]);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const merged = [...selectedImages, ...files];
    if (merged.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    setSelectedImages(merged);
    setError(null);
    event.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
    setSelectedImages([]);
    setFormData(emptyRentalFormState());
    setDialogError(null);
    setSaveStatus('');
    setSaving(false);
  };

  const handleSubmit = async () => {
    setDialogError(null);
    setSaveStatus('');

    if (!formData.property_id) {
      setDialogError('Select a property for this listing.');
      return;
    }
    if (!formData.title?.trim()) {
      setDialogError('Unit title is required.');
      return;
    }
    if (!formData.location?.trim()) {
      setDialogError('Location is required (e.g. Kampala, Nakawa).');
      return;
    }
    const rent = parseFloat(formData.monthly_rent);
    if (!Number.isFinite(rent) || rent <= 0) {
      setDialogError('Enter a valid monthly rent amount.');
      return;
    }
    if (isCommercialUnit(formData.unit_type) && !formData.square_feet) {
      setDialogError('Enter the size in sq ft for commercial listings.');
      return;
    }

    setSaving(true);
    setSaveStatus('Preparing photos…');
    try {
      const images = await imagesPayloadFromSelection(selectedImages);
      const unitData = buildRentalUnitPayload(formData, { images });

      setSaveStatus(editingUnit ? 'Updating listing…' : 'Publishing listing…');
      if (editingUnit) {
        await unitAPI.updateRentalUnit(editingUnit.id, unitData);
      } else {
        await unitAPI.createRentalUnit(unitData);
      }

      handleCloseDialog();
      await loadRentalUnits();
      await loadInternalUnits();
      setError(null);
    } catch (err) {
      console.error('Failed to save unit:', err);
      const message = formatRentalApiError(err);
      setDialogError(message);
      setError(message);
    } finally {
      setSaving(false);
      setSaveStatus('');
    }
  };

  const handleView = (unit) => {
    if (isListingDraft(unit)) {
      handleOpenDialog(unit, { focusPhotos: true });
      return;
    }
    setViewingUnit(unit);
  };

  const handleStatusChange = async (unitId, newStatus) => {
    try {
      await unitAPI.updateRentalUnit(unitId, { status: newStatus });
      setRentalUnits((prev) =>
        prev.map((unit) => (unit.id === unitId ? { ...unit, status: newStatus } : unit))
      );
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Failed to update listing status'
      );
    }
  };

  const handleDelete = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await unitAPI.deleteRentalUnit(unitId);
        // Success - refresh data immediately
        await loadRentalUnits();
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Failed to delete unit:', err);
        setError(typeof err.response?.data?.detail === 'string' ? err.response.data.detail : 'Failed to delete unit');
      }
    }
  };

  if (user?.role !== 'owner') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need owner privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Listings"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={ownerPrimaryButtonSx}>
            Add listing
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Internal units and marketplace listings are separate. Add a listing here to go public — {MIN_RENTAL_LISTING_IMAGES}+ photos required to publish.
      </Alert>

      {unlistedInternalUnits.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => handleCreateFromInternalUnit(unlistedInternalUnits[0])}>
              List first unit
            </Button>
          }
        >
          You have <strong>{unlistedInternalUnits.length}</strong> internal unit(s) not yet on the marketplace
          ({unlistedInternalUnits.map((u) => u.unit_number).join(', ')}).
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard title="Listings" value={rentalUnits.length} icon={<ApartmentIcon />} variantIndex={0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard title="Live on site" value={publishedListings.length} icon={<CheckCircleIcon />} variantIndex={1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard title="Drafts" value={draftListings.length} icon={<ImageIcon />} variantIndex={2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OwnerStatCard title="Not listed yet" value={unlistedInternalUnits.length} icon={<HomeIcon />} variantIndex={3} />
        </Grid>
      </Grid>

      {unlistedInternalUnits.length > 0 && (
        <OwnerDataTable
          title="Internal units — not on marketplace yet"
          subtitle="These exist under Units; create a listing to advertise them publicly."
          columns={[
            {
              id: 'unit_number',
              label: 'Unit #',
              render: (u) => u.unit_number || '—',
            },
            {
              id: 'property',
              label: 'Property',
              render: (u) => properties.find((p) => String(p.id) === String(u.property_id))?.name || '—',
            },
            {
              id: 'status',
              label: 'Internal status',
              render: (u) => (
                <Chip
                  size="small"
                  label={u.status === 'occupied' ? 'Occupied' : 'Available'}
                  color={u.status === 'occupied' ? 'default' : 'success'}
                  variant="outlined"
                />
              ),
            },
            {
              id: 'rent',
              label: 'Rent',
              render: (u) => formatMoney(u.monthly_rent || 0, u.currency || 'UGX'),
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'right',
              render: (u) => (
                <Button size="small" variant="outlined" onClick={() => handleCreateFromInternalUnit(u)}>
                  Create listing
                </Button>
              ),
            },
          ]}
          rows={unlistedInternalUnits}
          searchable={false}
          emptyTitle="All internal units are listed"
        />
      )}

      <Box sx={{ mt: unlistedInternalUnits.length > 0 ? 3 : 0 }}>
      <OwnerDataTable
        title="Marketplace listings"
        subtitle="Drafts stay here only; 5+ photos required to appear on the public rentals page."
        columns={[
          {
            id: 'title',
            label: 'Title',
            render: (unit) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: `${colors.brand}14`, color: colors.brand, width: 36, height: 36 }}>
                  <ApartmentIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{unit.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isCommercialUnit(unit.unit_type) 
                      ? `${unit.square_feet || '—'} sq ft` 
                      : `${unit.bedrooms || '—'} bed · ${unit.bathrooms || '—'} bath`}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            id: 'location',
            label: 'Location',
            render: (unit) => unit.location || '—',
          },
          {
            id: 'rent',
            label: 'Rent',
            render: (unit) => formatMoney(unit.monthly_rent || 0, unit.currency || 'UGX'),
          },
          {
            id: 'agent',
            label: 'Agent',
            render: (unit) => unit.agent_name || 'No agent',
          },
          {
            id: 'marketplace',
            label: 'Marketplace',
            render: (unit) => (
              isListingDraft(unit) ? (
                <Chip
                  size="small"
                  color="warning"
                  label={`Draft · ${countListingImages(unit)}/${MIN_RENTAL_LISTING_IMAGES} photos`}
                  onClick={() => handleOpenDialog(unit, { focusPhotos: true })}
                  sx={{ cursor: 'pointer' }}
                />
              ) : (
                <Chip size="small" color="success" variant="outlined" label="Live" />
              )
            ),
          },
          {
            id: 'status',
            label: 'Rent status',
            render: (unit) => (
              <Tooltip title="Available = accepting viewings. Taken = currently rented (photos kept if you switch back).">
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={unit.status || 'available'}
                    onChange={(e) => handleStatusChange(unit.id, e.target.value)}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    {RENTAL_STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (unit) => (
              <TableActions
                actions={[
                  { icon: <ViewIcon fontSize="small" />, label: 'View details', onClick: () => handleView(unit) },
                  {
                    icon: <EditIcon fontSize="small" />,
                    label: isListingDraft(unit) ? 'Add photos' : 'Edit',
                    onClick: () => handleOpenDialog(unit, { focusPhotos: isListingDraft(unit) }),
                  },
                  { icon: <DeleteIcon fontSize="small" />, label: 'Delete', onClick: () => handleDelete(unit.id), danger: true },
                ]}
              />
            ),
          },
        ]}
        rows={rentalUnits}
        loading={loading}
        emptyTitle="No listings yet"
        emptyDescription="Add a unit for rent to appear on the public marketplace."
        emptyIcon={ApartmentIcon}
        emptyActionLabel="Add listing"
        onEmptyAction={() => handleOpenDialog()}
      />
      </Box>

      {/* Add/Edit Unit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUnit ? 'Edit Unit for Rent' : 'Add New Unit for Rent'}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '75vh' }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDialogError(null)}>
              {dialogError}
            </Alert>
          )}
          {saving && saveStatus && (
            <Alert severity="info" sx={{ mb: 2 }} icon={false}>
              {saveStatus} This can take a minute with several photos.
            </Alert>
          )}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Listing details
          </Typography>
          <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Select Property</InputLabel>
                      <Select
                        name="property_id"
                        value={formData.property_id || ''}
                        label="Select Property"
                        onChange={(e) => {
                          setFormData({ ...formData, property_id: e.target.value, internal_unit_id: '' });
                        }}
                      >
                        {properties.length === 0 ? (
                          <MenuItem disabled value="">No properties — add one under Properties first</MenuItem>
                        ) : (
                          properties.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Internal Unit</InputLabel>
                      <Select
                        name="internal_unit_id"
                        value={formData.internal_unit_id || ''}
                        label="Select Internal Unit"
                        disabled={!formData.property_id}
                        onChange={(e) => {
                          const uId = e.target.value;
                          const selected = internalUnits.find(u => u.id === uId);
                          if (selected) {
                            setFormData({
                              ...formData,
                              internal_unit_id: uId,
                              unit_type: selected.unit_type || formData.unit_type,
                              floor: selected.floor ?? formData.floor,
                              bedrooms: selected.bedrooms ?? formData.bedrooms,
                              bathrooms: selected.bathrooms ?? formData.bathrooms,
                              square_feet: selected.square_footage ?? formData.square_feet,
                              monthly_rent: selected.monthly_rent ?? formData.monthly_rent,
                              currency: selected.currency || formData.currency
                            });
                          } else {
                            setFormData({ ...formData, internal_unit_id: uId });
                          }
                        }}
                      >
                        <MenuItem value="">-- Select a unit (Optional) --</MenuItem>
                        {internalUnits.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            Unit {u.unit_number} {u.status === 'occupied' ? '(Occupied)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Unit Title"
                      name="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="e.g., Modern 2BR Apartment"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                      placeholder="e.g., Kampala, Nakawa"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Country</InputLabel>
                      <Select
                        name="country"
                        value={formData.country}
                        label="Country"
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Unit Type</InputLabel>
                      <Select
                        name="unit_type"
                        value={formData.unit_type}
                        label="Unit Type"
                        onChange={(e) => setFormData({...formData, unit_type: e.target.value, bedrooms: '', bathrooms: '', square_feet: ''})}
                      >
                        {UNIT_TYPE_OPTIONS.map(({ group, options }) => [
                          <MenuItem key={group} disabled sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', opacity: '1 !important', letterSpacing: 1, textTransform: 'uppercase' }}>
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
                    <TextField
                      fullWidth
                      label="Floor"
                      name="floor"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    />
                  </Grid>
                  {/* Residential / Commercial context banner */}
                  <Grid item xs={12}>
                    {isCommercialUnit(formData.unit_type) ? (
                      <Alert severity="warning" icon={false} sx={{ py: 0.75 }}>
                        <strong>Commercial space selected</strong> — enter the usable area in sq ft below. Bedrooms &amp; bathrooms do not apply.
                      </Alert>
                    ) : (
                      <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
                        <strong>Residential unit selected</strong> — enter the number of bedrooms and bathrooms below. To list a shop, office, or warehouse, change the Unit Type above to a commercial option.
                      </Alert>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Monthly Rent"
                      name="monthly_rent"
                      type="number"
                      value={formData.monthly_rent}
                      onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth required>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={formData.currency}
                        label="Currency"
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      >
                        {CURRENCY_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Dynamic Fields based on Unit Type */}
                  {!isCommercialUnit(formData.unit_type) && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Bedrooms"
                          name="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Bathrooms"
                          name="bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                          inputProps={{ min: 0, step: 0.5 }}
                        />
                      </Grid>
                    </>
                  )}
                  {isCommercialUnit(formData.unit_type) && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Size (sq ft)"
                        name="square_feet"
                        type="number"
                        value={formData.square_feet}
                        onChange={(e) => setFormData({...formData, square_feet: e.target.value})}
                        inputProps={{ min: 0 }}
                        helperText="Total usable area in square feet"
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        {RENTAL_STATUS_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Assigned Agent</InputLabel>
                      <Select
                        name="agent_id"
                        value={formData.agent_id}
                        onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                      >
                        <MenuItem value="">No Agent Assigned</MenuItem>
                        {agents.map((agent) => (
                          <MenuItem key={agent.id} value={agent.id}>
                            {agent.name} - {agent.specialization || 'General'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Amenities"
                      name="amenities"
                      multiline
                      rows={2}
                      value={formData.amenities}
                      onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                      placeholder="e.g., Swimming pool, Gym, Parking, Security"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(formData.is_furnished)}
                          onChange={(e) => setFormData({ ...formData, is_furnished: e.target.checked })}
                        />
                      }
                      label="Furnished home"
                    />
                  </Grid>
                </Grid>

          <Typography
            ref={photosSectionRef}
            variant="subtitle2"
            color="text.secondary"
            sx={{ mt: 3, mb: 1 }}
          >
            Photos ({MIN_RENTAL_LISTING_IMAGES}–10 required to go live on public page)
          </Typography>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageSelect}
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} sx={{ mb: 1 }}>
                Add photos
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              {selectedImages.length} selected · JPEG, PNG or GIF · max 10MB each
            </Typography>
            {selectedImages.length > 0 && selectedImages.length < MIN_RENTAL_LISTING_IMAGES && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {MIN_RENTAL_LISTING_IMAGES - selectedImages.length} more photo(s) needed before this listing appears on the public rentals page.
              </Alert>
            )}
            {selectedImages.length > 0 && (
              <ImageList sx={{ width: '100%', height: 280, mt: 1 }} cols={3} rowHeight={140}>
                {selectedImages.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                      alt={`Unit ${index + 1}`}
                      loading="lazy"
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton sx={{ color: 'rgba(255,255,255,0.9)' }} onClick={() => handleRemoveImage(index)}>
                          <DeleteImageIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
            {uploadingImages && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
              </Box>
            )}
            {saving && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : selectedImages.length >= MIN_RENTAL_LISTING_IMAGES
                ? (editingUnit ? 'Save listing' : 'Publish listing')
                : 'Save draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Unit Dialog - World Class Design */}
      <Dialog 
        open={!!viewingUnit} 
        onClose={() => setViewingUnit(null)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexShrink: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ApartmentIcon sx={{ color: 'white' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {viewingUnit?.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {viewingUnit?.location}{viewingUnit?.country ? `, ${viewingUnit.country}` : ''}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          overflow: 'auto',
          flex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          }
        }}>
          {viewingUnit && (
            <Grid container spacing={3}>
              {/* Images Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Unit Images
                </Typography>
                {viewingUnit.images ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Images: {viewingUnit.images.split('|||IMAGE_SEPARATOR|||').length} found
                    </Typography>
                    <ImageList sx={{ 
                      width: '100%', 
                      height: 'auto',
                      minHeight: 300,
                      maxHeight: 600,
                      '& .MuiImageListItem-root': {
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          zIndex: 2,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }
                      }
                    }} cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} rowHeight={200}>
                      {viewingUnit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim()).map((image, index) => {
                        console.log(`Image ${index + 1}:`, image.substring(0, 100) + '...');
                        // Images are stored as base64 strings in Firestore, use directly
                        // If it's not base64 (legacy file path), convert to URL
                        const getImageUrl = (img) => {
                          if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
                            return img;
                          }
                          return resolveMediaUrl(img);
                        };
                        const imageUrl = getImageUrl(image);
                        return (
                          <ImageListItem key={index}>
                            <img
                              src={imageUrl}
                              alt={`Unit image ${index + 1}`}
                              loading="lazy"
                              style={{ objectFit: 'cover' }}
                              onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl.substring(0, 100));
                                e.target.style.display = 'none';
                              }}
                            />
                            <ImageListItemBar
                              title={`Image ${index + 1}`}
                              actionIcon={
                                <IconButton
                                  sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                  onClick={() => {
                                    const newWindow = window.open();
                                    const fullImageUrl = image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://')
                                      ? image
                                      : resolveMediaUrl(image);
                                    newWindow.document.write(`
                                      <html>
                                        <head><title>Unit Image ${index + 1}</title></head>
                                        <body style="margin:0; padding:0; text-align:center;">
                                          <img src="${fullImageUrl}" style="max-width:100%; max-height:100vh;" />
                                        </body>
                                      </html>
                                    `);
                                  }}
                                >
                                  <ViewIcon />
                                </IconButton>
                              }
                            />
                          </ImageListItem>
                        );
                      })}
                    </ImageList>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No images available for this unit
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Unit Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Unit Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Title</Typography>
                    <Typography variant="body1">{viewingUnit.title}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{viewingUnit.location}{viewingUnit.country ? `, ${viewingUnit.country}` : ''}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Unit Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {viewingUnit.unit_type?.replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bedrooms</Typography>
                    <Typography variant="body1">{viewingUnit.bedrooms}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                    <Typography variant="body1">{viewingUnit.bathrooms}</Typography>
                  </Box>
                  {viewingUnit.floor && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Floor</Typography>
                      <Typography variant="body1">{viewingUnit.floor}</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Financial Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Financial Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                    <Typography variant="h6" color="success.main">
                      {viewingUnit.currency || 'USD'} {viewingUnit.monthly_rent?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Deposit Amount</Typography>
                    <Typography variant="body1">
                      {viewingUnit.currency || 'USD'} {viewingUnit.deposit_amount?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={viewingUnit.status} 
                      color={viewingUnit.status === 'available' ? "success" : "warning"}
                      size="small" 
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Description */}
              {viewingUnit.description && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {viewingUnit.description}
                  </Typography>
                </Grid>
              )}

              {/* Amenities */}
              {viewingUnit.amenities && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {viewingUnit.amenities}
                  </Typography>
                </Grid>
              )}

              {/* Agent Information */}
              {viewingUnit.agent_name && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Assigned Agent
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {viewingUnit.agent_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assigned Agent
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          position: 'sticky', 
          bottom: 0, 
          background: 'white', 
          borderTop: '1px solid #e0e0e0',
          flexShrink: 0,
          py: 2,
          px: 3
        }}>
          <Button 
            onClick={() => setViewingUnit(null)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => {
              setViewingUnit(null);
              handleOpenDialog(viewingUnit);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Edit Unit
          </Button>
        </DialogActions>
      </Dialog>
    </OwnerPageContainer>
  );
};

export default UnitsForRent;
