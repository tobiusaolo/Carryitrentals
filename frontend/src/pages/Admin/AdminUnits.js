import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Fab,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
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
import { showSuccess, showError, showWarning, showLoading, closeAlert } from '../../utils/sweetAlert';

const AdminUnits = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rentalUnits, setRentalUnits] = useState([]);
  const [agents, setAgents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [viewingUnit, setViewingUnit] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    unit_type: 'one_bedroom',
    floor: null,
    bedrooms: 1,
    bathrooms: 1,
    monthly_rent: 0,
    currency: 'USD',
    inspection_fee: 0,
    status: 'available',
    description: '',
    amenities: '',
    images: '',
    agent_id: null
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUnits();
      loadAgents();
    }
  }, [user]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      // Load only rental units (admin-added units for rent)
      const rentalUnitsResponse = await unitAPI.getRentalUnits();
      setRentalUnits(rentalUnitsResponse.data || []);
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
      setFormData({
        title: unit.title,
        location: unit.location,
        unit_type: unit.unit_type || 'apartment',
        floor: unit.floor || '',
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        monthly_rent: unit.monthly_rent || unit.rent_amount,
        currency: unit.currency || 'USD',
        inspection_fee: unit.inspection_fee || 0,
        status: unit.status || 'available',
        description: unit.description,
        amenities: unit.amenities || '',
        images: unit.images || '',
        agent_id: unit.agent_id || ''
      });
      const separator = '|||IMAGE_SEPARATOR|||';
      setSelectedImages(unit.images ? unit.images.split(separator).filter(img => img.trim()) : []);
    } else {
      setEditingUnit(null);
      setFormData({
        title: '',
        location: '',
        unit_type: 'one_bedroom',
        floor: null,
        bedrooms: 1,
        bathrooms: 1,
        monthly_rent: 0,
        currency: 'USD',
        inspection_fee: 0,
        status: 'available',
        description: '',
        amenities: '',
        images: '',
        agent_id: null
      });
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
      
      // Validate images - require at least 5 images for new units
      if (!editingUnit && selectedImages.length < 5) {
        closeAlert();
        showWarning('Images Required', 'Please add at least 5 images of the rental unit');
        setError('At least 5 images are required');
        setSubmitting(false);
        return;
      }

      // Separate files (new uploads) from strings (existing images)
      const newImageFiles = selectedImages.filter(img => img instanceof File || img instanceof Blob);
      const existingImageStrings = selectedImages.filter(img => typeof img === 'string');

      // Create unit data WITHOUT images to avoid timeout
      let unitData = { 
        ...formData,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        monthly_rent: parseFloat(formData.monthly_rent),
        floor: formData.floor ? parseInt(formData.floor) : null,
        agent_id: formData.agent_id ? parseInt(formData.agent_id) : null,
        images: null // Don't send images in initial request to avoid timeout
      };

      console.log('Sending rental unit data:', unitData);
      
      let createdUnit;
      if (editingUnit) {
        // Update existing unit
        if (editingUnit.isRentalUnit) {
          createdUnit = await unitAPI.updateRentalUnit(editingUnit.id, unitData);
        } else {
          createdUnit = await unitAPI.updateUnit(editingUnit.id, unitData);
        }
      } else {
        // Create new rental unit WITHOUT images first
        const response = await unitAPI.createRentalUnit(unitData);
        createdUnit = response.data || response;
      }
      
      // Upload images separately using proper file upload endpoint
      if (newImageFiles.length > 0) {
        try {
          console.log('Uploading images separately:', newImageFiles.length);
          const uploadResponse = await unitAPI.uploadRentalUnitImages(
            createdUnit.id || editingUnit.id, 
            newImageFiles
          );
          console.log('Images uploaded successfully:', uploadResponse);
        } catch (uploadErr) {
          console.error('Failed to upload images:', uploadErr);
          // Don't fail the whole operation if image upload fails
          setError('Unit created but image upload failed. Please upload images manually.');
        }
      }
      
      closeAlert();
      
      // Close dialog first, then show success
      handleCloseDialog();
      
      // Wait a bit for dialog to close, then show success and reload
      setTimeout(() => {
        showSuccess(
          'Unit Saved!', 
          editingUnit ? 'The unit has been successfully updated.' : 'New unit has been created successfully.'
        );
        // Reload units after showing success
        loadUnits();
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

  const handleView = (unit) => {
    console.log('Viewing unit:', unit);
    console.log('Unit images:', unit.images);
    setViewingUnit(unit);
  };

  const handleDelete = async (unitId, isRentalUnit = false) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        if (isRentalUnit) {
          await unitAPI.deleteRentalUnit(unitId);
        } else {
          await unitAPI.deleteUnit(unitId);
        }
        loadUnits();
      } catch (err) {
        console.error('Failed to delete unit:', err);
        setError(typeof err.response?.data?.detail === 'string' ? err.response.data.detail : 'Failed to delete unit');
      }
    }
  };

  const handleStatusChange = async (unitId, newStatus) => {
    try {
      console.log('Changing rental status for unit:', unitId, 'to:', newStatus);
      // TODO: Implement status change API call
      // Update local state immediately for better UX
      setRentalUnits(prevUnits => 
        prevUnits.map(unit => 
          unit.id === unitId 
            ? { ...unit, rental_status: newStatus }
            : unit
        )
      );
    } catch (err) {
      setError('Failed to change rental status');
    }
  };

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <ApartmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Units for Rent Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage available rental units in the system. Add, edit, and control rental status of units for rent.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ApartmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{rentalUnits.length}</Typography>
                  <Typography color="text.secondary">Total Units</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {rentalUnits.filter(unit => unit.status === 'available').length}
                  </Typography>
                  <Typography color="text.secondary">Available for Rent</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {rentalUnits.filter(unit => unit.status === 'occupied').length}
                  </Typography>
                  <Typography color="text.secondary">Occupied Units</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rental Units for Rent */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Units for Rent ({rentalUnits.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Unit for Rent
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Rent Amount</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentalUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'success.light' }}>
                          <ApartmentIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{unit.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {unit.bedrooms} bed, {unit.bathrooms} bath
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {unit.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Location: {unit.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {unit.currency || 'USD'} {unit.monthly_rent?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {unit.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {unit.agent_name || 'No Agent'}
                        </Typography>
                        {unit.agent_name && (
                          <Typography variant="caption" color="text.secondary">
                            Assigned Agent
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={unit.status} 
                        color={unit.status === 'available' ? "success" : "warning"}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleView(unit)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Unit">
                        <IconButton size="small" onClick={() => handleOpenDialog({...unit, isRentalUnit: true})}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Unit">
                        <IconButton size="small" color="error" onClick={() => handleDelete(unit.id, true)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
                    <FormControl fullWidth>
                      <InputLabel>Unit Type</InputLabel>
                      <Select
                        name="unit_type"
                        value={formData.unit_type}
                        onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                      >
                        <MenuItem value="single">Single Room</MenuItem>
                        <MenuItem value="double">Double Room</MenuItem>
                        <MenuItem value="studio">Studio</MenuItem>
                        <MenuItem value="semi_detached">Semi-Detached</MenuItem>
                        <MenuItem value="one_bedroom">1 Bedroom</MenuItem>
                        <MenuItem value="two_bedroom">2 Bedroom</MenuItem>
                        <MenuItem value="three_bedroom">3 Bedroom</MenuItem>
                        <MenuItem value="penthouse">Penthouse</MenuItem>
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      required
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
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="occupied">Occupied</MenuItem>
                        <MenuItem value="maintenance">Under Maintenance</MenuItem>
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
                  
                  {selectedImages.length > 0 && (
                    <ImageList sx={{ width: '100%', height: 300 }} cols={3} rowHeight={150}>
                      {selectedImages.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Unit image ${index + 1}`}
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
                        label={`${viewingUnit.images.split('|||IMAGE_SEPARATOR|||').length} Images`}
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
                      {viewingUnit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim()).map((image, index) => {
                        console.log(`Image ${index + 1}:`, image.substring(0, 100) + '...');
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
                              src={image}
                              alt={`Unit image ${index + 1}`}
                              loading="lazy"
                              style={{ 
                                objectFit: 'cover',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease'
                              }}
                              onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                              onError={(e) => {
                                console.error('Image failed to load:', image.substring(0, 100) + '...');
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
                                    // Create a beautiful full-screen image viewer
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
                                            <img src="${image}" />
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
                      })}
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
