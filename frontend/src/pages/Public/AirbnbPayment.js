import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { Payment as PaymentIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';
import {
  fetchAirbnbCheckout,
  initiateAirbnbPesapal,
  fetchPesapalOrderStatus,
} from '../../services/api/airbnbPaymentAPI';

const AirbnbPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState(null);
  const [pesapalLoading, setPesapalLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await fetchAirbnbCheckout(bookingId);
      setCheckout(data);
      if (data.payment_status === 'completed') setSuccess(true);
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Could not load booking payment details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) loadCheckout();
  }, [bookingId]);

  useEffect(() => {
    const orderTrackingId = searchParams.get('orderTrackingId');
    if (!orderTrackingId || !searchParams.get('pesapal')) return;

    (async () => {
      try {
        const { data } = await fetchPesapalOrderStatus(orderTrackingId);
        if (data.status === 'completed') setSuccess(true);
        else if (data.status === 'failed') setError('Payment was not completed. Please try again.');
        await loadCheckout();
      } catch (e) {
        console.error(e);
      }
    })();
  }, [searchParams]);

  const handlePesapalPay = async () => {
    try {
      setPesapalLoading(true);
      setError(null);
      const { data } = await initiateAirbnbPesapal(bookingId, {
        email: checkout?.guest_email,
        phone: checkout?.guest_phone,
        first_name: checkout?.guest_name?.split(' ')[0],
        last_name: checkout?.guest_name?.split(' ').slice(1).join(' ') || 'Guest',
      });
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setError('Could not start Pesapal checkout.');
      }
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Could not start Pesapal payment.'
      );
    } finally {
      setPesapalLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      <PublicHeader />
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
        {success ? (
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Booking confirmed
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your prepayment was received. Check your phone for confirmation details.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/airbnb')}>
              Back to short stays
            </Button>
          </Card>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {checkout && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight={700}>
                    Pay stay prepayment
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {checkout.airbnb_title}
                    {checkout.airbnb_location ? ` · ${checkout.airbnb_location}` : ''}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Guest: {checkout.guest_name}
                  </Typography>
                  {checkout.check_in && checkout.check_out && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {checkout.check_in} → {checkout.check_out}
                    </Typography>
                  )}
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Prepayment due now (50%)
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight={800}>
                      {checkout.currency} {checkout.prepayment_amount?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Remaining at check-in: {checkout.currency}{' '}
                      {checkout.remaining_amount?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip label={`Status: ${checkout.payment_status || 'pending'}`} size="small" sx={{ mb: 2 }} />
                  {checkout.pesapal_enabled ? (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handlePesapalPay}
                      disabled={pesapalLoading || checkout.prepayment_amount <= 0}
                      startIcon={pesapalLoading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                    >
                      {pesapalLoading
                        ? 'Redirecting…'
                        : `Pay ${checkout.currency} ${checkout.prepayment_amount?.toLocaleString()} with Pesapal`}
                    </Button>
                  ) : (
                    <Alert severity="warning">Online payment is not available right now.</Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default AirbnbPayment;
