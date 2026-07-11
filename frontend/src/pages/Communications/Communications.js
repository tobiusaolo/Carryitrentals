import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sms as SmsIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import communicationsAPI from '../../services/api/communicationsAPI';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import api from '../../services/api/api';
import DataTable from '../../components/UI/DataTable';
import PageHeader from '../../components/UI/PageHeader';
import { OwnerPage } from '../../components/Owner';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import TableActions from '../../components/UI/TableActions';
import FormSection from '../../components/Forms/FormSection';
import NotificationSystem from '../../components/UI/NotificationSystem';
import {
  colors,
  layout,
  ownerPrimaryButtonSx,
  adminPrimaryButtonSx,
  portalOutlinedButtonSx,
} from '../../theme/designTokens';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const Communications = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const primaryButtonSx = isAdmin ? adminPrimaryButtonSx : ownerPrimaryButtonSx;
  const tabIndicatorColor = isAdmin ? colors.adminAccent : colors.brand;
  const StatusChip = isAdmin ? AdminStatusChip : OwnerStatusChip;

  const [selectedTab, setSelectedTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openBulkMessageDialog, setOpenBulkMessageDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [allTenants, setAllTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const { properties } = useSelector((state) => state.properties);
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'both',
    category: 'rent_reminder',
    subject: '',
    body: '',
    variables: [],
  });
  
  const [bulkMessageForm, setBulkMessageForm] = useState({
    recipient_type: 'all',
    method: 'sms',
    property_id: null,
    status_filter: null,
    template_id: null,
    custom_subject: '',
    custom_message: '',
    custom_recipients: [],
  });

  useEffect(() => {
    loadTemplates();
    loadLogs();
    loadRecipientGroups();
    loadTenants();
    dispatch(fetchProperties());
  }, [dispatch]);

  const loadTenants = async () => {
    try {
      const response = await api.get('/tenants/');
      setAllTenants(response.data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setSnackbar({ 
        open: true, 
        message: 'Could not load tenants',
        severity: 'warning',
      });
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await communicationsAPI.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await communicationsAPI.getCommunicationLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadRecipientGroups = async () => {
    try {
      const data = await communicationsAPI.getRecipientGroups();
      setRecipientGroups(data);
    } catch (error) {
      console.error('Error loading recipient groups:', error);
    }
  };

  const handleSendBulkMessage = async () => {
    setLoading(true);
    try {
      const messageData = {
        ...bulkMessageForm,
        custom_recipients: selectedTenants.length > 0 ? selectedTenants : [],
      };
      
      if (selectedTenants.length > 0) {
        messageData.recipient_type = 'custom';
      }
      
      const result = await communicationsAPI.sendBulkMessage(messageData);
      setSnackbar({
        open: true,
        message: `Sent to ${result.sent} recipient${result.sent === 1 ? '' : 's'}`,
        severity: 'success',
      });
      setOpenBulkMessageDialog(false);
      loadLogs();
      setBulkMessageForm({
        recipient_type: 'all',
        method: 'sms',
        property_id: null,
        status_filter: null,
        template_id: null,
        custom_subject: '',
        custom_message: '',
        custom_recipients: [],
      });
      setSelectedTenants([]);
      setFilterProperty('');
      setFilterStatus('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Send failed: ${error.response?.data?.detail || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTenant = (tenantId) => {
    setSelectedTenants((prev) =>
      prev.includes(tenantId) ? prev.filter((id) => id !== tenantId) : [...prev, tenantId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTenants(getFilteredTenants().map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTenants([]);
  };

  const getFilteredTenants = () =>
    allTenants.filter((tenant) => {
      const matchesProperty = !filterProperty || tenant.property_id === parseInt(filterProperty, 10);
      const matchesStatus = !filterStatus || tenant.rent_payment_status === filterStatus;
      return matchesProperty && matchesStatus;
    });

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      await communicationsAPI.createTemplate(templateForm);
      setSnackbar({ open: true, message: 'Template created', severity: 'success' });
      setOpenTemplateDialog(false);
      loadTemplates();
      setTemplateForm({
        name: '',
        type: 'both',
        category: 'rent_reminder',
        subject: '',
        body: '',
        variables: [],
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Save failed: ${error.response?.data?.detail || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTemplates = async () => {
    setLoading(true);
    try {
      const result = await communicationsAPI.seedDefaultTemplates();
      setSnackbar({ open: true, message: `${result.count} templates added`, severity: 'success' });
      loadTemplates();
    } catch (error) {
      setSnackbar({ open: true, message: 'Could not seed templates', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Delete this template?')) {
      try {
        await communicationsAPI.deleteTemplate(templateId);
        setSnackbar({ open: true, message: 'Template deleted', severity: 'success' });
        loadTemplates();
      } catch (error) {
        setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
      }
    }
  };

  const recipientPreview = () => {
    if (selectedTenants.length > 0) {
      return `${selectedTenants.length} selected`;
    }
    if (bulkMessageForm.recipient_type === 'all') {
      return `${recipientGroups.all?.count || 0} tenants`;
    }
    if (bulkMessageForm.recipient_type === 'status' && bulkMessageForm.status_filter) {
      return `${recipientGroups[bulkMessageForm.status_filter]?.count || 0} tenants`;
    }
    return 'Choose recipients';
  };

  const dialogPaperSx = {
    borderRadius: `${layout.radius.lg}px`,
  };

  const content = (
    <>
      <PageHeader
        variant={isAdmin ? 'admin' : 'owner'}
        title="Messages"
        action={
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setOpenBulkMessageDialog(true)}
          disabled={allTenants.length === 0}
            sx={primaryButtonSx}
        >
            Send SMS
        </Button>
        }
      />

      {allTenants.length === 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: `${layout.radius.sm}px` }}>
          Add tenants before sending messages.
        </Alert>
      )}

      {isAdmin ? (
        <AdminStatStrip
          stats={[
            { title: 'Templates', value: templates.length, icon: <MessageIcon /> },
            { title: 'Sent', value: logs.length, icon: <SendIcon /> },
            { title: 'Recipients', value: recipientGroups.all?.count || 0, icon: <PeopleIcon /> },
            {
              title: 'Overdue',
              value: recipientGroups.overdue?.count || 0,
              icon: <SmsIcon />,
              subtitle: 'Quick-send target',
            },
          ]}
        />
      ) : (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <OwnerStatCard title="Templates" value={templates.length} icon={<MessageIcon />} variantIndex={0} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <OwnerStatCard title="Sent" value={logs.length} icon={<SendIcon />} variantIndex={1} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <OwnerStatCard
              title="Recipients"
              value={recipientGroups.all?.count || 0}
              icon={<PeopleIcon />}
              variantIndex={2}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <OwnerStatCard
              title="Overdue"
              value={recipientGroups.overdue?.count || 0}
              icon={<SmsIcon />}
              variantIndex={0}
              subtitle="Quick-send target"
            />
          </Grid>
        </Grid>
      )}

      {(recipientGroups.overdue?.count || 0) > 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            borderRadius: `${layout.radius.sm}px`,
            border: `1px solid ${alpha(colors.warning, 0.25)}`,
            bgcolor: alpha(colors.warning, 0.06),
          }}
          action={
            <Button
              size="small"
              color="inherit"
              sx={{ fontWeight: 600, textTransform: 'none' }}
              onClick={() => {
                setBulkMessageForm((f) => ({
                  ...f,
                  recipient_type: 'status',
                  status_filter: 'overdue',
                }));
                setOpenBulkMessageDialog(true);
              }}
            >
              Message overdue
            </Button>
          }
        >
          {recipientGroups.overdue.count} tenant{recipientGroups.overdue.count !== 1 ? 's' : ''} overdue on rent
        </Alert>
      )}

      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        sx={{
          minHeight: 44,
          mb: 2,
          borderBottom: `1px solid ${colors.border}`,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            minHeight: 44,
            px: { xs: 1.5, sm: 2 },
            color: colors.textMuted,
            gap: 0.75,
            '&.Mui-selected': { color: colors.text },
          },
          '& .MuiTabs-indicator': { bgcolor: tabIndicatorColor, height: 2 },
        }}
      >
        <Tab icon={<MessageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Templates (${templates.length})`} />
        <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Log (${logs.length})`} />
          </Tabs>

        <TabPanel value={selectedTab} index={0}>
        {templates.length === 0 && (
          <Box
            sx={{
              mb: 2,
              px: 2,
              py: 1.25,
              borderRadius: `${layout.radius.sm}px`,
              bgcolor: colors.surfaceMuted,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              Reusable SMS with {'{tenant_name}'}, {'{amount}'}, {'{due_date}'}. Seed defaults to get started.
            </Typography>
          </Box>
        )}

        <DataTable
                title="Templates"
                columns={[
                  { id: 'name', label: 'Name', render: (t) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.name}</Typography> },
                  {
                    id: 'type',
                    label: 'Type',
                    render: (t) => <StatusChip status={t.type} label={t.type} />,
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    render: (t) => (
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {t.category?.replace(/_/g, ' ')}
                      </Typography>
                    ),
                  },
                  {
                    id: 'body',
                    label: 'Preview',
                    render: (t) => (
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.textMuted,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 280,
                        }}
                      >
                        {t.body}
                      </Typography>
                    ),
                  },
                  {
                    id: 'actions',
                    label: '',
                    align: 'right',
                    width: 56,
                    render: (t) => (
                      <TableActions
                        actions={[
                          {
                            icon: <DeleteIcon fontSize="small" />,
                            label: 'Delete',
                            onClick: () => handleDeleteTemplate(t.id),
                          },
                        ]}
                      />
                    ),
                  },
                ]}
                rows={templates}
                loading={loading}
                emptyTitle="No templates"
                emptyDescription="Seed defaults or create your own."
                emptyIcon={MessageIcon}
                emptyActionLabel="Seed defaults"
                onEmptyAction={handleSeedTemplates}
                toolbar={
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" onClick={handleSeedTemplates} disabled={loading} sx={portalOutlinedButtonSx}>
                      Seed defaults
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenTemplateDialog(true)}
                      sx={primaryButtonSx}
              >
                      New template
              </Button>
            </Box>
                }
        />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
        <DataTable
              title="Message log"
              columns={[
                {
                  id: 'date',
                  label: 'Date',
                  render: (log) =>
                    new Date(log.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }),
                },
                {
                  id: 'method',
                  label: 'Channel',
                  render: (log) => <StatusChip status={log.method} label={log.method?.toUpperCase()} />,
                },
                {
                  id: 'recipients',
                  label: 'Recipients',
                  render: (log) => JSON.parse(log.recipient_ids || '[]').length,
                },
                { id: 'sent', label: 'Sent', render: (log) => log.sent_count || 0 },
                { id: 'failed', label: 'Failed', render: (log) => log.failed_count || 0 },
                {
                  id: 'status',
                  label: 'Status',
                  render: (log) => <StatusChip status={log.status} />,
                },
              ]}
              rows={logs}
              loading={loading}
              emptyTitle="No messages yet"
              emptyDescription="Sent SMS history appears here."
              emptyIcon={SendIcon}
              emptyActionLabel="Send SMS"
              onEmptyAction={() => setOpenBulkMessageDialog(true)}
        />
        </TabPanel>

      {/* Send SMS dialog */}
      <Dialog
        open={openBulkMessageDialog}
        onClose={() => setOpenBulkMessageDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Send SMS</DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
              <Grid item xs={12}>
              <FormSection title="Delivery" subtitle="SMS via Twilio" first>
                  <RadioGroup
                    row
                    value={bulkMessageForm.method}
                    onChange={(e) => setBulkMessageForm({ ...bulkMessageForm, method: e.target.value })}
                  >
                  <FormControlLabel value="sms" control={<Radio size="small" />} label="SMS" />
                  <FormControlLabel value="email" control={<Radio size="small" />} label="Email" disabled />
                  <FormControlLabel value="both" control={<Radio size="small" />} label="Both" disabled />
                  </RadioGroup>
              </FormSection>
              </Grid>
              
              <Grid item xs={12}>
              <FormControl fullWidth size="small">
                  <InputLabel>Recipients</InputLabel>
                  <Select
                    value={bulkMessageForm.recipient_type}
                    label="Recipients"
                    onChange={(e) => {
                      setBulkMessageForm({ ...bulkMessageForm, recipient_type: e.target.value });
                    if (e.target.value !== 'custom') setSelectedTenants([]);
                  }}
                >
                  <MenuItem value="all">All tenants ({recipientGroups.all?.count || 0})</MenuItem>
                  <MenuItem value="status">By rent status</MenuItem>
                  <MenuItem value="property">By property</MenuItem>
                  <MenuItem value="custom">Pick individuals</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {bulkMessageForm.recipient_type === 'status' && (
                <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Rent status</InputLabel>
                    <Select
                      value={bulkMessageForm.status_filter || ''}
                    label="Rent status"
                      onChange={(e) => setBulkMessageForm({ ...bulkMessageForm, status_filter: e.target.value })}
                    >
                      <MenuItem value="paid">Paid ({recipientGroups.paid?.count || 0})</MenuItem>
                      <MenuItem value="due">Due ({recipientGroups.due?.count || 0})</MenuItem>
                      <MenuItem value="overdue">Overdue ({recipientGroups.overdue?.count || 0})</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {bulkMessageForm.recipient_type === 'property' && (
                <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Property</InputLabel>
                    <Select
                      value={bulkMessageForm.property_id || ''}
                    label="Property"
                    onChange={(e) =>
                      setBulkMessageForm({ ...bulkMessageForm, property_id: e.target.value || null })
                    }
                      disabled={properties.length === 0}
                    >
                    <MenuItem value="">Select property</MenuItem>
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                        {property.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {bulkMessageForm.recipient_type === 'custom' && (
                <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: `${layout.radius.sm}px`,
                    borderColor: colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: colors.surfaceMuted,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {selectedTenants.length} selected
                      </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" onClick={handleSelectAll} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        All ({getFilteredTenants().length})
                        </Button>
                      <Button size="small" onClick={handleDeselectAll} color="inherit" sx={{ textTransform: 'none' }}>
                        Clear
                        </Button>
                      </Box>
                    </Box>
                    
                  <Grid container spacing={1.5} sx={{ p: 2, pb: 1 }}>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                        <InputLabel>Property</InputLabel>
                          <Select
                            value={filterProperty}
                          label="Property"
                            onChange={(e) => setFilterProperty(e.target.value)}
                          >
                          <MenuItem value="">All</MenuItem>
                            {properties.map((property) => (
                            <MenuItem key={property.id} value={property.id}>
                              {property.name}
                            </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                          <Select
                            value={filterStatus}
                          label="Status"
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                          <MenuItem value="">All</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="due">Due</MenuItem>
                            <MenuItem value="overdue">Overdue</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                  <Box sx={{ maxHeight: 260, overflow: 'auto' }}>
                    <List dense disablePadding>
                        {getFilteredTenants().map((tenant, index) => (
                          <React.Fragment key={tenant.id}>
                          <ListItemButton
                              onClick={() => handleToggleTenant(tenant.id)}
                            selected={selectedTenants.includes(tenant.id)}
                              sx={{
                              py: 0.75,
                              '&.Mui-selected': { bgcolor: colors.brandSoft },
                              '&.Mui-selected:hover': { bgcolor: alpha(colors.brand, 0.12) },
                              }}
                            >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                  edge="start"
                                size="small"
                                  checked={selectedTenants.includes(tenant.id)}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${tenant.first_name} ${tenant.last_name}`}
                              secondary={tenant.phone || 'No phone'}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            {tenant.rent_payment_status && (
                              <StatusChip status={tenant.rent_payment_status} />
                            )}
                          </ListItemButton>
                            {index < getFilteredTenants().length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                        {getFilteredTenants().length === 0 && (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            No tenants match filters
                          </Typography>
                        </Box>
                        )}
                      </List>
                    </Box>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
              <FormSection title="Message">
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Template (optional)</InputLabel>
                  <Select
                    value={bulkMessageForm.template_id || ''}
                    label="Template (optional)"
                    onChange={(e) => {
                      const templateId = e.target.value || null;
                      if (templateId) {
                        const template = templates.find((t) => t.id === templateId);
                        if (template) {
                          setBulkMessageForm({
                            ...bulkMessageForm,
                            template_id: templateId,
                            custom_message: template.body,
                            custom_subject: template.subject || '',
                          });
                          return;
                        }
                      }
                      setBulkMessageForm({ ...bulkMessageForm, template_id: templateId });
                    }}
                  >
                    <MenuItem value="">Custom message</MenuItem>
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="SMS body"
                  multiline
                  minRows={4}
                  value={bulkMessageForm.custom_message}
                  onChange={(e) => setBulkMessageForm({ ...bulkMessageForm, custom_message: e.target.value })}
                  helperText={`${bulkMessageForm.custom_message.length}/160 · Variables: {tenant_name}, {amount}, {due_date}, {unit_number}`}
                  placeholder="Hi {tenant_name}, your rent of {amount} is due {due_date}."
                />
              </FormSection>
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600 }}>
            {recipientPreview()}
            </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpenBulkMessageDialog(false)} sx={portalOutlinedButtonSx} variant="outlined">
              Cancel
            </Button>
          <Button
            variant="contained"
            onClick={handleSendBulkMessage}
              disabled={
                loading ||
                !bulkMessageForm.custom_message ||
                (bulkMessageForm.recipient_type === 'custom' && selectedTenants.length === 0)
              }
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              sx={primaryButtonSx}
            >
              {loading ? 'Sending…' : 'Send'}
          </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Create template dialog */}
      <Dialog
        open={openTemplateDialog}
        onClose={() => setOpenTemplateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>New template</DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                size="small"
                label="Name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
              <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={templateForm.type}
                    label="Type"
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  >
                    <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
              <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={templateForm.category}
                    label="Category"
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  >
                  <MenuItem value="rent_reminder">Rent reminder</MenuItem>
                  <MenuItem value="lease_expiry">Lease expiry</MenuItem>
                  <MenuItem value="payment_confirmation">Payment confirmation</MenuItem>
                  <MenuItem value="overdue_notice">Overdue notice</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                size="small"
                label="Subject (email)"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                label="Body"
                  multiline
                minRows={5}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                helperText="Variables: {tenant_name}, {amount}, {due_date}, {unit_number}"
                />
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenTemplateDialog(false)} sx={portalOutlinedButtonSx} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTemplate}
            disabled={loading || !templateForm.name || !templateForm.body}
            sx={primaryButtonSx}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationSystem
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </>
  );

  if (isAdmin) {
    return <AdminPage>{content}</AdminPage>;
  }

  return <OwnerPage>{content}</OwnerPage>;
};

export default Communications;
