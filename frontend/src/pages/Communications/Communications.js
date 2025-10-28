import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import communicationsAPI from '../../services/api/communicationsAPI';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import api from '../../services/api/api';
import EmptyState from '../../components/UI/EmptyState';
import StatusBadge from '../../components/UI/StatusBadge';
import { TableSkeleton } from '../../components/UI/LoadingSkeleton';
import NotificationSystem from '../../components/UI/NotificationSystem';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Communications = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openBulkMessageDialog, setOpenBulkMessageDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Tenant selection state
  const [allTenants, setAllTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const { properties } = useSelector((state) => state.properties);
  
  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'both',
    category: 'rent_reminder',
    subject: '',
    body: '',
    variables: []
  });
  
  // Bulk message form state
  const [bulkMessageForm, setBulkMessageForm] = useState({
    recipient_type: 'all',
    method: 'sms',  // Default to SMS only since email is not configured
    property_id: null,
    status_filter: null,
    template_id: null,
    custom_subject: '',
    custom_message: '',
    custom_recipients: []
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
        message: 'Could not load tenants list', 
        severity: 'warning' 
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
      // If custom tenants selected, use them
      const messageData = {
        ...bulkMessageForm,
        custom_recipients: selectedTenants.length > 0 ? selectedTenants : []
      };
      
      if (selectedTenants.length > 0) {
        messageData.recipient_type = 'custom';
      }
      
      const result = await communicationsAPI.sendBulkMessage(messageData);
      setSnackbar({
        open: true,
        message: `Message sent successfully to ${result.sent} recipients!`,
        severity: 'success'
      });
      setOpenBulkMessageDialog(false);
      loadLogs();
      // Reset form and selections
      setBulkMessageForm({
        recipient_type: 'all',
        method: 'sms',
        property_id: null,
        status_filter: null,
        template_id: null,
        custom_subject: '',
        custom_message: '',
        custom_recipients: []
      });
      setSelectedTenants([]);
      setFilterProperty('');
      setFilterStatus('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error sending message: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTenant = (tenantId) => {
    setSelectedTenants(prev => {
      if (prev.includes(tenantId)) {
        return prev.filter(id => id !== tenantId);
      } else {
        return [...prev, tenantId];
      }
    });
  };

  const handleSelectAll = () => {
    const filtered = getFilteredTenants();
    setSelectedTenants(filtered.map(t => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTenants([]);
  };

  const getFilteredTenants = () => {
    return allTenants.filter(tenant => {
      const matchesProperty = !filterProperty || tenant.property_id === parseInt(filterProperty);
      const matchesStatus = !filterStatus || tenant.rent_payment_status === filterStatus;
      return matchesProperty && matchesStatus;
    });
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      await communicationsAPI.createTemplate(templateForm);
      setSnackbar({ open: true, message: 'Template created successfully!', severity: 'success' });
      setOpenTemplateDialog(false);
      loadTemplates();
      // Reset form
      setTemplateForm({
        name: '',
        type: 'both',
        category: 'rent_reminder',
        subject: '',
        body: '',
        variables: []
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error saving template: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTemplates = async () => {
    setLoading(true);
    try {
      const result = await communicationsAPI.seedDefaultTemplates();
      setSnackbar({ open: true, message: `Created ${result.count} default templates!`, severity: 'success' });
      loadTemplates();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error seeding templates', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await communicationsAPI.deleteTemplate(templateId);
        setSnackbar({ open: true, message: 'Template deleted successfully!', severity: 'success' });
        loadTemplates();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting template', severity: 'error' });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            <MessageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Communications Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send bulk SMS messages, manage templates, and track communications
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} • {allTenants.length} tenant{allTenants.length === 1 ? '' : 's'} available
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setOpenBulkMessageDialog(true)}
          size="large"
          disabled={allTenants.length === 0}
        >
          Send Bulk Message
        </Button>
      </Box>

      {allTenants.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No tenants found. Please add tenants in the Tenants section before sending messages.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Templates
                  </Typography>
                  <Typography variant="h4">{templates.length}</Typography>
                </Box>
                <MessageIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Messages Sent
                  </Typography>
                  <Typography variant="h4">{logs.length}</Typography>
                </Box>
                <SendIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    All Recipients
                  </Typography>
                  <Typography variant="h4">{recipientGroups.all?.count || 0}</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Overdue Tenants
                  </Typography>
                  <Typography variant="h4">{recipientGroups.overdue?.count || 0}</Typography>
                </Box>
                <EmailIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="Message Templates" icon={<MessageIcon />} iconPosition="start" />
            <Tab label="Communication Logs" icon={<SendIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Message Templates Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Message Templates</Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={handleSeedTemplates}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Seed Defaults
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenTemplateDialog(true)}
              >
                Create Template
              </Button>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              📝 What are Message Templates?
            </Typography>
            <Typography variant="body2">
              Templates are pre-written SMS messages that you can reuse to save time. When you send a message, you can:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li><Typography variant="body2">Select a template to auto-fill the message</Typography></li>
              <li><Typography variant="body2">Use variables like {'{tenant_name}'}, {'{amount}'}, {'{due_date}'} that automatically personalize for each tenant</Typography></li>
              <li><Typography variant="body2">Create custom templates for common scenarios (rent reminders, payment confirmations, etc.)</Typography></li>
            </ul>
            <Typography variant="body2">
              <strong>Click "Seed Defaults"</strong> to create ready-to-use templates for rent reminders, payment confirmations, and more!
            </Typography>
          </Alert>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.type}
                        size="small"
                        color={template.type === 'email' ? 'primary' : template.type === 'sms' ? 'success' : 'info'}
                      />
                    </TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{template.subject || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTemplate(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <EmptyState
                        type="messages"
                        title="No Message Templates"
                        message="Create templates to save time when sending messages. Click 'Seed Defaults' to get started with pre-made templates."
                        actionText="Seed Default Templates"
                        onAction={handleSeedTemplates}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Communication Logs Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>Communication History</Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell>Failed</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={log.method} size="small" />
                    </TableCell>
                    <TableCell>{log.subject || 'N/A'}</TableCell>
                    <TableCell>{JSON.parse(log.recipient_ids || '[]').length}</TableCell>
                    <TableCell>{log.sent_count || 0}</TableCell>
                    <TableCell>{log.failed_count || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={log.status === 'sent' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <EmptyState
                        type="messages"
                        title="No Messages Sent Yet"
                        message="Your communication history will appear here once you start sending messages to tenants."
                        actionText="Send First Message"
                        onAction={() => setOpenBulkMessageDialog(true)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Bulk Message Dialog */}
      <Dialog open={openBulkMessageDialog} onClose={() => setOpenBulkMessageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Bulk Message</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Message Method</FormLabel>
                  <RadioGroup
                    row
                    value={bulkMessageForm.method}
                    onChange={(e) => setBulkMessageForm({ ...bulkMessageForm, method: e.target.value })}
                  >
                    <FormControlLabel value="sms" control={<Radio />} label="SMS Only (Recommended)" />
                    <FormControlLabel value="email" control={<Radio />} label="Email Only" disabled />
                    <FormControlLabel value="both" control={<Radio />} label="Both" disabled />
                  </RadioGroup>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Email is currently not configured. SMS messages will be sent via Twilio.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Recipients</InputLabel>
                  <Select
                    value={bulkMessageForm.recipient_type}
                    label="Recipients"
                    onChange={(e) => {
                      setBulkMessageForm({ ...bulkMessageForm, recipient_type: e.target.value });
                      if (e.target.value !== 'custom') {
                        setSelectedTenants([]);
                      }
                    }}
                  >
                    <MenuItem value="all">All Tenants ({recipientGroups.all?.count || 0})</MenuItem>
                    <MenuItem value="status">By Payment Status</MenuItem>
                    <MenuItem value="property">By Property</MenuItem>
                    <MenuItem value="custom">Select Individual Tenants</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {bulkMessageForm.recipient_type === 'status' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={bulkMessageForm.status_filter || ''}
                      label="Payment Status"
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
                  <FormControl fullWidth>
                    <InputLabel>Select Property</InputLabel>
                    <Select
                      value={bulkMessageForm.property_id || ''}
                      label="Select Property"
                      onChange={(e) => setBulkMessageForm({ ...bulkMessageForm, property_id: e.target.value || null })}
                      disabled={properties.length === 0}
                    >
                      <MenuItem value="">-- Select Property --</MenuItem>
                      {properties.length === 0 && (
                        <MenuItem disabled>No properties available</MenuItem>
                      )}
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.name} - {property.address}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {properties.length === 0 && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      No properties found. Please add properties first.
                    </Typography>
                  )}
                </Grid>
              )}

              {bulkMessageForm.recipient_type === 'custom' && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Select Tenants ({selectedTenants.length} selected)
                      </Typography>
                      <Box>
                        <Button size="small" onClick={handleSelectAll} sx={{ mr: 1 }}>
                          Select Filtered ({getFilteredTenants().length})
                        </Button>
                        <Button size="small" onClick={handleDeselectAll} color="error">
                          Clear All
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* Filters */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Filter by Property</InputLabel>
                          <Select
                            value={filterProperty}
                            label="Filter by Property"
                            onChange={(e) => setFilterProperty(e.target.value)}
                          >
                            <MenuItem value="">All Properties</MenuItem>
                            {properties.map((property) => (
                              <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Filter by Status</InputLabel>
                          <Select
                            value={filterStatus}
                            label="Filter by Status"
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                            <MenuItem value="due">Due</MenuItem>
                            <MenuItem value="overdue">Overdue</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    {/* Tenant List */}
                    <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <List dense>
                        {getFilteredTenants().map((tenant, index) => (
                          <React.Fragment key={tenant.id}>
                            <ListItem
                              button
                              onClick={() => handleToggleTenant(tenant.id)}
                              sx={{
                                bgcolor: selectedTenants.includes(tenant.id) ? 'primary.50' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={selectedTenants.includes(tenant.id)}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${tenant.first_name} ${tenant.last_name}`}
                                secondary={
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{tenant.phone || 'No phone'}</span>
                                    {tenant.rent_payment_status && (
                                      <Chip
                                        label={tenant.rent_payment_status}
                                        size="small"
                                        color={
                                          tenant.rent_payment_status === 'paid' ? 'success' :
                                          tenant.rent_payment_status === 'overdue' ? 'error' : 'warning'
                                        }
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < getFilteredTenants().length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                        {getFilteredTenants().length === 0 && (
                          <ListItem>
                            <ListItemText
                              primary="No tenants found"
                              secondary="Try adjusting the filters"
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Message Content
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    💡 What are Templates?
                  </Typography>
                  <Typography variant="caption">
                    Templates are pre-written messages you can reuse. They save time and include variables like {'{tenant_name}'}, {'{amount}'}, {'{due_date}'} that auto-fill for each tenant.
                  </Typography>
                </Alert>
                <FormControl fullWidth>
                  <InputLabel>Use Template (Optional)</InputLabel>
                  <Select
                    value={bulkMessageForm.template_id || ''}
                    label="Use Template (Optional)"
                    onChange={(e) => {
                      const templateId = e.target.value || null;
                      setBulkMessageForm({ ...bulkMessageForm, template_id: templateId });
                      
                      // Auto-fill message from template
                      if (templateId) {
                        const template = templates.find(t => t.id === templateId);
                        if (template) {
                          setBulkMessageForm({
                            ...bulkMessageForm,
                            template_id: templateId,
                            custom_message: template.body,
                            custom_subject: template.subject || ''
                          });
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Write Custom Message</MenuItem>
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SMS Message"
                  multiline
                  rows={5}
                  value={bulkMessageForm.custom_message}
                  onChange={(e) => setBulkMessageForm({ ...bulkMessageForm, custom_message: e.target.value })}
                  helperText={
                    <Box component="span">
                      Variables: <strong>{'{tenant_name}'}</strong>, <strong>{'{amount}'}</strong>, <strong>{'{due_date}'}</strong>, <strong>{'{unit_number}'}</strong>
                      <br/>Characters: {bulkMessageForm.custom_message.length}/160 (SMS limit)
                    </Box>
                  }
                  placeholder="Example: Dear {tenant_name}, your rent of ${amount} is due on {due_date}. Please pay on time. Thank you!"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flex: 1, pl: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {selectedTenants.length > 0 
                ? `Will send to ${selectedTenants.length} selected tenant${selectedTenants.length > 1 ? 's' : ''}`
                : bulkMessageForm.recipient_type === 'all' 
                  ? `Will send to ${recipientGroups.all?.count || 0} tenants`
                  : bulkMessageForm.recipient_type === 'status' && bulkMessageForm.status_filter
                    ? `Will send to ${recipientGroups[bulkMessageForm.status_filter]?.count || 0} tenants`
                    : 'Select recipients to continue'
              }
            </Typography>
          </Box>
          <Button onClick={() => setOpenBulkMessageDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendBulkMessage}
            disabled={loading || !bulkMessageForm.custom_message || 
              (bulkMessageForm.recipient_type === 'custom' && selectedTenants.length === 0)}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Sending...' : 'Send SMS'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Message Template</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={templateForm.type}
                    label="Type"
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={templateForm.category}
                    label="Category"
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  >
                    <MenuItem value="rent_reminder">Rent Reminder</MenuItem>
                    <MenuItem value="lease_expiry">Lease Expiry</MenuItem>
                    <MenuItem value="payment_confirmation">Payment Confirmation</MenuItem>
                    <MenuItem value="overdue_notice">Overdue Notice</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject (for Email)"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message Body"
                  multiline
                  rows={6}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                  helperText="Available variables: {tenant_name}, {amount}, {due_date}, {unit_number}"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTemplate}
            disabled={loading || !templateForm.name || !templateForm.body}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Professional Notification System */}
      <NotificationSystem
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default Communications;

