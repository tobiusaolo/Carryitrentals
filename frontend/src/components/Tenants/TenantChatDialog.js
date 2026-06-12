import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Close, Send } from '@mui/icons-material';
import { tenantAPI } from '../../services/api/tenantAPI';
import { colors } from '../../theme/designTokens';

function ChatBubble({ msg, isMine }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: '78%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: isMine ? colors.brand : colors.surfaceMuted,
          color: isMine ? '#fff' : colors.text,
          border: isMine ? 'none' : `1px solid ${colors.border}`,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {msg.message}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.75,
            textAlign: isMine ? 'right' : 'left',
          }}
        >
          {msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TenantChatDialog({ open, tenant, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const lastSeenIdRef = useRef(null);

  const tenantId = tenant?.id;
  const tenantLabel = tenant
    ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'Tenant'
    : 'Tenant';

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const loadMessages = useCallback(
    async ({ silent = false } = {}) => {
      if (!tenantId) return;
      if (!silent) setLoading(true);
      setError('');
      try {
        const { data } = await tenantAPI.getChatMessages(tenantId);
        const list = Array.isArray(data) ? data : [];
        setMessages(list);
        lastSeenIdRef.current = list.length ? list[list.length - 1].id : null;
        setTimeout(scrollToBottom, 50);
      } catch (e) {
        if (!silent) {
          setError(e.response?.data?.detail || 'Could not load messages');
          setMessages([]);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tenantId, scrollToBottom]
  );

  useEffect(() => {
    if (!open || !tenantId) return undefined;
    loadMessages();
    const interval = setInterval(() => loadMessages({ silent: true }), 12000);
    return () => clearInterval(interval);
  }, [open, tenantId, loadMessages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !tenantId || sending) return;

    setSending(true);
    setDraft('');
    const optimistic = {
      id: `tmp-${Date.now()}`,
      from: 'landlord',
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(scrollToBottom, 30);

    try {
      await tenantAPI.sendChatMessage(tenantId, text);
      await loadMessages({ silent: true });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      setError(e.response?.data?.detail || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Chat with {tenantLabel}
        {tenant?.unit_number ? (
          <Typography variant="caption" display="block" color="text.secondary">
            {tenant.property_name || 'Property'} · Unit {tenant.unit_number}
          </Typography>
        ) : null}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="Close chat"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 2,
            bgcolor: colors.surfaceMuted,
            minHeight: 280,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
              No messages yet. Say hello to your tenant.
            </Typography>
          ) : (
            messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} isMine={msg.from === 'landlord'} />
            ))
          )}
          {error ? (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {error}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: `1px solid ${colors.border}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            multiline
            maxRows={4}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            sx={{ minWidth: 48, ...{ bgcolor: colors.brand } }}
          >
            <Send fontSize="small" />
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
