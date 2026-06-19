import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Delete } from '@mui/icons-material';
import api from '../../services/api/api';

const STATUS_COLORS = {
  available: '#f9fafb',
  booked: '#dbeafe',
  confirmed: '#dbeafe',
  pending: '#fef3c7',
  blocked: '#fee2e2',
};

const STATUS_LABELS = {
  available: 'Available',
  booked: 'Booked',
  confirmed: 'Confirmed',
  pending: 'Pending',
  blocked: 'Blocked',
};

function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function AirbnbCalendarDialog({ open, onClose, listing, onUpdated }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [icalUrl, setIcalUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCalendar = async () => {
    if (!listing?.id) return;
    setLoading(true);
    try {
      const [availabilityRes, blocksRes] = await Promise.all([
        api.get(`/airbnb/${listing.id}/availability`, { params: { month, year } }),
        api.get(`/airbnb/${listing.id}/blocks`),
      ]);
      setDays(availabilityRes.data || []);
      setBlocks(blocksRes.data || []);
    } catch (err) {
      console.error('Calendar load failed', err);
      setDays([]);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && listing?.id) {
      loadCalendar();
    }
  }, [open, listing?.id, month, year]);

  const calendarCells = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startPad = first.getDay();
    const map = Object.fromEntries((days || []).map((d) => [d.date, d.status]));
    const cells = [];
    for (let i = 0; i < startPad; i += 1) cells.push(null);
    for (let day = 1; day <= new Date(year, month, 0).getDate(); day += 1) {
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, iso, status: map[iso] || 'available' });
    }
    return cells;
  }, [days, month, year]);

  const shiftMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const addBlock = async () => {
    if (!blockStart || !blockEnd) return;
    setSaving(true);
    try {
      await api.post(`/airbnb/${listing.id}/blocks`, {
        start_date: blockStart,
        end_date: blockEnd,
        reason: blockReason || undefined,
      });
      setBlockStart('');
      setBlockEnd('');
      setBlockReason('');
      await loadCalendar();
      onUpdated?.();
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not block dates');
    } finally {
      setSaving(false);
    }
  };

  const removeBlock = async (blockId) => {
    try {
      await api.delete(`/airbnb/blocks/${blockId}`);
      await loadCalendar();
      onUpdated?.();
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not remove block');
    }
  };

  const importIcal = async () => {
    if (!icalUrl.trim()) return;
    setImporting(true);
    try {
      const res = await api.post(`/airbnb/${listing.id}/calendar/import-ical`, { url: icalUrl.trim() });
      setIcalUrl('');
      await loadCalendar();
      onUpdated?.();
      alert(
        `Imported ${res.data.blocks_created} block(s) from ${res.data.events_found} calendar event(s).`
      );
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not import calendar');
    } finally {
      setImporting(false);
    }
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Calendar — {listing.title}
        <Typography variant="body2" color="text.secondary">
          Block dates for maintenance or personal use. Bookings and blocks prevent guest check-in.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">{monthLabel(year, month)}</Typography>
          <IconButton onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight />
          </IconButton>
        </Box>

        <Grid container spacing={0.5} sx={{ mb: 2 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Grid item xs={12 / 7} key={d}>
              <Typography variant="caption" color="text.secondary" align="center" display="block">
                {d}
              </Typography>
            </Grid>
          ))}
          {calendarCells.map((cell, idx) => (
            <Grid item xs={12 / 7} key={idx}>
              <Box
                sx={{
                  minHeight: 36,
                  borderRadius: 1,
                  bgcolor: cell ? STATUS_COLORS[cell.status] || STATUS_COLORS.available : 'transparent',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {cell ? (
                  <Typography variant="caption" fontWeight={600}>
                    {cell.day}
                  </Typography>
                ) : null}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Chip
              key={key}
              size="small"
              label={label}
              sx={{ bgcolor: STATUS_COLORS[key] || '#f9fafb' }}
            />
          ))}
        </Box>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Import external calendar (iCal)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Paste your Airbnb or Google Calendar export URL to block booked dates automatically.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <TextField
            label="iCal URL"
            size="small"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder="https://..."
            sx={{ flex: 1, minWidth: 240 }}
          />
          <Button variant="outlined" onClick={importIcal} disabled={importing || !icalUrl.trim()}>
            {importing ? 'Importing…' : 'Import calendar'}
          </Button>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Block a date range
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField
            label="Start"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={blockStart}
            onChange={(e) => setBlockStart(e.target.value)}
          />
          <TextField
            label="End"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={blockEnd}
            onChange={(e) => setBlockEnd(e.target.value)}
          />
          <TextField
            label="Reason (optional)"
            size="small"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            sx={{ flex: 1, minWidth: 180 }}
          />
          <Button variant="contained" onClick={addBlock} disabled={saving || !blockStart || !blockEnd}>
            Block dates
          </Button>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Active blocks
        </Typography>
        <List dense>
          {blocks.length === 0 ? (
            <ListItem>
              <ListItemText primary="No blocked ranges yet." />
            </ListItem>
          ) : (
            blocks.map((block) => (
              <ListItem
                key={block.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => removeBlock(block.id)} aria-label="Remove block">
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${formatDate(block.start_date)} → ${formatDate(block.end_date)}`}
                  secondary={block.reason || 'Blocked by owner'}
                />
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
