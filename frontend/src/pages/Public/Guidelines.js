import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Home as HomeIcon,
  Menu as MenuIcon,
  AttachMoney,
  CheckCircle,
  Email,
  Phone,
  Business,
  Info,
  Handshake
} from '@mui/icons-material';
import SocialMediaFloatButtons from '../../components/SocialMediaFloatButtons';
import Footer from '../../components/Footer';

// Currency conversion rates (approximate, update as needed)
// Based on approximate exchange rates: 1 USD ≈ 3700 UGX
const CURRENCY_RATES = {
  'UGX': 1, // Base currency
  'KES': 0.033, // 1 UGX = 0.033 KES (approximately 30 UGX = 1 KES)
  'TZS': 0.043, // 1 UGX = 0.043 TZS (approximately 23 UGX = 1 TZS)
  'RWF': 0.036, // 1 UGX = 0.036 RWF (approximately 28 UGX = 1 RWF)
  'BIF': 0.54, // 1 UGX = 0.54 BIF (approximately 1.85 UGX = 1 BIF, based on 1 USD = 3700 UGX = 2000 BIF)
  'SSP': 0.14, // 1 UGX = 0.14 SSP (approximately 7 UGX = 1 SSP, based on 1 USD = 3700 UGX = 500 SSP)
};

const INSPECTION_FEE_UGX = 50000;

// Calculate fees for each currency
const getInspectionFees = () => {
  return [
    { country: 'Uganda', currency: 'UGX', flag: '🇺🇬', fee: INSPECTION_FEE_UGX },
    { country: 'Kenya', currency: 'KES', flag: '🇰🇪', fee: Math.round(INSPECTION_FEE_UGX * CURRENCY_RATES.KES) },
    { country: 'Tanzania', currency: 'TZS', flag: '🇹🇿', fee: Math.round(INSPECTION_FEE_UGX * CURRENCY_RATES.TZS) },
    { country: 'Rwanda', currency: 'RWF', flag: '🇷🇼', fee: Math.round(INSPECTION_FEE_UGX * CURRENCY_RATES.RWF) },
    { country: 'Burundi', currency: 'BIF', flag: '🇧🇮', fee: Math.round(INSPECTION_FEE_UGX * CURRENCY_RATES.BIF) },
    { country: 'South Sudan', currency: 'SSP', flag: '🇸🇸', fee: Math.round(INSPECTION_FEE_UGX * CURRENCY_RATES.SSP) },
  ];
};

const Guidelines = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const inspectionFees = getInspectionFees();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
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
            {/* Logo */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
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

            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
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
                <Button 
                  onClick={() => navigate('/guidelines')}
                  sx={{ 
                    color: '#667eea',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderBottom: '2px solid #667eea'
                  }}
                >
                  Guidelines
                </Button>
              </Box>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <IconButton onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            <ListItem button onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Rentals" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/airbnb'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Airbnb" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/guidelines'); setMobileMenuOpen(false); }}>
              <ListItemText primary="Guidelines" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Info sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Guidelines & Information
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 600, mx: 'auto' }}>
            Everything you need to know about renting, inspections, and listing your property
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Grid container spacing={4}>
          {/* Inspection Fees Section */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '2px solid #667eea', boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AttachMoney sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    Inspection Fees
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    UGX 50,000 per house
                  </Typography>
                </Alert>

                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
                  Each house inspection costs <strong>UGX 50,000</strong>. Below is a breakdown of inspection fees across different countries and currencies:
                </Typography>

                {/* Inspection Fees Chart/Table */}
                <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#667eea' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Country</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Flag</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Currency</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>Inspection Fee</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inspectionFees.map((fee, index) => (
                        <TableRow 
                          key={fee.country}
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' },
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{fee.country}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '1.5rem' }}>{fee.flag}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{fee.currency}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#667eea' }}>
                            {fee.currency} {typeof fee.fee === 'number' ? fee.fee.toLocaleString() : fee.fee}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper sx={{ p: 2, bgcolor: '#f0f4ff', mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom color="primary">
                    💡 Multiple Inspections?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    If you book inspections for <strong>more than one house</strong>, the inspection fees will be further negotiated with the agent.
                  </Typography>
                </Paper>

                <Typography variant="caption" color="text.secondary">
                  * Inspection fees are payable before the inspection date
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Acceptance Fees Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, border: '2px solid #4caf50', boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    Acceptance Fees (Rentals)
                  </Typography>
                </Box>

                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    10% of Initial Payment
                  </Typography>
                </Alert>

                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                  Once you accept to take a house, an acceptance fee will apply. This fee is calculated as <strong>10% of your initial payment</strong>.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: '#e8f5e9', mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom color="success.main">
                    📋 How It's Calculated:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    The acceptance fee is <strong>10% of the total initial payment</strong> you make when accepting the house.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Example 1:</strong> If you pay 3 months rent upfront (e.g., UGX 1,500,000), the acceptance fee = 10% × UGX 1,500,000 = <strong>UGX 150,000</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Example 2:</strong> If you pay 1 month rent upfront (e.g., UGX 500,000), the acceptance fee = 10% × UGX 500,000 = <strong>UGX 50,000</strong>
                  </Typography>
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  * Acceptance fee is calculated based on your initial payment amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Airbnb Fees Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, border: '2px solid #e91e63', boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Handshake sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    Airbnb Service Fee
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="#e91e63">
                    10% of Payment to Host
                  </Typography>
                </Alert>

                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                  For Airbnb bookings, we charge a service fee of <strong>10% of the payment made to the host</strong>.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: '#fce4ec', mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom color="#e91e63">
                    📋 How It's Calculated:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    The service fee is <strong>10% of the total amount paid to the host</strong> for the booking.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Example:</strong> If the total booking amount paid to the host is UGX 1,000,000, the service fee = 10% × UGX 1,000,000 = <strong>UGX 100,000</strong>
                  </Typography>
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  * Service fee applies to all Airbnb bookings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Add Your Property - Rentals */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Business sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    List Your Rental Property
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
                  Want to add your house for rental? Get in touch with our team for further implementation.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Contact Us:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: '#667eea', fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Email:</strong> stuartkevinz852@gmail.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: '#667eea', fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Email:</strong> carryit@gmail.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ color: '#667eea', fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Phone:</strong> +256 754 577 922
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Email />}
                  href="mailto:stuartkevinz852@gmail.com"
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5
                  }}
                >
                  Contact for Rental Listing
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Add Your Property - Airbnb */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Handshake sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700}>
                    List Your Airbnb Property
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
                  Want to add your house for Airbnb? Contact the same offices for further implementation and onboarding.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Contact Us:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: '#e91e63', fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Email:</strong> stuartkevinz852@gmail.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: '#e91e63', fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Email:</strong> carryit@gmail.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ color: '#e91e63', fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Phone:</strong> +256 754 577 922
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Email />}
                  href="mailto:stuartkevinz852@gmail.com"
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5
                  }}
                >
                  Contact for Airbnb Listing
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Important Notes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#fff3e0', border: '2px solid #ff9800' }}>
              <Typography variant="h5" fontWeight={700} gutterBottom color="#e65100">
                ⚠️ Important Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    📋 For Renters:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Inspection fee: UGX 50,000 per house
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Multiple inspections: Fees negotiable with agent
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Acceptance fee: 10% of initial payment (e.g., if paying 3 months upfront, fee is 10% of 3 months)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • All fees must be paid before move-in
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    🏠 For Property Owners:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Contact us to list your rental property
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Contact us to list your Airbnb property
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Professional property management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Secure payment processing
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Contact Section */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 5,
                borderRadius: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                Contact us today for property listings and management services
              </Typography>

              <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Grid item>
                  <Chip
                    icon={<Email sx={{ color: 'white !important' }} />}
                    label="stuartkevinz852@gmail.com"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      py: 2.5,
                      px: 1
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    icon={<Email sx={{ color: 'white !important' }} />}
                    label="carryit@gmail.com"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      py: 2.5,
                      px: 1
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    icon={<Phone sx={{ color: 'white !important' }} />}
                    label="+256 754 577 922"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      py: 2.5,
                      px: 1
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Email />}
                  href="mailto:stuartkevinz852@gmail.com"
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  Send Email
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Phone />}
                  href="tel:+256754577922"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Call Us
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Social Media Buttons */}
      <SocialMediaFloatButtons />

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Guidelines;
