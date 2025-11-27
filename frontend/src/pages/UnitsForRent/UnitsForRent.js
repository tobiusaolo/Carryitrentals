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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
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
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { unitAPI } from '../../services/api/unitAPI';
import { propertyAPI } from '../../services/api/propertyAPI';
import { agentAPI } from '../../services/api/agentAPI';

const UnitsForRent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rentalUnits, setRentalUnits] = useState([]);
  const [properties, setProperties] = useState([]);
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
    country: 'Uganda',
    unit_type: 'apartment',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    monthly_rent: '',
    currency: 'USD',
    inspection_fee: '',
    status: 'available',
    description: '',
    amenities: '',
    images: '',
    agent_id: ''
  });

  useEffect(() => {
    if (user?.role === 'owner') {
      loadRentalUnits();
      loadProperties();
      loadAgents();
    }
  }, [user]);

  const loadRentalUnits = async () => {
    setLoading(true);
    try {
      // Load rental units for the current owner's properties
      const response = await unitAPI.getRentalUnits();
      setRentalUnits(response.data || []);
    } catch (err) {
      console.error('Failed to load rental units:', err);
      setError('Failed to load rental units');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await propertyAPI.getProperties();
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

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        title: unit.title,
        location: unit.location,
        country: unit.country || 'Uganda',
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
        country: 'Uganda',
        unit_type: 'apartment',
        floor: '',
        bedrooms: '',
        bathrooms: '',
        monthly_rent: '',
        currency: 'USD',
        inspection_fee: '',
        status: 'available',
        description: '',
        amenities: '',
        images: '',
        agent_id: ''
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
    setSelectedImages([]);
    setActiveStep(0);
    // Reset form data
    setFormData({
      title: '',
      location: '',
      unit_type: 'apartment',
      floor: '',
      bedrooms: '',
      bathrooms: '',
      monthly_rent: '',
      currency: 'USD',
      inspection_fee: '',
      status: 'available',
      description: '',
      amenities: '',
      images: '',
      agent_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert File objects to base64 strings
      let imageStrings = [];
      if (selectedImages.length > 0) {
        console.log('Converting images:', selectedImages.length);
        for (const file of selectedImages) {
          if (typeof file === 'string') {
            // Already a string (existing image)
            console.log('Existing image string:', file.substring(0, 50) + '...');
            imageStrings.push(file);
          } else {
            // File object - convert to base64
            console.log('Converting file to base64:', file.name, file.size);
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                console.log('Base64 conversion complete, length:', reader.result.length);
                resolve(reader.result);
              };
              reader.onerror = () => {
                console.error('Base64 conversion failed');
                reject(reader.error);
              };
              reader.readAsDataURL(file);
            });
            imageStrings.push(base64);
          }
        }
        console.log('Final image strings count:', imageStrings.length);
      }

      let unitData = { 
        ...formData,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        monthly_rent: parseFloat(formData.monthly_rent),
        floor: formData.floor ? parseInt(formData.floor) : null,
        agent_id: formData.agent_id ? parseInt(formData.agent_id) : null,
        images: imageStrings.length > 0 ? imageStrings.join('|||IMAGE_SEPARATOR|||') : null
      };
      
      if (editingUnit) {
        // Update existing unit
        await unitAPI.updateRentalUnit(editingUnit.id, unitData);
      } else {
        // Create new rental unit with base64 images
        await unitAPI.createRentalUnit(unitData);
      }
      
      // Success - close dialog and refresh data
      handleCloseDialog();
      await loadRentalUnits(); // Ensure data is refreshed
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Failed to save unit:', err);
      setError(typeof err.response?.data?.detail === 'string' ? err.response.data.detail : 'Failed to save unit');
      // Don't close dialog on error so user can fix and retry
    } finally {
      setLoading(false);
    }
  };

  const handleView = (unit) => {
    console.log('Viewing unit:', unit);
    console.log('Unit images:', unit.images);
    setViewingUnit(unit);
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <ApartmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Units for Rent
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage units available for rent. Add units with detailed information and assign agents for inspections.
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
                  <Typography color="text.secondary">Total Units for Rent</Typography>
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

      {/* Units Table */}
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
                        <IconButton size="small" onClick={() => handleOpenDialog(unit)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Unit">
                        <IconButton size="small" color="error" onClick={() => handleDelete(unit.id)}>
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
          {editingUnit ? 'Edit Unit for Rent' : 'Add New Unit for Rent'}
        </DialogTitle>
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
                    <FormControl fullWidth>
                      <InputLabel>Unit Type</InputLabel>
                      <Select
                        name="unit_type"
                        value={formData.unit_type}
                        onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                      >
                        <MenuItem value="apartment">Apartment</MenuItem>
                        <MenuItem value="house">House</MenuItem>
                        <MenuItem value="studio">Studio</MenuItem>
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
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={selectedImages.length < 5 && !editingUnit}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {editingUnit ? 'Update' : 'Create'} Unit
                  </Button>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
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
                          // If it's already base64 or full URL, return as-is
                          if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
                            return img;
                          }
                          // Legacy file path - convert to URL
                          if (img.startsWith('/')) {
                            const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';
                            return `${apiBaseUrl.replace('/api/v1', '')}${img}`;
                          }
                          // Relative path
                          const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';
                          return `${apiBaseUrl.replace('/api/v1', '')}/uploads/unit_images/${img}`;
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
                                    // Create a new window with the image
                                    const newWindow = window.open();
                                    // Images are stored as base64, use directly or convert legacy paths
                                    const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';
                                    const fullImageUrl = image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://')
                                      ? image 
                                      : image.startsWith('/') 
                                        ? `${apiBaseUrl.replace('/api/v1', '')}${image}`
                                        : `${apiBaseUrl.replace('/api/v1', '')}/uploads/unit_images/${image}`;
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
    </Box>
  );
};

export default UnitsForRent;
