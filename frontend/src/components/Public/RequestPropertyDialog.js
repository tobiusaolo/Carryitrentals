import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { requestProperty } from '../../services/api/marketplaceAPI';
import { useViewerCurrency } from '../../contexts/ViewerCurrencyContext';
import { VIEWER_REGIONS } from '../../config/currencyLocale';
import { UNIT_TYPE_OPTIONS } from '../../constants/rentalUnit';

const COUNTRIES = VIEWER_REGIONS.map((r) => r.country);

const RequestPropertyDialog = ({ open, onClose }) => {
  const { viewerCountry, displayCurrency } = useViewerCurrency();
  const [form, setForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    country: viewerCountry,
    location_preference: '',
    budget_currency: displayCurrency,
    budget_min: '',
    budget_max: '',
    bedrooms: '',
    unit_type: '',
    move_in_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.contact_name.trim() || !form.contact_phone.trim() || !form.location_preference.trim()) {
      setError('Name, phone, and preferred area are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await requestProperty({
        ...form,
        budget_currency: form.budget_currency || displayCurrency,
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        unit_type: form.unit_type || undefined,
        move_in_date: form.move_in_date || undefined,
      });
      setDone(true);
    } catch {
      setError('Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        country: viewerCountry,
        budget_currency: displayCurrency,
      }));
    }
  }, [open, viewerCountry, displayCurrency]);

  const handleClose = () => {
    setDone(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Tell us what you need</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Verified agents are notified when your budget and area match available homes. Budget amounts are in {form.budget_currency || displayCurrency}.
        </Typography>
        {done ? (
          <Alert severity="success" sx={{ borderRadius: '12px' }}>
            Request received. A CarryIT agent will contact you on the phone number provided.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                {COUNTRIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Preferred area (e.g. Najjera, Westlands)" value={form.location_preference} onChange={(e) => setForm({ ...form, location_preference: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Budget currency"
                value={form.budget_currency}
                onChange={(e) => setForm({ ...form, budget_currency: e.target.value })}
              >
                {[...new Set(VIEWER_REGIONS.map((r) => r.currency))].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Min budget" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Max budget" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Bedrooms" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth label="Unit type" value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })}>
                <MenuItem value="">Any</MenuItem>
                {UNIT_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Move-in date"
                InputLabelProps={{ shrink: true }}
                value={form.move_in_date}
                onChange={(e) => setForm({ ...form, move_in_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} sx={{ fontWeight: 700 }}>{done ? 'Close' : 'Cancel'}</Button>
        {!done && (
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} sx={{ fontWeight: 700, bgcolor: '#ff385c', borderRadius: '10px', '&:hover': { bgcolor: '#e31c5f' } }}>
            {submitting ? <CircularProgress size={22} /> : 'Submit request'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RequestPropertyDialog;
