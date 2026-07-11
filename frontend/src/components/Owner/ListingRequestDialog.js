import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
} from '@mui/material';
import { listingRequestAPI } from '../../services/api/listingRequestAPI';
import { showSuccess } from '../../utils/sweetAlert';
import { ownerPrimaryButtonSx, portalOutlinedButtonSx } from '../../theme/designTokens';
export default function ListingRequestDialog({
  open,
  onClose,
  requestType,
  properties = [],
  units = [],
  defaultPropertyId = '',
  defaultUnitId = '',
  defaultTitle = '',
  onSubmitted,
}) {
  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [unitId, setUnitId] = useState(defaultUnitId);
  const [title, setTitle] = useState(defaultTitle);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typeLabel = requestType === 'short_stay' ? 'short stay' : 'unit for rent';
  const filteredUnits = units.filter((u) => String(u.property_id) === String(propertyId));

  React.useEffect(() => {
    if (open) {
      setPropertyId(defaultPropertyId || '');
      setUnitId(defaultUnitId || '');
      setTitle(defaultTitle || '');
      setMessage('');
      setError(null);
    }
  }, [open, defaultPropertyId, defaultUnitId, defaultTitle]);

  const handleSubmit = async () => {
    if (!propertyId) {
      setError('Select a property.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await listingRequestAPI.submit({
        request_type: requestType,
        property_id: propertyId,
        unit_id: unitId || undefined,
        title: title.trim() || undefined,
        message: message.trim() || undefined,
      });
      try {
        await onSubmitted?.();
      } catch (refreshErr) {
        console.error('Failed to refresh listing requests:', refreshErr);
      }
      onClose();
      showSuccess(
        'Request sent',
        `Your ${typeLabel} listing request was submitted. Track its status in "Your listing requests" below — it updates automatically as admins review it.`
      );
    } catch (err) {
      setError(err.message || 'Failed to submit request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request {typeLabel} listing</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          CarryIT admins publish marketplace and short-stay listings. Submit this form and we will
          notify the team to add your {typeLabel}.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
          <InputLabel>Property</InputLabel>
          <Select
            value={propertyId}
            label="Property"
            onChange={(e) => {
              setPropertyId(e.target.value);
              setUnitId('');
            }}
          >
            {properties.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {requestType === 'rental_unit' && filteredUnits.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Internal unit (optional)</InputLabel>
            <Select
              value={unitId}
              label="Internal unit (optional)"
              onChange={(e) => setUnitId(e.target.value)}
            >
              <MenuItem value="">— Not linked to a unit —</MenuItem>
              {filteredUnits.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.unit_number} · {u.unit_type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          label="Suggested title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Notes for admin"
          placeholder="Rent amount, photos ready, preferred move-in date, nightly rate, etc."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          You will receive a notification when your listing is published or if more info is needed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={portalOutlinedButtonSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={loading}
          sx={ownerPrimaryButtonSx}
        >
          {loading ? 'Sending…' : 'Notify admin'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
