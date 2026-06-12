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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchPublicPaymentCheckout,
  confirmPublicPayment,
} from '../../services/api/inspectionPaymentAPI';

const InspectionPayment = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    transaction_id: '',
    payment_reference: '',
    phone_number: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (paymentId) loadPaymentData();
  }, [paymentId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPublicPaymentCheckout(paymentId);
      setPayment(response.data);
      setPaymentMethods(response.data.payment_methods || []);
      if (response.data.status === 'paid') setSuccess(true);
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

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedMethod(String(methodId));
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod || !paymentData.transaction_id.trim()) {
      setError('Select a payment method and enter your transaction ID from the SMS receipt.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await confirmPublicPayment(paymentId, {
        payment_method_id: selectedMethod,
        transaction_id: paymentData.transaction_id.trim(),
        payment_reference: paymentData.payment_reference || undefined,
        phone_number: paymentData.phone_number || undefined,
      });
      setSuccess(true);
      setPaymentDialogOpen(false);
      setTimeout(() => navigate('/'), 4000);
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Could not confirm payment. Check your transaction ID and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentMethodColor = (type) => {
    switch (type) {
      case 'mtn_mobile_money':
        return '#FFD700';
      case 'airtel_money':
        return '#E60012';
      default:
        return '#1976D2';
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
              Your viewing fee is on file. A verified agent will contact you to confirm your visit.
              Balance (40%) is paid after you view the property.
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
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Pay now (60%)
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {payment?.currency} {payment?.amount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  After viewing (40%)
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {payment?.currency} {payment?.amount_due_after?.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total fee: {payment?.currency} {payment?.total_inspection_fee?.toLocaleString()}
                </Typography>
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                1. Send money to CarryIT
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {paymentMethods.map((method) => (
                  <ListItem key={method.id} divider>
                    <ListItemText
                      primary={method.name}
                      secondary={`${method.account_name} · ${method.account_number}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                2. Confirm with your transaction ID
              </Typography>
              <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                  <Grid item xs={12} sm={6} md={4} key={method.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': { borderColor: getPaymentMethodColor(method.type) },
                      }}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <Typography fontWeight={700}>{method.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tap to confirm payment
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm payment</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter the transaction ID from your MTN/Airtel SMS after sending {payment?.currency}{' '}
            {payment?.amount?.toLocaleString()}.
          </Alert>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Method used</InputLabel>
            <Select value={selectedMethod} label="Method used" disabled>
              {paymentMethods.map((m) => (
                <MenuItem key={m.id} value={String(m.id)}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            required
            label="Transaction ID *"
            value={paymentData.transaction_id}
            onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone used (optional)"
            value={paymentData.phone_number}
            onChange={(e) => setPaymentData({ ...paymentData, phone_number: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Reference (optional)"
            value={paymentData.payment_reference}
            onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePaymentSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={22} /> : 'Submit confirmation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InspectionPayment;
