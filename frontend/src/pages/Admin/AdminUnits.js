import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteImageIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { unitAPI } from '../../services/api/unitAPI';
import { agentAPI } from '../../services/api/agentAPI';
import { propertyAPI } from '../../services/api/propertyAPI';
import { showSuccess, showError, showWarning, showLoading, closeAlert } from '../../utils/sweetAlert';
import PageHeader from '../../components/UI/PageHeader';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import { adminPrimaryButtonSx } from '../../theme/designTokens';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import { colors } from '../../theme/designTokens';
import { resolveMediaUrl } from '../../config/api';
import { RENTAL_STATUS_OPTIONS, normalizeRentalStatus } from '../../utils/rentalStatus';
import {
  UNIT_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  COUNTRY_OPTIONS,
  emptyRentalFormState,
  MIN_RENTAL_LISTING_IMAGES,
  isCommercialUnit,
} from '../../constants/rentalUnit';
import {
  buildRentalUnitPayload,
  rentalFormFromUnit,
  imagesPayloadFromSelection,
  splitListingImages,
} from '../../utils/rentalUnitForm';

const AdminUnits = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rentalUnits, setRentalUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [internalUnits, setInternalUnits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [viewingUnit, setViewingUnit] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState(emptyRentalFormState());

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUnits();
      loadAgents();
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      const response = await propertyAPI.getAllProperties();
      setProperties(response.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
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

  const loadUnits = async () => {
    setLoading(true);
    try {
      // Load only rental units (admin-added units for rent)
      const rentalUnitsResponse = await unitAPI.getRentalUnits();
      const units = rentalUnitsResponse.data || [];
      console.log('📥 Loaded rental units:', units.length);
      console.log('📥 Sample unit data:', units[0] ? {
        id: units[0].id,
        title: units[0].title,
        agent_id: units[0].agent_id,
        agent_name: units[0].agent_name,
        full_unit: units[0]
      } : 'No units');
      setRentalUnits(
        units.map((u) => ({ ...u, status: normalizeRentalStatus(u.status) }))
      );
      setError(null);
    } catch (err) {
      console.error('Failed to load rental units:', err);
      // Don't show error for 401s during submission - they're handled elsewhere
      if (err.response?.status !== 401) {
        setError('Failed to load rental units');
      }
    } finally {
      setLoading(false);
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

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData(rentalFormFromUnit(unit));
      setSelectedImages(splitListingImages(unit.images));
    } else {
      setEditingUnit(null);
      setFormData(emptyRentalFormState());
      setSelectedImages([]);
    }
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length < 5) {
      setError('Please select at least 5 images');
      return;
    }
    if (files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    setSelectedImages(files);
    setError(null);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
    setActiveStep(0);
    setSelectedImages([]);
    // Reset form data
    setFormData(emptyRentalFormState());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const loadingAlert = showLoading('Saving unit...', 'Please wait');
    
    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.bedrooms || !formData.bathrooms || !formData.monthly_rent) {
        closeAlert();
        showError('Validation Error', 'Please fill in all required fields');
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Validate monthly_rent is a positive number
      if (parseFloat(formData.monthly_rent) <= 0) {
        closeAlert();
        showError('Validation Error', 'Monthly rent must be greater than 0');
        setError('Monthly rent must be greater than 0');
        setSubmitting(false);
        return;
      }
      
      if (!editingUnit && selectedImages.length < MIN_RENTAL_LISTING_IMAGES) {
        closeAlert();
        showWarning('Images Required', `Please add at least ${MIN_RENTAL_LISTING_IMAGES} images of the rental unit`);
        setError(`At least ${MIN_RENTAL_LISTING_IMAGES} images are required`);
        setSubmitting(false);
        return;
      }

      const imagesString = await imagesPayloadFromSelection(selectedImages);
      const unitData = buildRentalUnitPayload(formData, { images: imagesString });

      console.log('📤 Sending rental unit data:', {
        title: unitData.title,
        location: unitData.location,
        agent_id: unitData.agent_id,
        agent_id_type: typeof unitData.agent_id,
        formData_agent_id: formData.agent_id,
        images: imagesString ? `${imagesString.length} chars (${selectedImages.length} files)` : 'null'
      });
      
      let createdUnit;
      if (editingUnit) {
        // Update existing unit
        if (editingUnit.isRentalUnit) {
          createdUnit = await unitAPI.updateRentalUnit(editingUnit.id, unitData);
        } else {
          createdUnit = await unitAPI.updateUnit(editingUnit.id, unitData);
        }
      } else {
        // Create new rental unit WITH base64 images
        const response = await unitAPI.createRentalUnit(unitData);
        createdUnit = response.data || response;
        
        // Log the actual response structure
        console.log('📦 Full API response object:', response);
        console.log('📦 Response.data:', response.data);
        if (response && response.data) {
          console.log('📦 Response.data.agent_id:', response.data.agent_id, '(type:', typeof response.data.agent_id, ')');
          console.log('📦 Response.data.agent_name:', response.data.agent_name);
          console.log('📦 Response.data keys:', Object.keys(response.data));
        }
      }
      
      console.log('✅ Unit created/updated successfully:', {
        id: createdUnit?.id || createdUnit?.data?.id,
        title: createdUnit?.title || createdUnit?.data?.title,
        agent_id: createdUnit?.agent_id || createdUnit?.data?.agent_id,
        agent_name: createdUnit?.agent_name || createdUnit?.data?.agent_name,
        full_response: createdUnit
      });
      
      closeAlert();
      
      // Close dialog first, then show success
      handleCloseDialog();
      
      // Wait a bit for dialog to close, then show success and reload
      setTimeout(async () => {
        showSuccess(
          'Unit Saved!', 
          editingUnit ? 'The unit has been successfully updated.' : 'New unit has been created successfully.'
        );
        // Reload units after showing success to ensure fresh data
        await loadUnits();
      }, 300);
    } catch (err) {
      console.error('Failed to save unit:', err);
      console.error('Error response:', err.response?.data);
      
      closeAlert();
      
      let errorMessage = 'Failed to save unit';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(d => d.msg || d).join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError('Save Failed', errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (unit) => {
    console.log('Viewing unit:', unit);
    console.log('Unit images:', unit.images);
    
    // Fetch full unit details to ensure we have complete image data
    try {
      const fullUnitResponse = await unitAPI.getRentalUnit(unit.id);
      const fullUnit = fullUnitResponse.data || fullUnitResponse;
      console.log('Full unit data:', fullUnit);
      console.log('Full unit images:', fullUnit.images);
      setViewingUnit(fullUnit);
    } catch (err) {
      console.error('Failed to fetch full unit details:', err);
      // Fallback to using the unit from the list
      setViewingUnit(unit);
    }
  };

  const handleDelete = async (unitId, isRentalUnit = false) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        if (isRentalUnit) {
          await unitAPI.deleteRentalUnit(unitId);
        } else {
          await unitAPI.deleteUnit(unitId);
        }
        // Success - refresh data immediately
        await loadUnits();
        setError(null); // Clear any previous errors
        showSuccess('Unit Deleted!', 'The unit has been successfully deleted.');
      } catch (err) {
        console.error('Failed to delete unit:', err);
        const errorMsg = typeof err.response?.data?.detail === 'string' ? err.response.data.detail : 'Failed to delete unit';
        setError(errorMsg);
        showError('Delete Failed', errorMsg);
      }
    }
  };

  const handleStatusChange = async (unitId, newStatus) => {
    try {
      await unitAPI.updateRentalUnit(unitId, { status: newStatus });
      setRentalUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.id === unitId ? { ...unit, status: newStatus } : unit
        )
      );
      showSuccess('Status updated', newStatus === 'available' ? 'Listing is now available.' : 'Listing marked as taken.');
    } catch (err) {
      const errorMsg =
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Failed to update listing status';
      setError(errorMsg);
      showError('Update failed', errorMsg);
    }
  };

  const handleVerifiedChange = async (unitId, verified) => {
    try {
      await unitAPI.setRentalUnitVerified(unitId, verified);
      setRentalUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.id === unitId ? { ...unit, is_verified: verified } : unit
        )
      );
      showSuccess(
        verified ? 'Listing verified' : 'Verification removed',
        verified
          ? 'This listing will show the Verified badge on the public page.'
          : 'The Verified badge has been removed from the public page.'
      );
    } catch (err) {
      const errorMsg =
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Failed to update listing verification';
      setError(errorMsg);
      showError('Update failed', errorMsg);
    }
  };

  const unitColumns = [
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
          {unit.currency || 'USD'} {unit.monthly_rent?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Details',
      getSearchValue: (row) => row.description || '',
      render: (unit) => (
        <Typography variant="body2">{unit.description}</Typography>
      ),
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
            { icon: <DeleteIcon fontSize="small" />, label: 'Delete Unit', onClick: () => handleDelete(unit.id, true) },
          ]}
        />
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        variant="admin"
        title="Rental units"
        subtitle={`${rentalUnits.length} total · ${rentalUnits.filter((u) => u.status === 'available').length} available`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={adminPrimaryButtonSx}>
            Add unit
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <OwnerStatCard title="Total" value={rentalUnits.length} icon={<ApartmentIcon />} variantIndex={1} />
        </Grid>
        <Grid item xs={6} sm={4}>
          <OwnerStatCard
            title="Available"
            value={rentalUnits.filter((unit) => unit.status === 'available').length}
            icon={<CheckCircleIcon />}
            variantIndex={0}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <OwnerStatCard
            title="Occupied"
            value={rentalUnits.filter((unit) => unit.status === 'occupied').length}
            icon={<PersonIcon />}
            variantIndex={2}
          />
        </Grid>
      </Grid>

      <DataTable
        columns={unitColumns}
        rows={rentalUnits}
        loading={loading}
        title="Public listings"
        emptyTitle="No listings"
        emptyDescription="Add a unit to show on the public site."
        emptyIcon={ApartmentIcon}
        emptyActionLabel="Add unit"
        onEmptyAction={() => handleOpenDialog()}
        searchPlaceholder="Search by title, location, or agent…"
      />

      {/* Add/Edit Unit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUnit ? 'Edit Unit' : 'Add New Unit for Rent'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Unit Information</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Property (Optional for Admin)</InputLabel>
                      <Select
                        name="property_id"
                        value={formData.property_id || ''}
                        label="Select Property (Optional for Admin)"
                        onChange={(e) => {
                          setFormData({ ...formData, property_id: e.target.value, internal_unit_id: '' });
                        }}
                      >
                        <MenuItem value="">-- No Property --</MenuItem>
                        {properties.map((p) => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
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
                        <MenuItem value="Uganda">Uganda</MenuItem>
                        <MenuItem value="Kenya">Kenya</MenuItem>
                        <MenuItem value="Tanzania">Tanzania</MenuItem>
                        <MenuItem value="Rwanda">Rwanda</MenuItem>
                        <MenuItem value="Burundi">Burundi</MenuItem>
                        <MenuItem value="South Sudan">South Sudan</MenuItem>
                        <MenuItem value="Ethiopia">Ethiopia</MenuItem>
                        <MenuItem value="Somalia">Somalia</MenuItem>
                        <MenuItem value="Djibouti">Djibouti</MenuItem>
                        <MenuItem value="Eritrea">Eritrea</MenuItem>
                        <MenuItem value="Sudan">Sudan</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
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
                        <strong>Commercial space selected</strong> — enter the usable area (sq ft) below. Bedrooms &amp; bathrooms do not apply.
                      </Alert>
                    ) : (
                      <Alert severity="info" icon={false} sx={{ py: 0.75 }}>
                        <strong>Residential unit selected</strong> — enter bedrooms and bathrooms below. To list a shop, office, or warehouse, change Unit Type above.
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
                        <MenuItem value="USD">USD - US Dollar</MenuItem>
                        <MenuItem value="UGX">UGX - Ugandan Shilling</MenuItem>
                        <MenuItem value="KES">KES - Kenyan Shilling</MenuItem>
                        <MenuItem value="TZS">TZS - Tanzanian Shilling</MenuItem>
                        <MenuItem value="RWF">RWF - Rwandan Franc</MenuItem>
                        <MenuItem value="EUR">EUR - Euro</MenuItem>
                        <MenuItem value="GBP">GBP - British Pound</MenuItem>
                        <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                        <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                        <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                        <MenuItem value="CNY">CNY - Chinese Yuan</MenuItem>
                        <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                        <MenuItem value="ZAR">ZAR - South African Rand</MenuItem>
                        <MenuItem value="NGN">NGN - Nigerian Naira</MenuItem>
                        <MenuItem value="EGP">EGP - Egyptian Pound</MenuItem>
                        <MenuItem value="MAD">MAD - Moroccan Dirham</MenuItem>
                        <MenuItem value="GHS">GHS - Ghanaian Cedi</MenuItem>
                        <MenuItem value="ETB">ETB - Ethiopian Birr</MenuItem>
                        <MenuItem value="BWP">BWP - Botswana Pula</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Inspection Fee"
                      name="inspection_fee"
                      type="number"
                      value={formData.inspection_fee}
                      onChange={(e) => setFormData({...formData, inspection_fee: e.target.value})}
                      required
                    />
                  </Grid>
                  {/* Dynamic Fields based on Unit Type */}
                  {!isCommercialUnit(formData.unit_type) && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Bedrooms"
                          name="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                          required
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12} sm={8}>
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
                        value={formData.agent_id || ''}
                        onChange={(e) => {
                          const selectedAgentId = e.target.value === '' ? null : e.target.value;
                          console.log('Agent selected:', selectedAgentId, 'from value:', e.target.value);
                          setFormData({...formData, agent_id: selectedAgentId});
                        }}
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
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                  <Button onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                </Box>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Upload Images (5-10 images required)</StepLabel>
              <StepContent>
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
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Select Images
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please select 5-10 images of the unit. Images should show different angles and rooms.
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Image Format Tip:</strong> Accepted formats are JPEG, JPG, PNG, or GIF. Maximum file size is 10MB per image.
                    </Typography>
                  </Alert>
                  
                  {selectedImages.length > 0 && (
                    <ImageList sx={{ width: '100%', height: 300 }} cols={3} rowHeight={150}>
                      {selectedImages.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Unit ${index + 1}`}
                            loading="lazy"
                          />
                          <ImageListItemBar
                            actionIcon={
                              <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                onClick={() => handleRemoveImage(index)}
                              >
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
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Uploading images...
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {submitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        {editingUnit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      `${editingUnit ? 'Update' : 'Create'} Unit`
                    )}
                  </Button>
                  <Button type="button" onClick={handleBack}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        </form>
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          px: 4,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: 3, 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <ApartmentIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {viewingUnit?.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOnIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    {viewingUnit?.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton 
              onClick={() => setViewingUnit(null)}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { 
                  background: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 0, 
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
            <Box>
              {/* Hero Images Section */}
              {viewingUnit.images ? (
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)',
                    p: 4,
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 2,
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ImageIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a202c', mb: 0.5 }}>
                            Unit Gallery
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            High-quality images showcasing the property
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={`${viewingUnit.images && typeof viewingUnit.images === 'string' ? viewingUnit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim()).length : 0} Images`}
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          px: 2,
                          py: 1
                        }}
                      />
                    </Box>
                    
                  <ImageList 
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      minHeight: 400,
                      maxHeight: 800,
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      '& .MuiImageListItem-root': {
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          zIndex: 2,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }
                      }
                    }} 
                    cols={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                    rowHeight={250}
                  >
                      {viewingUnit.images && typeof viewingUnit.images === 'string' 
                        ? viewingUnit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim()).map((image, index) => {
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
                          <ImageListItem 
                            key={index}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'scale(1.03)',
                                zIndex: 2,
                                '& .MuiImageListItemBar-root': {
                                  opacity: 1
                                }
                              }
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`Unit ${index + 1}`}
                              loading="lazy"
                              style={{ 
                                objectFit: 'cover',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease'
                              }}
                              onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl);
                                e.target.style.display = 'none';
                              }}
                            />
                            <ImageListItemBar
                              title={`Image ${index + 1}`}
                              subtitle="Click to view full size"
                              sx={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
                                borderRadius: '0 0 12px 12px',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                              }}
                              actionIcon={
                                <IconButton
                                  sx={{ 
                                    color: 'white',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    '&:hover': { 
                                      background: 'rgba(255,255,255,0.3)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                  onClick={() => {
                                    const fullImageUrl = image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://')
                                      ? image
                                      : resolveMediaUrl(image);
                                    const newWindow = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
                                    newWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>${viewingUnit.title} - Image ${index + 1}</title>
                                          <style>
                                            * { margin: 0; padding: 0; box-sizing: border-box; }
                                            body { 
                                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                              display: flex;
                                              align-items: center;
                                              justify-content: center;
                                              min-height: 100vh;
                                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                              padding: 20px;
                                            }
                                            .container {
                                              background: white;
                                              border-radius: 20px;
                                              padding: 30px;
                                              box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                                              max-width: 90vw;
                                              max-height: 90vh;
                                              display: flex;
                                              flex-direction: column;
                                              align-items: center;
                                              text-align: center;
                                            }
                                            .title {
                                              margin-bottom: 20px;
                                              color: #333;
                                              font-size: 24px;
                                              font-weight: 600;
                                            }
                                            img { 
                                              max-width: 100%; 
                                              max-height: 70vh; 
                                              border-radius: 12px;
                                              box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                                              transition: transform 0.3s ease;
                                            }
                                            img:hover { transform: scale(1.02); }
                                            .close-btn {
                                              margin-top: 20px;
                                              padding: 12px 24px;
                                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                              color: white;
                                              border: none;
                                              border-radius: 8px;
                                              cursor: pointer;
                                              font-size: 16px;
                                              font-weight: 500;
                                              transition: all 0.3s ease;
                                            }
                                            .close-btn:hover {
                                              transform: translateY(-2px);
                                              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="container">
                                            <div class="title">${viewingUnit.title} - Image ${index + 1}</div>
                                            <img src="${fullImageUrl}" />
                                            <button class="close-btn" onclick="window.close()">Close</button>
                                          </div>
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
                      }).filter(Boolean)
                        : []
                      }
                    </ImageList>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 12,
                  background: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ 
                    background: 'rgba(255,255,255,0.8)', 
                    borderRadius: 4, 
                    p: 6, 
                    display: 'inline-block',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }}>
                    <ImageIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 3 }} />
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      No Images Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Images haven't been uploaded for this unit yet
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Content Section */}
              <Box sx={{ p: 5, background: '#fafbfc' }}>
                <Grid container spacing={4}>
                  {/* Unit Details Card */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 4,
                      p: 4,
                      color: 'white',
                      mb: 3,
                      boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 100,
                        height: 100,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                      }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
                        <InfoIcon />
                        Unit Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Title</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewingUnit.title}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Location</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewingUnit.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Unit Type</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {viewingUnit.unit_type?.replace('_', ' ')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Bedrooms</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewingUnit.bedrooms}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Bathrooms</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewingUnit.bathrooms}</Typography>
                        </Box>
                        {viewingUnit.floor && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Floor</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewingUnit.floor}</Typography>
                          </Box>
                        )}
                        {viewingUnit.square_feet && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Square Feet</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewingUnit.square_feet} sq ft</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Financial Information Card */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: 4,
                      p: 4,
                      color: 'white',
                      mb: 3,
                      boxShadow: '0 15px 35px rgba(240, 147, 251, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 80,
                        height: 80,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                      }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
                        <AttachMoneyIcon />
                        Financial Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Monthly Rent</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffd700' }}>
                            {viewingUnit.currency || 'USD'} {viewingUnit.monthly_rent?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Deposit Amount</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {viewingUnit.currency || 'USD'} {viewingUnit.deposit_amount?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>Status</Typography>
                          <Chip 
                            label={viewingUnit.status} 
                            sx={{
                              background: viewingUnit.status === 'available' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                              color: viewingUnit.status === 'available' ? '#22c55e' : '#fbbf24',
                              fontWeight: 600,
                              border: `1px solid ${viewingUnit.status === 'available' ? '#22c55e' : '#fbbf24'}`
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Description Card */}
                  {viewingUnit.description && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: 4,
                        p: 4,
                        color: 'white',
                        mb: 3,
                        boxShadow: '0 15px 35px rgba(79, 172, 254, 0.3)'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <DescriptionIcon />
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: 0.95, fontSize: '1.1rem' }}>
                          {viewingUnit.description}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Amenities Card */}
                  {viewingUnit.amenities && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        borderRadius: 4,
                        p: 4,
                        color: 'white',
                        mb: 3,
                        boxShadow: '0 15px 35px rgba(67, 233, 123, 0.3)'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <StarIcon />
                          Amenities
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: 0.95, fontSize: '1.1rem' }}>
                          {viewingUnit.amenities}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Agent Information Card */}
                  {viewingUnit.agent_name && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        borderRadius: 4,
                        p: 4,
                        color: 'white',
                        boxShadow: '0 15px 35px rgba(250, 112, 154, 0.3)'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <PersonIcon />
                          Assigned Agent
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Avatar sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            width: 60, 
                            height: 60,
                            border: '2px solid rgba(255,255,255,0.3)'
                          }}>
                            <PersonIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {viewingUnit.agent_name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                              Professional Property Agent
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}
          
          {/* Floating Back to Top Button */}
          <IconButton
            onClick={() => {
              const dialogContent = document.querySelector('.MuiDialogContent-root');
              if (dialogContent) {
                dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 30,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
              },
              transition: 'all 0.3s ease',
              zIndex: 1000
            }}
          >
            <ArrowUpIcon />
          </IconButton>
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
            startIcon={<CloseIcon />}
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
    </Box>
  );
};

export default AdminUnits;
