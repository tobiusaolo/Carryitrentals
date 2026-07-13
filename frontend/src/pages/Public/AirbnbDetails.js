import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Bed,
  Bathtub,
  Home,
  Share,
  FavoriteBorder,
} from '@mui/icons-material';
import axios from 'axios';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';
import DisplayPrice from '../../components/Public/DisplayPrice';
import WatermarkedImage from '../../components/Public/WatermarkedImage';
import { COUNTRY_OPTIONS, calculateStayTotal, getAirbnbPropertyTypeLabel } from '../../constants/airbnb';
import {
  validateAirbnbBooking,
  buildAirbnbBookingPayload,
  canReserveListing,
} from '../../utils/airbnbBooking';
import { API_BASE_URL } from '../../config/api';

const emptyBookingForm = () => ({
  guest_name: '',
  guest_email: '',
  guest_phone: '',
  guest_country: 'Uganda',
  check_in: '',
  check_out: '',
  number_of_guests: 1,
  special_requests: '',
});

const AirbnbDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [airbnb, setAirbnb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState(emptyBookingForm());
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const listingCurrency = airbnb?.currency || 'UGX';
  const canReserve = canReserveListing(airbnb);
  const stayQuote = useMemo(
    () => calculateStayTotal(airbnb?.price_per_night, bookingForm.check_in, bookingForm.check_out),
    [airbnb?.price_per_night, bookingForm.check_in, bookingForm.check_out]
  );

  useEffect(() => {
    loadAirbnb();
  }, [id]);

  const loadAirbnb = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/airbnb/public`);
      const foundAirbnb = response.data.find((a) => String(a.id) === String(id));

      if (foundAirbnb) {
        if (foundAirbnb.images && typeof foundAirbnb.images === 'string') {
          foundAirbnb.images = foundAirbnb.images.split('|||IMAGE_SEPARATOR|||').filter((img) => img.trim());
        } else if (!foundAirbnb.images) {
          foundAirbnb.images = [];
        }
        foundAirbnb.property_type = foundAirbnb.property_type || 'entire_apartment';
        setAirbnb(foundAirbnb);
      } else {
        setSnackbar({ open: true, message: 'Stay not found', severity: 'error' });
        setTimeout(() => navigate('/airbnb'), 2000);
      }
    } catch (error) {
      console.error('Error loading airbnb:', error);
      setSnackbar({ open: true, message: 'Could not load this stay', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    const errors = validateAirbnbBooking(bookingForm, airbnb);
    if (errors.length) {
      setSnackbar({ open: true, message: errors[0], severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = buildAirbnbBookingPayload(bookingForm, airbnb.id);
      const { data: booking } = await axios.post(`${API_BASE_URL}/airbnb/bookings`, bookingData);
      setSnackbar({
        open: true,
        message: 'Request sent! Pay your prepayment to confirm your stay.',
        severity: 'success',
      });
      setBookingDialog(false);
      setBookingForm(emptyBookingForm());
      if (booking?.id && Number(booking.prepayment_amount) > 0) {
        setTimeout(() => navigate(`/airbnb/payment/${booking.id}`), 1200);
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : 'Failed to send booking request.';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatSidebarDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Add date';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={5} color="secondary" />
      </Box>
    );
  }

  if (!airbnb) return null;

  const images = airbnb.images?.length ? airbnb.images : ['https://via.placeholder.com/800x600?text=No+Image'];

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      <PublicHeader />

      <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/airbnb')} sx={{ mb: 2, fontWeight: 600 }}>
          Back to short stays
        </Button>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                gridTemplateRows: { xs: 'auto', md: '200px 200px' },
                gap: 1,
                borderRadius: 3,
                overflow: 'hidden',
                height: { md: 400 },
              }}
            >
              <WatermarkedImage
                src={images[0]}
                alt={airbnb.title}
                wrapperSx={{ gridRow: { md: 'span 2' }, width: '100%', height: '100%' }}
              />
              {images.slice(1, 3).map((img, i) => (
                <WatermarkedImage key={i} src={img} alt="" wrapperSx={{ width: '100%', height: '100%' }} />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {airbnb.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body1" color="text.secondary">
                {airbnb.location}
                {airbnb.country ? `, ${airbnb.country}` : ''}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Chip label={getAirbnbPropertyTypeLabel(airbnb.property_type)} color="primary" variant="outlined" />
              <Chip icon={<Home />} label={`${airbnb.bedrooms || 0} bedrooms`} />
              <Chip icon={<Bathtub />} label={`${airbnb.bathrooms || 0} baths`} />
              <Chip icon={<Bed />} label={`Up to ${airbnb.max_guests || 1} guests`} />
              {!canReserve && (
                <Chip label="Not accepting bookings" color="warning" variant="outlined" />
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              About this stay
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {airbnb.description || 'No description provided.'}
            </Typography>

            {airbnb.amenities && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Amenities
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {airbnb.amenities}
                </Typography>
              </>
            )}

            {airbnb.house_rules && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  House rules
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {airbnb.house_rules}
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #ddd', borderRadius: 3, position: 'sticky', top: 24 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                <DisplayPrice
                  amount={airbnb.price_per_night}
                  listingCurrency={listingCurrency}
                  variant="h4"
                  showSecondary={false}
                />
                <Typography variant="body1" color="text.secondary">
                  / night
                </Typography>
              </Box>

              <Box sx={{ border: '1px solid #B0B0B0', borderRadius: '8px', mb: 3 }}>
                <Grid container>
                  <Grid item xs={6} sx={{ p: 1.5, borderRight: '1px solid #B0B0B0', borderBottom: '1px solid #B0B0B0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      CHECK-IN
                    </Typography>
                    <Typography variant="body2">{formatSidebarDate(bookingForm.check_in)}</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ p: 1.5, borderBottom: '1px solid #B0B0B0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      CHECK-OUT
                    </Typography>
                    <Typography variant="body2">{formatSidebarDate(bookingForm.check_out)}</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      GUESTS
                    </Typography>
                    <Typography variant="body2">
                      {bookingForm.number_of_guests || 1} guest
                      {airbnb.max_guests ? ` (max ${airbnb.max_guests})` : ''}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setBookingDialog(true)}
                disabled={!canReserve}
                sx={{
                  py: 1.5,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  bgcolor: '#ff385c',
                  '&:hover': { bgcolor: '#e31c5f' },
                }}
              >
                {!canReserve ? 'Unavailable' : 'Request to book'}
              </Button>

              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                No payment now — host confirms first
              </Typography>

              {stayQuote.nights > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {stayQuote.nights} night{stayQuote.nights !== 1 ? 's' : ''} × nightly rate
                    </Typography>
                    <DisplayPrice
                      amount={stayQuote.total}
                      listingCurrency={listingCurrency}
                      variant="body2"
                      showSecondary={false}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      Estimated total
                    </Typography>
                    <DisplayPrice
                      amount={stayQuote.total}
                      listingCurrency={listingCurrency}
                      variant="body1"
                      showSecondary={false}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Taxes and prepayment (if any) confirmed by host
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={bookingDialog}
        onClose={() => setBookingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
          Request reservation
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Submit your dates and contact details. The host will <strong>confirm or decline</strong> before any
            payment. A 50% prepayment may be required after confirmation.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {airbnb.title} · max {airbnb.max_guests} guests
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Full name"
                value={bookingForm.guest_name}
                onChange={(e) => setBookingForm({ ...bookingForm, guest_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={bookingForm.guest_email}
                onChange={(e) => setBookingForm({ ...bookingForm, guest_email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone (WhatsApp)"
                value={bookingForm.guest_phone}
                onChange={(e) => setBookingForm({ ...bookingForm, guest_phone: e.target.value })}
                placeholder="+256…"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Your country</InputLabel>
                <Select
                  value={bookingForm.guest_country}
                  label="Your country"
                  onChange={(e) => setBookingForm({ ...bookingForm, guest_country: e.target.value })}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Check-in"
                type="date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                value={bookingForm.check_in}
                onChange={(e) => setBookingForm({ ...bookingForm, check_in: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Check-out"
                type="date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: bookingForm.check_in || new Date().toISOString().split('T')[0] }}
                value={bookingForm.check_out}
                onChange={(e) => setBookingForm({ ...bookingForm, check_out: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Guests"
                type="number"
                inputProps={{ min: 1, max: airbnb.max_guests }}
                value={bookingForm.number_of_guests}
                onChange={(e) => setBookingForm({ ...bookingForm, number_of_guests: e.target.value })}
                helperText={`Maximum ${airbnb.max_guests} guests`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special requests (optional)"
                multiline
                rows={2}
                value={bookingForm.special_requests}
                onChange={(e) => setBookingForm({ ...bookingForm, special_requests: e.target.value })}
              />
            </Grid>
            {stayQuote.nights > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Estimated stay: {stayQuote.nights} night{stayQuote.nights !== 1 ? 's' : ''}
                  </Typography>
                  <DisplayPrice
                    amount={stayQuote.total}
                    listingCurrency={listingCurrency}
                    variant="h6"
                    showSecondary={false}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setBookingDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
            disabled={submitting || !canReserve}
            sx={{ px: 4, borderRadius: '12px', fontWeight: 700, bgcolor: '#ff385c' }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Send request'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AirbnbDetails;
