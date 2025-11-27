import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fade,
  Zoom,
  Slide,
  Chip,
  CircularProgress,
  CardMedia,
  Skeleton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person,
  AttachMoney,
  Assessment,
  Message,
  Security,
  CloudUpload,
  Schedule,
  TrendingUp,
  CheckCircle,
  ArrowForward,
  Email,
  Phone,
  Close as CloseIcon,
  Bed,
  Bathtub,
  LocationOn,
  Event as CalendarIcon
} from '@mui/icons-material';
import { Avatar } from '@mui/material';
import axios from 'axios';
import logoImage from '../../assets/images/er13.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rentalUnits, setRentalUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentForm, setAgentForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch rental units on mount
  useEffect(() => {
    const fetchRentalUnits = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://carryit-backend.onrender.com/api/v1/rental-units/public');
        
        // Parse images for each unit
        const unitsWithImages = response.data.map(unit => {
          if (unit.images && typeof unit.images === 'string') {
            unit.images = unit.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
          } else if (!unit.images) {
            unit.images = [];
          }
          return unit;
        });
        
        setRentalUnits(unitsWithImages);
      } catch (error) {
        console.error('Error fetching rental units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalUnits();
  }, []);

  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Property Management',
      description: 'Manage multiple properties and units with ease. Track occupancy, maintenance, and tenant information all in one place.'
    },
    {
      icon: <Person sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Tenant Management',
      description: 'Keep detailed tenant records, track leases, handle applications, and manage tenant communications efficiently.'
    },
    {
      icon: <AttachMoney sx={{ fontSize: 48, color: '#10b981' }} />,
      title: 'Rent Collection',
      description: 'Automate rent collection, track payments, send reminders, and generate invoices with our integrated payment system.'
    },
    {
      icon: <Assessment sx={{ fontSize: 48, color: '#3b82f6' }} />,
      title: 'Financial Reports',
      description: 'Generate comprehensive financial reports, track income and expenses, and get insights into your property performance.'
    },
    {
      icon: <Message sx={{ fontSize: 48, color: '#f59e0b' }} />,
      title: 'Communications Center',
      description: 'Send bulk SMS messages, manage templates, and keep tenants informed about important updates and announcements.'
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#ef4444' }} />,
      title: 'Secure Platform',
      description: 'Bank-level security with encrypted data, role-based access control, and secure authentication for peace of mind.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Properties Managed' },
    { value: '2,000+', label: 'Happy Tenants' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '$10M+', label: 'Rent Collected' }
  ];

  const handleAgentSubmit = (e) => {
    e.preventDefault();
    console.log('Agent application:', agentForm);
    // TODO: Send to backend
    alert('Thank you! We will contact you soon.');
    setAgentForm({ name: '', email: '', phone: '' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ bgcolor: '#f9fafb' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo - Extreme Left */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Avatar
                src={logoImage}
                alt="Easy Rentals Logo"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                variant="rounded"
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '1.25rem'
                }}
              >
                Easy Rentals
              </Typography>
            </Box>

            {/* Menu Items - Extreme Right */}
            {!isMobile ? (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button 
                  onClick={() => navigate('/')}
                  sx={{ 
                    color: '#374151',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { color: '#667eea' }
                  }}
                >
                  Rentals
                </Button>
                <Button 
                  onClick={() => navigate('/airbnb')}
                  sx={{ 
                    color: '#374151',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { color: '#667eea' }
                  }}
                >
                  Airbnb
                </Button>
              </Box>
            ) : (
              <IconButton onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Rentals" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/airbnb'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Airbnb" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Rental Units Display */}
      <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              mb: 1
            }}
          >
            Available Rental Units
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse our selection of quality rental properties
          </Typography>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : rentalUnits.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HomeIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No rental units available at the moment
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {rentalUnits.map((unit, index) => (
              <Grid item xs={12} sm={6} md={4} key={unit.id}>
                <Fade in={true} timeout={600 + (index * 100)}>
                  <Card 
                    sx={{ 
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                      }
                    }}
                    onClick={() => navigate('/rentals')}
                  >
                    {unit.images && unit.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={unit.images[0]}
                        alt={unit.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <HomeIcon sx={{ fontSize: 60, color: '#d1d5db' }} />
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {unit.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#6b7280' }} />
                        <Typography variant="body2" color="text.secondary">
                          {unit.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<Bed sx={{ fontSize: 16 }} />}
                          label={`${unit.bedrooms || 0} Beds`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          icon={<Bathtub sx={{ fontSize: 16 }} />}
                          label={`${unit.bathrooms || 0} Baths`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                          label={`${unit.inspection_bookings_count || 0} Inspections`}
                          size="small"
                          sx={{
                            bgcolor: unit.inspection_bookings_count > 0 ? '#eff6ff' : '#f9fafb',
                            color: unit.inspection_bookings_count > 0 ? '#3b82f6' : '#6b7280',
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: '#667eea',
                          fontWeight: 'bold'
                        }}
                      >
                        ${unit.monthly_rent?.toLocaleString()}/month
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {rentalUnits.length > 6 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/rentals')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                }
              }}
            >
              View All Rentals
            </Button>
          </Box>
        )}
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'white', py: 6, borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Fade in={true} timeout={1000 + (index * 200)}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }} id="features">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Powerful Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to manage your properties efficiently and grow your business
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Zoom in={true} timeout={800 + (index * 100)}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.15)',
                      borderColor: '#667eea'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 }, borderTop: '1px solid #e5e7eb' }} id="pricing">
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Choose the plan that fits your needs
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Starter Plan */}
            <Grid item xs={12} md={4}>
              <Slide direction="up" in={true} timeout={800}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '2px solid #e5e7eb',
                    p: 4,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Starter
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ my: 2 }}>
                    $29
                    <Typography component="span" variant="h6" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Perfect for individual landlords
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {['Up to 5 properties', 'Unlimited tenants', 'Basic reports', 'Email support'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Card>
              </Slide>
            </Grid>

            {/* Professional Plan */}
            <Grid item xs={12} md={4}>
              <Slide direction="up" in={true} timeout={1000}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '3px solid #667eea',
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)',
                    transform: 'scale(1.05)',
                    '&:hover': {
                      transform: 'scale(1.08) translateY(-4px)',
                      boxShadow: '0 16px 40px rgba(102, 126, 234, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 20,
                      bgcolor: '#667eea',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}
                  >
                    POPULAR
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Professional
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ my: 2 }}>
                    $79
                    <Typography component="span" variant="h6" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    For growing property managers
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {['Up to 20 properties', 'Unlimited tenants', 'Advanced reports', 'SMS notifications', 'Priority support', 'Agent management'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Card>
              </Slide>
            </Grid>

            {/* Enterprise Plan */}
            <Grid item xs={12} md={4}>
              <Slide direction="up" in={true} timeout={1200}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '2px solid #e5e7eb',
                    p: 4,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Enterprise
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ my: 2 }}>
                    Custom
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    For large organizations
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {['Unlimited properties', 'Unlimited tenants', 'Custom reports', 'Dedicated support', 'API access', 'Custom integrations'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <CheckCircle sx={{ color: '#764ba2', fontSize: 20 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => scrollToSection('agent')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2
                      }
                    }}
                  >
                    Contact Sales
                  </Button>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Agent Application Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }} id="agent">
        <Fade in={true} timeout={1000}>
          <Card
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: { xs: 4, md: 6 },
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Typography variant="h3" fontWeight={800} gutterBottom textAlign="center">
              Join as an Agent
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 4, opacity: 0.9 }}>
              Help property owners manage their rentals and earn commissions
            </Typography>

            <Box component="form" onSubmit={handleAgentSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={agentForm.name}
                    onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                    required
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={agentForm.email}
                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                    required
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={agentForm.phone}
                    onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                    required
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: '#667eea',
                      fontWeight: 700,
                      py: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Submit Application
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Fade>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1f2937', color: 'white', py: 8 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar
                  src={logoImage}
                  alt="Easy Rentals Logo"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  variant="rounded"
                />
                <Typography variant="h6" fontWeight={700}>
                  Easy Rentals
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                Professional property management software that helps you manage properties, 
                tenants, and finances with ease.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button sx={{ color: 'white', opacity: 0.7, justifyContent: 'flex-start', textTransform: 'none' }}>
                  Features
                </Button>
                <Button sx={{ color: 'white', opacity: 0.7, justifyContent: 'flex-start', textTransform: 'none' }}>
                  Pricing
                </Button>
                <Button sx={{ color: 'white', opacity: 0.7, justifyContent: 'flex-start', textTransform: 'none' }}>
                  Security
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button sx={{ color: 'white', opacity: 0.7, justifyContent: 'flex-start', textTransform: 'none' }}>
                  About Us
                </Button>
                <Button sx={{ color: 'white', opacity: 0.7, justifyContent: 'flex-start', textTransform: 'none' }}>
                  Careers
                </Button>
                <Button sx={{ color: 'white', opacity: 0.7, justifyContent: 'flex-start', textTransform: 'none' }}>
                  Contact
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Email sx={{ fontSize: 20, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    info@easyrentals.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Phone sx={{ fontSize: 20, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    +256 750 371 313
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 6, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2025 Easy Rentals. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

