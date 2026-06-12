import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { reportListing } from '../../services/api/marketplaceAPI';

const REASONS = [
  { value: 'fake_listing', label: 'Fake or non-existent property' },
  { value: 'wrong_price', label: 'Misleading price (bait-and-switch)' },
  { value: 'already_rented', label: 'Already rented / not available' },
  { value: 'scam_agent', label: 'Scam agent or upfront payment demand' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'other', label: 'Other' },
];

const ReportListingDialog = ({ open, onClose, unit }) => {
  const [form, setForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    reporter_email: '',
    reason: 'fake_listing',
    details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.reporter_name.trim() || !form.reporter_phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await reportListing({
        rental_unit_id: unit?.id ? String(unit.id) : undefined,
        listing_title: unit?.title,
        ...form,
      });
      setDone(true);
    } catch {
      setError('Could not submit report. Try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Report this listing</DialogTitle>
      <DialogContent>
        {done ? (
          <Alert severity="success" sx={{ borderRadius: '12px' }}>
            Thank you. We review reports within 48 hours and may hide listings that break our rules.
          </Alert>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
            <TextField
              select
              fullWidth
              label="Reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            >
              {REASONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Your name"
              value={form.reporter_name}
              onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={form.reporter_phone}
              onChange={(e) => setForm({ ...form, reporter_phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Details (optional)"
              multiline
              rows={3}
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} sx={{ fontWeight: 700 }}>{done ? 'Close' : 'Cancel'}</Button>
        {!done && (
          <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting} sx={{ fontWeight: 700, borderRadius: '10px' }}>
            {submitting ? <CircularProgress size={22} /> : 'Submit report'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportListingDialog;
