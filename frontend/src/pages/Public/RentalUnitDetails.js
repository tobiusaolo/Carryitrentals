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
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Home,
  Share,
  Favorite,
  FavoriteBorder,
  Verified,
} from '@mui/icons-material';
import axios from 'axios';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';
import TrustBanner from '../../components/Public/TrustBanner';
import ReportListingDialog from '../../components/Public/ReportListingDialog';
import PropertyCard from '../../components/UI/PropertyCard';
import { fetchPublicRentals, fetchPublicRentalById, normalizePublicRentalUnit } from '../../services/api/marketplaceAPI';
import { API_BASE_URL } from '../../config/api';
import { DEFAULT_INSPECTION_FEE_UGX, BOOKING_TIME_SLOTS } from '../../constants/rentalUnit';
import { isListingSaved, toggleSavedListing } from '../../utils/favorites';
import DisplayPrice from '../../components/Public/DisplayPrice';
import { useViewerCurrency } from '../../contexts/ViewerCurrencyContext';
import { convertAmount, normalizeCurrency } from '../../config/currencyLocale';
import { getRentalStatusMeta, normalizeRentalStatus } from '../../utils/rentalStatus';

const normalizeUnit = (unit) => ({
  ...normalizePublicRentalUnit(unit),
  status: normalizeRentalStatus(unit.status),
});

const RentalUnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { displayCurrency, formatMoney } = useViewerCurrency();

  const [unit, setUnit] = useState(null);
  const [allUnits, setAllUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [safetyAck, setSafetyAck] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    contact_country: 'Uganda',
    booking_date: '',
    preferred_time_slot: 'morning',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const [detailRes, listRes] = await Promise.all([
        fetchPublicRentalById(id),
        fetchPublicRentals(),
      ]);
      const foundUnit = normalizeUnit(detailRes.data);
      setUnit(foundUnit);
      setSaved(isListingSaved(foundUnit.id));
      setBookingForm((prev) => ({ ...prev, contact_country: foundUnit.country || 'Uganda' }));
      setAllUnits((listRes.data || []).map(normalizeUnit));
    } catch (error) {
      console.error('Error loading unit:', error);
      setSnackbar({ open: true, message: 'Property not found', severity: 'error' });
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const similarUnits = useMemo(() => {
    if (!unit || !allUnits.length) return [];
    const rent = parseFloat(unit.monthly_rent || 0);
    return allUnits
      .filter((u) => String(u.id) !== String(unit.id))
      .filter((u) => {
        const r = parseFloat(u.monthly_rent || 0);
        const sameArea = (u.location || '').toLowerCase().includes((unit.location || '').split(',')[0].toLowerCase());
        const similarPrice = rent > 0 && Math.abs(r - rent) / rent <= 0.25;
        return (u.bedrooms === unit.bedrooms) || sameArea || similarPrice;
      })
      .slice(0, 4);
  }, [unit, allUnits]);

  const marketHint = useMemo(() => {
    if (!unit || allUnits.length < 2) return null;
    const listingCur = normalizeCurrency(unit.currency);
    const rents = allUnits
      .filter((u) => u.bedrooms === unit.bedrooms && String(u.id) !== String(unit.id))
      .map((u) => convertAmount(u.monthly_rent, u.currency, displayCurrency))
      .filter((r) => r > 0);
    if (!rents.length) return null;
    const avg = rents.reduce((a, b) => a + b, 0) / rents.length;
    const current = convertAmount(unit.monthly_rent, listingCur, displayCurrency);
    const fmt = (n) => `${displayCurrency} ${Math.round(n).toLocaleString()}`;
    if (current < avg * 0.7) {
      return {
        type: 'warning',
        text: `At ${fmt(current)}, this is well below similar homes (avg ${fmt(avg)}) — confirm at viewing (common scam signal).`,
      };
    }
    if (current > avg * 1.3) {
      return { type: 'info', text: `Priced above similar listings on CarryIT (avg ${fmt(avg)}).` };
    }
    return { type: 'success', text: `In line with similar listings (avg ${fmt(avg)}).` };
  }, [unit, allUnits, displayCurrency]);

  const statusMeta = unit ? getRentalStatusMeta(unit.status) : null;
  const listingCurrency = unit?.currency || 'UGX';
  const priceLines = unit
    ? {
        rent: formatMoney(unit.monthly_rent, listingCurrency),
        inspection: formatMoney(unit.inspection_fee || DEFAULT_INSPECTION_FEE_UGX, listingCurrency),
        deposit: formatMoney(unit.deposit_amount || 0, listingCurrency),
      }
    : null;

  const handleBookingSubmit = async () => {
    if (!bookingForm.contact_name || !bookingForm.contact_phone || bookingForm.contact_phone.length < 10 || !bookingForm.booking_date) {
      setSnackbar({ open: true, message: 'Please fill in name, a valid phone (10+ digits), and viewing date.', severity: 'warning' });
      return;
    }
    if (!safetyAck) {
      setSnackbar({ open: true, message: 'Please confirm you understand our viewing safety policy.', severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        rental_unit_id: unit.id,
        ...bookingForm,
        booking_date: new Date(bookingForm.booking_date).toISOString(),
      };
      const { data } = await axios.post(`${API_BASE_URL}/rental-units/public/book-inspection`, bookingData);
      setBookingResult(data);
      setBookingDialog(false);
      if (data.payment_url) {
        setSnackbar({
          open: true,
          message: 'Booking received. Complete your viewing fee payment to confirm.',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Booking received. An agent will call you — no rent before viewing.',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to book inspection.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (!unit) return null;

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      <PublicHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: '#222', textTransform: 'none', fontWeight: 600 }}>
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<Share />} sx={{ color: '#222', textTransform: 'none', fontWeight: 600 }} onClick={() => navigator.clipboard?.writeText(window.location.href)}>
              Share
            </Button>
            <Button
              startIcon={saved ? <Favorite sx={{ color: '#ff385c' }} /> : <FavoriteBorder />}
              sx={{ color: '#222', textTransform: 'none', fontWeight: 600 }}
              onClick={() => setSaved(toggleSavedListing(unit.id))}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {unit.listing_code && <Chip label={unit.listing_code} size="small" sx={{ fontWeight: 700 }} />}
          {unit.is_verified && (
            <Chip icon={<Verified />} label="Verified listing" color="success" size="small" sx={{ fontWeight: 700 }} />
          )}
          {unit.agent_verified && (
            <Chip label="NIN-verified agent" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
          )}
          <Chip label={unit.country || 'Uganda'} size="small" variant="outlined" />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#222' }}>
          {unit.title || unit.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
          <LocationOn sx={{ fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: 'underline' }}>
            {unit.location}
          </Typography>
        </Box>

        <TrustBanner />
        <Button size="small" color="error" onClick={() => setReportOpen(true)} sx={{ mb: 2, fontWeight: 700 }}>
          Report this listing
        </Button>

        {marketHint && (
          <Alert severity={marketHint.type} sx={{ mb: 3, borderRadius: '12px' }}>
            {marketHint.text}
          </Alert>
        )}

        <Grid container spacing={1} sx={{ height: { xs: 300, md: 500 }, mb: 4, borderRadius: '16px', overflow: 'hidden' }}>
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Box component="img" src={unit.images?.[0] || 'https://via.placeholder.com/800x600'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Grid>
          {!isMobile && (
            <Grid item md={6} sx={{ height: '100%' }}>
              <Grid container spacing={1} sx={{ height: '100%' }}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={6} sx={{ height: '50%' }} key={i}>
                    <Box component="img" src={unit.images?.[i] || unit.images?.[0]} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>

        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {unit.unit_type?.replace('_', ' ') || 'Rental unit'}
              {unit.agent_name ? ` · Agent: ${unit.agent_name}` : ''}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {unit.bedrooms || 0} bedrooms · {unit.bathrooms || 0} bathrooms
              {unit.inspection_bookings_count > 0 && ` · ${unit.inspection_bookings_count} viewing requests`}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Description</Typography>
            <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8, mb: 4 }}>
              {unit.description || 'No description available for this property.'}
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>What this place offers</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {(unit.amenities || 'Parking, Water, Security').split(',').map((amenity, i) => (
                <Grid item xs={6} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Home sx={{ color: '#717171' }} />
                    <Typography variant="body1">{amenity.trim()}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {similarUnits.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Similar homes on CarryIT</Typography>
                <Grid container spacing={2}>
                  {similarUnits.map((u) => (
                    <Grid item xs={12} sm={6} key={u.id}>
                      <PropertyCard property={u} onClick={() => navigate(`/rental/${u.id}`)} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #DDD', position: 'sticky', top: 100, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
              <DisplayPrice
                amount={unit.monthly_rent}
                listingCurrency={listingCurrency}
                period="/ month"
                variant="h4"
              />

              <Box sx={{ border: '1px solid #B0B0B0', borderRadius: '8px', my: 3 }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid #B0B0B0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>VIEWING FEE (after you visit)</Typography>
                  <Typography variant="body2" color="text.secondary">Pay only through CarryIT after scheduled viewing</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{priceLines?.inspection.primary}</Typography>
                  {priceLines?.inspection.secondary && (
                    <Typography variant="caption" color="text.secondary">Listed at {priceLines.inspection.secondary}</Typography>
                  )}
                </Box>
                <Box sx={{ p: 1.5, borderBottom: '1px solid #B0B0B0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>SECURITY DEPOSIT</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{priceLines?.deposit.primary}</Typography>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>AVAILABILITY</Typography>
                  <Typography variant="body1" sx={{ color: statusMeta?.chipColor, fontWeight: 600 }}>
                    {statusMeta?.isAvailable ? 'Available now' : statusMeta?.label || 'Taken'}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!statusMeta?.isAvailable}
                onClick={() => setBookingDialog(true)}
                sx={{ py: 1.5, borderRadius: '8px', fontWeight: 700, bgcolor: '#ff385c', '&:hover': { bgcolor: '#e31c5f' } }}
              >
                {statusMeta?.isAvailable ? 'Book verified viewing' : 'Home is taken'}
              </Button>

              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                No monthly rent charged on this step
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Estimated viewing fee</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{priceLines?.inspection.primary}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Deposit (if you lease)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{priceLines?.deposit.primary}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>Monthly rent (after lease)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{priceLines?.rent.primary}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Book a verified viewing</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
            No rent or deposit before viewing. After booking, pay 60% of the viewing fee via mobile money; the rest (40%) is due after your visit.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name *" value={bookingForm.contact_name} onChange={(e) => setBookingForm({ ...bookingForm, contact_name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone *" value={bookingForm.contact_phone} onChange={(e) => setBookingForm({ ...bookingForm, contact_phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={bookingForm.contact_email} onChange={(e) => setBookingForm({ ...bookingForm, contact_email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Your country" value={bookingForm.contact_country} onChange={(e) => setBookingForm({ ...bookingForm, contact_country: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Preferred date *" type="date" InputLabelProps={{ shrink: true }} value={bookingForm.booking_date} onChange={(e) => setBookingForm({ ...bookingForm, booking_date: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Preferred time"
                value={bookingForm.preferred_time_slot}
                onChange={(e) => setBookingForm({ ...bookingForm, preferred_time_slot: e.target.value })}
              >
                {BOOKING_TIME_SLOTS.map((slot) => (
                  <MenuItem key={slot.value} value={slot.value}>{slot.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Checkbox checked={safetyAck} onChange={(e) => setSafetyAck(e.target.checked)} />}
            label="I will not pay rent or deposit to anyone before viewing the property in person."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setBookingDialog(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleBookingSubmit} disabled={submitting} sx={{ px: 4, borderRadius: '12px', fontWeight: 700, bgcolor: '#ff385c' }}>
            {submitting ? <CircularProgress size={24} /> : 'Request viewing'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(bookingResult)}
        onClose={() => setBookingResult(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Viewing requested</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
            Booking #{bookingResult?.id} saved. An agent will contact you at {bookingResult?.contact_phone}.
          </Alert>
          {bookingResult?.payment_url ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Pay <strong>{bookingResult.currency} {Number(bookingResult.amount_due_now || 0).toLocaleString()}</strong> now
                (60% of {bookingResult.currency} {Number(bookingResult.total_inspection_fee || 0).toLocaleString()} viewing fee).
                Balance of {bookingResult.currency} {Number(bookingResult.amount_due_after || 0).toLocaleString()} after your visit.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ bgcolor: '#ff385c', fontWeight: 700, borderRadius: '12px' }}
                onClick={() => {
                  window.location.href = bookingResult.payment_url;
                }}
              >
                Pay viewing fee now
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Payment setup is pending — our team will send you payment instructions.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingResult(null)} sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ReportListingDialog open={reportOpen} onClose={() => setReportOpen(false)} unit={unit} />
      <Footer />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: 3 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RentalUnitDetails;
