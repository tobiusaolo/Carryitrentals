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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Payment as PaymentIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api/api';

const InspectionPayment = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    transaction_id: '',
    payment_reference: '',
    phone_number: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (paymentId) {
      loadPaymentData();
    }
  }, [paymentId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inspection-payments/booking/${paymentId}/generate-qr`);
      setPayment(response.data);
      setPaymentMethods(response.data.payment_methods);
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError('Failed to load payment information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod || !paymentData.transaction_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would:
      // 1. Process the payment with the selected method
      // 2. Call the backend to mark payment as paid
      // 3. Handle the response

      setSuccess(true);
      setPaymentDialogOpen(false);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'mtn_mobile_money':
      case 'airtel_money':
        return <PhoneIcon />;
      case 'bank_account':
        return <BankIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const getPaymentMethodColor = (type) => {
    switch (type) {
      case 'mtn_mobile_money':
        return '#FFD700';
      case 'airtel_money':
        return '#E60012';
      case 'bank_account':
        return '#1976D2';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading payment information...</Typography>
      </Box>
    );
  }

  if (error && !payment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
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
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your inspection payment has been processed successfully. You will be redirected shortly.
            </Typography>
            <CircularProgress size={24} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Inspection Payment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete your payment to schedule the property inspection
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Payment Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              Payment Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Amount to Pay (60%)</Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {payment?.currency} {payment?.amount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Remaining Amount (40%)</Typography>
                <Typography variant="h6" color="text.secondary">
                  {payment?.currency} {((payment?.amount * 0.4) / 0.6).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  To be paid after inspection
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon />
              Choose Payment Method
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {paymentMethods.map((method) => (
                <Grid item xs={12} sm={6} md={4} key={method.id}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': {
                        borderColor: getPaymentMethodColor(method.type),
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ color: getPaymentMethodColor(method.type) }}>
                        {getPaymentMethodIcon(method.type)}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {method.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {method.account_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.account_number}
                    </Typography>
                    {method.bank_name && (
                      <Typography variant="body2" color="text.secondary">
                        {method.bank_name}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={paymentData.transaction_id}
                onChange={(e) => setPaymentData({...paymentData, transaction_id: e.target.value})}
                required
                sx={{ mb: 2 }}
                helperText="Enter the transaction ID from your payment"
              />
              
              <TextField
                fullWidth
                label="Payment Reference (Optional)"
                value={paymentData.payment_reference}
                onChange={(e) => setPaymentData({...paymentData, payment_reference: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Your Phone Number"
                value={paymentData.phone_number}
                onChange={(e) => setPaymentData({...paymentData, phone_number: e.target.value})}
                sx={{ mb: 2 }}
                helperText="For verification purposes"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handlePaymentSubmit} 
              variant="contained" 
              disabled={submitting || !paymentData.transaction_id}
            >
              {submitting ? <CircularProgress size={20} /> : 'Complete Payment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default InspectionPayment;
