import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { CheckCircle, ErrorOutline, Smartphone } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';
import { fetchPesapalOrderStatus } from '../../services/api/rentPaymentAPI';
import { colors } from '../../theme/designTokens';

const TenantRentPaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const orderTrackingId = searchParams.get('orderTrackingId');
  const initialStatus = searchParams.get('status');
  const pesapalFlag = searchParams.get('pesapal');

  useEffect(() => {
    if (pesapalFlag === 'error') {
      setError(searchParams.get('message') || 'Payment could not be completed.');
      setLoading(false);
      return;
    }

    if (!orderTrackingId) {
      setError('Missing payment reference. If you paid, check your SMS or email receipt.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchPesapalOrderStatus(orderTrackingId);
        if (!cancelled) {
          setResult(data);
          if (data.status !== 'completed' && initialStatus !== 'completed') {
            setError('Payment was not completed. You can try again from the CarryIT tenant app.');
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.detail || 'Could not verify payment status.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderTrackingId, initialStatus, pesapalFlag, searchParams]);

  const completed = result?.status === 'completed' || initialStatus === 'completed';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <Container maxWidth="sm" sx={{ py: 6, flex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Rent payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          CarryIT tenant rent goes directly to your landlord — not the platform wallet.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : completed ? (
          <Card elevation={0} sx={{ border: `1px solid ${colors.success}`, borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 56, color: colors.success, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment confirmed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {result?.currency || 'UGX'} {Number(result?.amount || 0).toLocaleString()} received.
                {result?.confirmation_code ? ` Ref: ${result.confirmation_code}` : ''}
              </Typography>
              <Alert severity="info" sx={{ textAlign: 'left', mb: 2 }}>
                A receipt was sent by SMS/email if we have your contact details.
              </Alert>
              <Button
                variant="outlined"
                startIcon={<Smartphone />}
                onClick={() => navigate('/portals')}
              >
                Open tenant app
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ErrorOutline sx={{ fontSize: 56, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment not completed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {error || 'The payment did not go through. You can try again from the CarryIT tenant app.'}
              </Typography>
              <Button variant="contained" onClick={() => navigate('/portals')}>
                Back to portals
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default TenantRentPaymentReturn;
