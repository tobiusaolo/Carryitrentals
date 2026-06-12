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
  Button,
  Divider,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  alpha,
  List
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  Email,
  Phone,
  Business,
  Info,
  Handshake,
  ArrowForward,
} from '@mui/icons-material';
import SocialMediaFloatButtons from '../../components/SocialMediaFloatButtons';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/Navigation/PublicHeader';
import { useViewerCurrency } from '../../contexts/ViewerCurrencyContext';
import { RATES_FROM_UGX, VIEWER_REGIONS, convertAmount } from '../../config/currencyLocale';

import { DEFAULT_INSPECTION_FEE_UGX as INSPECTION_FEE_UGX } from '../../constants/rentalUnit';

const EAST_AFRICA_CURRENCIES = ['UGX', 'KES', 'TZS', 'RWF', 'BIF', 'SSP'];

const getInspectionFees = () =>
  VIEWER_REGIONS.filter((r) => EAST_AFRICA_CURRENCIES.includes(r.currency)).map((r) => ({
    country: r.country,
    currency: r.currency,
    flag: r.flag,
    fee: Math.round(INSPECTION_FEE_UGX * (RATES_FROM_UGX[r.currency] || 1)),
  }));

const Guidelines = () => {
  const navigate = useNavigate();
  const { viewerCountry, displayCurrency, formatMoney } = useViewerCurrency();
  const inspectionFees = getInspectionFees();
  const viewerInspectionFee = convertAmount(INSPECTION_FEE_UGX, 'UGX', displayCurrency);
  const standardFeeDisplay = formatMoney(INSPECTION_FEE_UGX, 'UGX');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      {/* Hero Section - World Class Immersive */}
      <Box
        sx={{
          background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 10, md: 20 },
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 900, 
                  fontSize: { xs: '3rem', md: '5rem' }, 
                  lineHeight: 1, 
                  mb: 2,
                  letterSpacing: '-0.04em'
                }}
              >
                Simple, Reliable,<br/>Transparent.
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', fontWeight: 400, mb: 4, fontSize: '1.25rem' }}>
                Everything you need to know about navigating the CarryIT platform as a tenant or property owner.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: '#ff385c', 
                  color: 'white', 
                  borderRadius: '12px', 
                  px: 4, 
                  py: 2, 
                  fontWeight: 800,
                  fontSize: '1rem',
                  '&:hover': { bgcolor: '#e31c5f' }
                }}
                onClick={() => navigate('/rentals')}
              >
                Browse Listings
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 12, flex: 1 }}>
        <Grid container spacing={8}>

          {/* Trust & Safety — market-driven (vs Jiji/Facebook scams) */}
          <Grid item xs={12}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', mb: 2 }}>Trust & Safety</Typography>
              <Typography variant="body1" sx={{ color: '#717171', fontSize: '1.1rem', maxWidth: 720, mx: 'auto' }}>
                CarryIT is built to fix what tenants hate on open classifieds: fake listings, bait prices, and pay-before-viewing scams.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {[
                { title: 'NIN-verified agents', body: 'Every listing is tied to an agent with national ID on file — not anonymous posters.' },
                { title: 'View before rent', body: 'You book a viewing first. Monthly rent and deposit are only discussed after you see the property.' },
                { title: 'Transparent fees', body: 'Rent, deposit, and viewing fees are shown on every listing — no bait-and-switch at the gate.' },
                { title: 'Report abuse', body: 'Flag fake, duplicate, or misleading ads. We review reports within 48 hours.' },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.title}>
                  <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: '20px', border: '1px solid #EBEBEB' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.body}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Alert severity="warning" sx={{ mt: 4, borderRadius: '16px', textAlign: 'left' }}>
              <strong>Red flags anywhere online:</strong> price far below market, agent demands Mobile Money before viewing, stock photos, or “already taken” when you arrive. On CarryIT, report the listing immediately.
            </Alert>
          </Grid>
          
          {/* Inspection Fees - Dimensional Layout */}
          <Grid item xs={12}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', mb: 2 }}>Inspection Services</Typography>
              <Typography variant="body1" sx={{ color: '#717171', fontSize: '1.1rem' }}>Transparent pricing for physical and virtual property viewings across East Africa.</Typography>
            </Box>
            
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: '24px',
                    border: '1px solid #EBEBEB',
                    bgcolor: alpha('#F7F7F7', 0.5),
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Standard Viewing Fee</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: '#ff385c' }}>
                      {standardFeeDisplay.primary}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#717171' }}>/ property</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#717171', mb: 3 }}>
                    For {viewerCountry}, fees display in {displayCurrency} ({displayCurrency} {viewerInspectionFee.toLocaleString()}).
                  </Typography>
                  <List sx={{ mb: 4 }}>
                    {['Physical showing by agent', 'Virtual video-call tours', 'Verified unit checklist', 'Instant feedback report'].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{item}</Typography>
                      </Box>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={7}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid #EBEBEB', overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F7F7F7' }}>
                        <TableCell sx={{ fontWeight: 800, py: 2.5 }}>Region</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>Currency</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>Local Fee</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inspectionFees.map((fee) => (
                        <TableRow key={fee.country} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ fontSize: '1.5rem' }}>{fee.flag}</Typography>
                              {fee.country}
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#717171', fontWeight: 600 }}>{fee.currency}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                            {fee.currency} {fee.fee.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Grid>

          {/* Service Fees - Card Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '24px', p: 2, border: '1px solid #EBEBEB', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3, color: '#ff385c' }}><CheckCircle sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Rental Acceptance</Typography>
                <Typography variant="body1" sx={{ color: '#717171', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  A one-time service fee of **10% of the initial payment** is required upon successful rental agreement. This covers legal documentation and move-in coordination.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#222' }}>
                  Example: 3 months payment of UGX 1.5M = UGX 150,000 fee.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '24px', p: 2, border: '1px solid #EBEBEB', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3, color: '#ff385c' }}><Handshake sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Airbnb Service</Typography>
                <Typography variant="body1" sx={{ color: '#717171', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  For vacation and short-term stays, we charge a standard **10% service fee** integrated into the booking price. No hidden costs for guests.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#222' }}>
                  This fee helps us maintain 24/7 guest support and platform security.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA Section */}
        <Box 
          sx={{ 
            mt: 12, 
            p: { xs: 4, md: 8 }, 
            borderRadius: '32px', 
            bgcolor: '#222', 
            color: 'white', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2.5rem', md: '4rem' } }}>Own a Property?</Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, mb: 6, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
              Join the fastest growing property management ecosystem in East Africa. List your first unit for free today.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ bgcolor: '#FFF', color: '#222', fontWeight: 800, px: 6, py: 2, borderRadius: '12px', '&:hover': { bgcolor: '#F7F7F7' } }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                endIcon={<ArrowForward />}
                sx={{ color: '#FFF', borderColor: '#FFF', fontWeight: 800, px: 6, py: 2, borderRadius: '12px', '&:hover': { borderColor: '#F7F7F7', bgcolor: 'rgba(255,255,255,0.1)' } }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', zIndex: 1 }} />
        </Box>
      </Container>

      <SocialMediaFloatButtons />
      <Footer />
    </Box>
  );
};

export default Guidelines;
