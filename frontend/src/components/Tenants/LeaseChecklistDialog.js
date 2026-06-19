import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import { leaseInspectionAPI } from '../../services/api/leaseInspectionAPI';

const TYPE_LABELS = {
  move_in: 'Move-in',
  move_out: 'Move-out',
};

export default function LeaseChecklistDialog({ open, onClose, tenant, isOwner = true }) {
  const tenantId = tenant?.id;
  const [inspectionType, setInspectionType] = useState('move_in');
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);

  const loadInspection = useCallback(async () => {
    if (!tenantId || !open) return;
    setLoading(true);
    setError(null);
    try {
      const { data: list } = await leaseInspectionAPI.listForTenant(tenantId);
      const match =
        list.find((i) => i.inspection_type === inspectionType && i.status === 'draft') ||
        list.find((i) => i.inspection_type === inspectionType);
      if (match) {
        setInspection(match);
      } else {
        const { data: created } = await leaseInspectionAPI.create({
          tenant_id: String(tenantId),
          inspection_type: inspectionType,
        });
        setInspection(created);
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not load checklist');
    } finally {
      setLoading(false);
    }
  }, [tenantId, inspectionType, open]);

  useEffect(() => {
    loadInspection();
  }, [loadInspection]);

  const updateItem = (key, patch) => {
    setInspection((prev) => {
      if (!prev) return prev;
      const checklist = prev.checklist.map((item) =>
        item.key === key ? { ...item, ...patch } : item
      );
      return { ...prev, checklist };
    });
  };

  const saveChecklist = async () => {
    if (!inspection || inspection.status !== 'draft') return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await leaseInspectionAPI.update(inspection.id, {
        checklist: inspection.checklist,
        notes: inspection.notes,
      });
      setInspection(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadPhotos = async () => {
    if (!inspection || !photoFiles.length) return;
    setSaving(true);
    try {
      const { data } = await leaseInspectionAPI.uploadPhotos(inspection.id, photoFiles);
      setInspection(data);
      setPhotoFiles([]);
    } catch (e) {
      setError(e.response?.data?.detail || 'Photo upload failed');
    } finally {
      setSaving(false);
    }
  };

  const submitChecklist = async () => {
    if (!inspection) return;
    setSaving(true);
    try {
      const { data: saved } = await leaseInspectionAPI.update(inspection.id, {
        checklist: inspection.checklist,
        notes: inspection.notes,
      });
      const { data } = await leaseInspectionAPI.submit(saved.id);
      setInspection(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  const acknowledgeChecklist = async () => {
    setSaving(true);
    try {
      const { data } = await leaseInspectionAPI.acknowledge(inspection.id);
      setInspection(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Acknowledge failed');
    } finally {
      setSaving(false);
    }
  };

  const readOnly = !inspection || inspection.status !== 'draft';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {TYPE_LABELS[inspectionType]} checklist
        {tenant ? ` — ${tenant.first_name} ${tenant.last_name}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <ToggleButtonGroup
          value={inspectionType}
          exclusive
          onChange={(_, v) => v && setInspectionType(v)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="move_in">Move-in</ToggleButton>
          <ToggleButton value="move_out">Move-out</ToggleButton>
        </ToggleButtonGroup>

        {inspection && (
          <Chip
            label={inspection.status.replace('_', ' ')}
            color={
              inspection.status === 'acknowledged'
                ? 'success'
                : inspection.status === 'submitted'
                  ? 'warning'
                  : 'default'
            }
            size="small"
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : inspection ? (
          <>
            {inspection.checklist.map((item) => (
              <Box key={item.key} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(item.checked)}
                      disabled={readOnly}
                      onChange={(e) => updateItem(item.key, { checked: e.target.checked })}
                    />
                  }
                  label={item.label}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Notes (damage, meter reading, etc.)"
                  value={item.notes || ''}
                  disabled={readOnly}
                  onChange={(e) => updateItem(item.key, { notes: e.target.value })}
                />
              </Box>
            ))}

            <TextField
              fullWidth
              label="Overall notes"
              multiline
              rows={2}
              value={inspection.notes || ''}
              disabled={readOnly}
              onChange={(e) => setInspection({ ...inspection, notes: e.target.value })}
              sx={{ mb: 2 }}
            />

            {!readOnly && (
              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" component="label" sx={{ mr: 1 }}>
                  Add photos
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                  />
                </Button>
                {photoFiles.length > 0 && (
                  <Button onClick={uploadPhotos} disabled={saving}>
                    Upload {photoFiles.length} photo(s)
                  </Button>
                )}
              </Box>
            )}

            {inspection.photos?.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Photos ({inspection.photos.length})
                </Typography>
                <Grid container spacing={1}>
                  {inspection.photos.map((photo) => (
                    <Grid item xs={6} sm={4} key={photo.id}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="120"
                          image={photo.url || photo.path}
                          alt={photo.label || 'Checklist photo'}
                        />
                      </Card>
                      <Typography variant="caption">{photo.label}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {inspection?.status === 'draft' && (
          <>
            <Button onClick={saveChecklist} disabled={saving}>
              Save
            </Button>
            <Button variant="contained" onClick={submitChecklist} disabled={saving}>
              Submit checklist
            </Button>
          </>
        )}
        {isOwner && inspection?.status === 'submitted' && (
          <Button variant="contained" color="success" onClick={acknowledgeChecklist} disabled={saving}>
            Acknowledge
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
