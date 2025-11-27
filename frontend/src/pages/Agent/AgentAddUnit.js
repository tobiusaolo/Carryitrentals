import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Zoom,
  Fade,
  CircularProgress,
  Grow
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteImageIcon,
  Home as HomeIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import NotificationSystem from '../../components/UI/NotificationSystem';
import api from '../../services/api/api';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AgentAddUnit = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [successDialog, setSuccessDialog] = useState(false);
  const [createdUnit, setCreatedUnit] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    country: 'Uganda',
    unit_type: 'one_bedroom',
    floor: '',
    bedrooms: 1,
    bathrooms: 1,
    monthly_rent: '',
    currency: 'USD',
    inspection_fee: '',
    status: 'available',
    description: '',
    amenities: ''
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length < 5) {
      setNotification({
        open: true,
        message: 'Please select at least 5 images',
        severity: 'error'
      });
      return;
    }
    if (selectedImages.length + files.length > 10) {
      setNotification({
        open: true,
        message: 'Maximum 10 images allowed',
        severity: 'error'
      });
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.country || !formData.bedrooms || !formData.bathrooms || !formData.monthly_rent) {
        setNotification({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // Validate monthly_rent is a positive number
      if (parseFloat(formData.monthly_rent) <= 0) {
        setNotification({
          open: true,
          message: 'Monthly rent must be greater than 0',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // Convert File objects to base64 strings
      let imageStrings = [];
      if (selectedImages.length > 0) {
        console.log('Converting images:', selectedImages.length);
        for (const file of selectedImages) {
          if (typeof file === 'string') {
            imageStrings.push(file);
          } else {
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            });
            imageStrings.push(base64);
          }
        }
      }

      // Prepare unit data - match admin form format exactly
      // Don't send agent_id - backend will set it automatically for agents
      // Don't send deposit_amount - backend will use default (0)
      let unitData = { 
        title: formData.title,
        location: formData.location,
        country: formData.country || 'Uganda',
        unit_type: formData.unit_type,
        floor: formData.floor ? parseInt(formData.floor) : null,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        monthly_rent: parseFloat(formData.monthly_rent),
        inspection_fee: parseFloat(formData.inspection_fee) || 0,
        currency: formData.currency,
        status: formData.status,
        description: formData.description || null,
        amenities: formData.amenities || null,
        images: imageStrings.length > 0 ? imageStrings.join('|||IMAGE_SEPARATOR|||') : null
        // Note: agent_id and deposit_amount are NOT included - backend handles them
      };

      console.log('Sending rental unit data:', unitData);
      
      const response = await api.post('/rental-units/', unitData);
      
      setCreatedUnit(response.data);
      setSuccessDialog(true);
    } catch (err) {
      console.error('Failed to save unit:', err);
      
      let errorMessage = 'Failed to save unit';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(d => d.msg || d).join(', ');
        }
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grow in={true} timeout={500}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Add New Unit for Rent
          </Typography>
        </Box>
      </Grow>

      <Fade in={true} timeout={800}>
        <Paper 
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              boxShadow: '0 6px 30px rgba(0,0,0,0.12)'
            }
          }}
        >
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
                <Button onClick={() => navigate('/agent/my-units')}>
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
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={selectedImages.length < 5 || loading}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {loading ? 'Creating...' : 'Create Unit'}
                </Button>
                <Button onClick={handleBack}>
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
        </Paper>
      </Fade>

      {/* Success Confirmation Dialog */}
      <Dialog
        open={successDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            maxWidth: { xs: '90vw', sm: '500px' }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            pt: 4,
            pb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Zoom in={successDialog} timeout={500}>
            <Box>
              <SuccessIcon 
                sx={{ 
                  fontSize: 80, 
                  mb: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  }
                }} 
              />
              <Typography variant="h5" fontWeight="bold">
                Unit Added Successfully!
              </Typography>
            </Box>
          </Zoom>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Fade in={successDialog} timeout={800}>
            <Box>
              <Typography variant="body1" align="center" gutterBottom sx={{ mb: 3 }}>
                Your rental unit has been successfully added to the platform. It's now visible to potential tenants!
              </Typography>
              
              {createdUnit && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Unit Title
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {createdUnit.title}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {createdUnit.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Monthly Rent
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {createdUnit.currency} {createdUnit.monthly_rent?.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>
          </Fade>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setSuccessDialog(false);
              setActiveStep(0);
              setFormData({
                title: '',
                location: '',
                country: 'Uganda',
                unit_type: 'one_bedroom',
                floor: '',
                bedrooms: 1,
                bathrooms: 1,
                monthly_rent: '',
                currency: 'USD',
                inspection_fee: '',
                status: 'available',
                description: '',
                amenities: ''
              });
              setSelectedImages([]);
            }}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Add Another Unit
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setSuccessDialog(false);
              navigate('/agent/my-units');
            }}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            View My Units
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationSystem
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default AgentAddUnit;
