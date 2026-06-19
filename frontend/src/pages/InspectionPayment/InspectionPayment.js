import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  fetchPublicPaymentCheckout,
  initiatePesapalInspectionPayment,
  fetchPesapalOrderStatus,
  submitPublicPaymentProof,
} from '../../services/api/inspectionPaymentAPI';

const InspectionPayment = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    proof_reference: '',
    phone_number: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [pesapalLoading, setPesapalLoading] = useState(false);

  useEffect(() => {
    if (paymentId) loadPaymentData();
  }, [paymentId]);

  useEffect(() => {
    const orderTrackingId = searchParams.get('orderTrackingId');
    const pesapalReturn = searchParams.get('pesapal');
    if (!orderTrackingId || !pesapalReturn) return;

    (async () => {
      try {
        const { data } = await fetchPesapalOrderStatus(orderTrackingId);
        if (data.status === 'completed') {
          setSuccess(true);
          setSuccessMessage('Your viewing fee is confirmed. An agent will contact you to schedule your visit.');
        } else if (data.status === 'failed') {
          setError('Pesapal payment was not completed. Please try again.');
        }
        await loadPaymentData();
      } catch (err) {
        console.error('Pesapal status check failed:', err);
      }
    })();
  }, [searchParams]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPublicPaymentCheckout(paymentId);
      setPayment(response.data);
      if (response.data.status === 'paid') {
        setSuccess(true);
        setSuccessMessage('Your viewing fee is confirmed. An agent will contact you to schedule your visit.');
      }
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Failed to load payment information.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePesapalPay = async () => {
    try {
      setPesapalLoading(true);
      setError(null);
      const { data } = await initiatePesapalInspectionPayment(paymentId, {
        email: paymentData.phone_number ? undefined : undefined,
        phone: paymentData.phone_number || undefined,
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

  const handleManualSubmit = async () => {
    if (!paymentData.proof_reference.trim()) {
      setError('Enter the transaction ID or reference from your payment receipt.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const { data } = await submitPublicPaymentProof(paymentId, {
        proof_reference: paymentData.proof_reference.trim(),
        phone_number: paymentData.phone_number.trim() || undefined,
      });
      if (data.status === 'paid') {
        setSuccess(true);
        setSuccessMessage(data.message || 'Payment confirmed.');
      } else {
        setSuccess(true);
        setSuccessMessage(
          data.message ||
            'Payment proof submitted. We will verify and confirm your viewing shortly.'
        );
      }
      setPaymentDialogOpen(false);
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Could not submit payment proof. Check your reference and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Payment recorded
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {successMessage || 'Your viewing fee is on file. A verified agent will contact you to confirm your visit.'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              Back to listings
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error && !payment) {
    return (
      <Box sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Home
        </Button>
      </Box>
    );
  }

  const isPaid = payment?.status === 'paid';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Pay viewing fee
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {payment?.instructions}
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              Amounts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Viewing fee (pay in full)
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {payment?.currency} {payment?.amount?.toLocaleString()}
                </Typography>
                {payment?.total_inspection_fee ? (
                  <Typography variant="caption" color="text.secondary">
                    Total inspection fee: {payment?.currency}{' '}
                    {payment?.total_inspection_fee?.toLocaleString()}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
            {payment?.qr_code && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <img src={payment.qr_code} alt="Payment QR" style={{ maxWidth: 200 }} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Scan to open this page on another device
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {!isPaid && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {payment?.pesapal_enabled && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Pay online with Pesapal
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Card, mobile money (MTN, Airtel), and more — secure checkout via Pesapal.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handlePesapalPay}
                    disabled={pesapalLoading}
                    startIcon={pesapalLoading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                    sx={{ mb: 2 }}
                  >
                    {pesapalLoading ? 'Redirecting…' : `Pay ${payment?.currency} ${payment?.amount?.toLocaleString()} with Pesapal`}
                  </Button>
                  <Divider sx={{ my: 2 }}>or pay manually</Divider>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!isPaid && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                Pay manually
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Send the viewing fee via mobile money or bank transfer, then submit your transaction
                reference for verification.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => setPaymentDialogOpen(true)}
              >
                Submit payment proof
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit payment proof</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            After sending {payment?.currency} {payment?.amount?.toLocaleString()}, enter the
            transaction ID or reference from your receipt.
          </Alert>
          <TextField
            fullWidth
            required
            label="Transaction reference *"
            value={paymentData.proof_reference}
            onChange={(e) => setPaymentData({ ...paymentData, proof_reference: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone used (optional)"
            value={paymentData.phone_number}
            onChange={(e) => setPaymentData({ ...paymentData, phone_number: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleManualSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={22} /> : 'Submit proof'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InspectionPayment;
