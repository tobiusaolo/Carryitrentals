import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Home as HomeIcon,
  Event as CalendarIcon,
  AttachMoney,
  CheckCircle,
  Cancel,
  Payment,
  AccountBalanceWallet,
  Visibility,
  OpenInNew,
  Notifications as NotifyIcon,
} from '@mui/icons-material';
import api from '../../services/api/api';
import { propertyAPI } from '../../services/api/propertyAPI';
import { walletAPI } from '../../services/api/subscriptionAPI';
import NotificationSystem from '../../components/UI/NotificationSystem';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatStrip from '../../components/Owner/OwnerStatStrip';
import AirbnbListingFormFields from '../../components/Forms/AirbnbListingFormFields';
import {
  emptyAirbnbFormState,
  MIN_AIRBNB_IMAGES,
  MAX_AIRBNB_IMAGES,
  getBookingStatusMeta,
  getAirbnbPropertyTypeLabel,
  getListingStatusMeta,
} from '../../constants/airbnb';
import OwnerDataTable from '../../components/Owner/OwnerDataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import TableActions from '../../components/UI/TableActions';
import PageHeader from '../../components/UI/PageHeader';
import { formatMoney } from '../../utils/formatMoney';
import {
  colors,
  ownerPrimaryButtonSx,
  portalOutlinedButtonSx,
} from '../../theme/designTokens';
import AirbnbCalendarDialog from '../../components/Airbnb/AirbnbCalendarDialog';
import ListingRequestDialog from '../../components/Owner/ListingRequestDialog';
import { fetchMyListingRequests } from '../../services/api/listingRequestAPI';
import OwnerListingRequestsPanel from '../../components/Owner/OwnerListingRequestsPanel';

function formatBookingDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function bookingStatusOf(booking) {
  const raw = booking?.status?.value || booking?.status || 'pending';
  return raw === 'approved' ? 'confirmed' : String(raw).toLowerCase();
}

function paymentStatusOf(booking) {
  const raw = booking?.payment_status?.value || booking?.payment_status || 'pending';
  return String(raw).toLowerCase();
}

const OwnerAirbnb = () => {
  const [airbnbs, setAirbnbs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAirbnb, setEditingAirbnb] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [formData, setFormData] = useState(emptyAirbnbFormState());
  const [calendarListing, setCalendarListing] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [listingRequests, setListingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const loadProperties = useCallback(async () => {
    try {
      const response = await propertyAPI.getAllProperties();
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  }, []);

  const loadWallet = useCallback(async () => {
    try {
      const { data } = await walletAPI.getMyWallet();
      setWallet(data);
    } catch (err) {
      console.error('Error loading wallet:', err);
    }
  }, []);

  const loadAllBookings = useCallback(async (listingRows) => {
    try {
      const source = listingRows?.length ? listingRows : (await api.get('/airbnb/')).data || [];
      const allBookings = [];

      for (const airbnb of source) {
        try {
          const bookingsResponse = await api.get(`/airbnb/${airbnb.id}/bookings`);
          const bookingsWithAirbnb = bookingsResponse.data.map((booking) => ({
            ...booking,
            airbnb_title: airbnb.title,
            airbnb_location: airbnb.location,
          }));
          allBookings.push(...bookingsWithAirbnb);
        } catch (err) {
          console.error(`Error loading bookings for Airbnb ${airbnb.id}:`, err);
        }
      }

      setBookings(allBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, []);

  const loadAirbnbs = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const response = await api.get('/airbnb/');
      const airbnbsWithImages = response.data.map((airbnb) => {
        const copy = { ...airbnb };
        if (copy.images && typeof copy.images === 'string') {
          copy.images = copy.images.split('|||IMAGE_SEPARATOR|||').filter((img) => img.trim());
        } else {
          copy.images = [];
        }
        return copy;
      });

      setAirbnbs(airbnbsWithImages);
      await loadAllBookings(airbnbsWithImages);
    } catch (err) {
      console.error('Error loading Airbnbs:', err);
      setNotification({
        open: true,
        message: 'Failed to load short-stay listings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAllBookings]);

  useEffect(() => {
    loadAirbnbs();
    loadProperties();
    loadWallet();
  }, [loadAirbnbs, loadProperties, loadWallet]);

  const loadListingRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const rows = await fetchMyListingRequests('short_stay');
      setListingRequests(rows);
    } catch (err) {
      console.error('Failed to load listing requests:', err);
      setListingRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListingRequests();
  }, [loadListingRequests]);

  const stats = useMemo(() => {
    const totalListings = airbnbs.length;
    const availableListings = airbnbs.filter((a) => a.is_available === 'available').length;
    const bookedListings = airbnbs.filter((a) => a.is_available === 'booked').length;
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter((b) => paymentStatusOf(b) === 'paid');
    const collected = paidBookings.reduce((sum, b) => sum + Number(b.prepayment_amount || b.total_amount || 0), 0);
    const pendingPayments = bookings.filter((b) => {
      const ps = paymentStatusOf(b);
      return ps === 'pending' || ps === 'partial';
    }).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCollected = paidBookings
      .filter((b) => {
        const d = new Date(b.payment_date || b.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + Number(b.prepayment_amount || b.total_amount || 0), 0);

    return {
      totalListings,
      availableListings,
      bookedListings,
      totalBookings,
      collected,
      monthlyCollected,
      pendingPayments,
    };
  }, [airbnbs, bookings]);

  const paymentRows = useMemo(
    () =>
      bookings
        .filter((b) => paymentStatusOf(b) === 'paid' || b.payment_reference || b.prepayment_amount)
        .map((b) => ({
          id: b.id,
          booking_id: b.id,
          guest_name: b.guest_name,
          airbnb_title: b.airbnb_title,
          amount: b.prepayment_amount || b.total_amount,
          currency: b.currency || 'UGX',
          payment_status: paymentStatusOf(b),
          payment_method: b.payment_method,
          payment_reference: b.payment_reference,
          payment_date: b.payment_date,
          total_amount: b.total_amount,
          remaining_amount: b.remaining_amount,
        })),
    [bookings]
  );

  const walletTransactions = wallet?.transactions || [];

  const handlePropertyChange = (propertyId) => {
    const prop = properties.find((p) => String(p.id) === String(propertyId));
    setFormData((prev) => ({
      ...prev,
      property_id: propertyId,
      location: prop ? [prop.address, prop.city].filter(Boolean).join(', ') || prev.location : prev.location,
      country: prop?.country || prev.country,
    }));
  };

  const handleOpenDialog = (airbnb = null) => {
    if (airbnb) {
      setEditingAirbnb(airbnb);
      setFormData({
        ...emptyAirbnbFormState(),
        title: airbnb.title || '',
        description: airbnb.description || '',
        location: airbnb.location || '',
        country: airbnb.country || emptyAirbnbFormState().country,
        property_type: airbnb.property_type || emptyAirbnbFormState().property_type,
        price_per_night: airbnb.price_per_night || '',
        currency: airbnb.currency || emptyAirbnbFormState().currency,
        max_guests: airbnb.max_guests || 2,
        bedrooms: airbnb.bedrooms || 1,
        bathrooms: airbnb.bathrooms || 1,
        amenities: airbnb.amenities || '',
        house_rules: airbnb.house_rules || '',
        is_available: airbnb.is_available || 'available',
        property_id: airbnb.property_id || '',
      });
      setSelectedImages(airbnb.images || []);
    } else {
      setEditingAirbnb(null);
      setFormData(emptyAirbnbFormState());
      setSelectedImages([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAirbnb(null);
    setSelectedImages([]);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (selectedImages.length + files.length > MAX_AIRBNB_IMAGES) {
      setNotification({
        open: true,
        message: `Maximum ${MAX_AIRBNB_IMAGES} images allowed`,
        severity: 'error',
      });
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.property_id) {
      setNotification({
        open: true,
        message: 'Select one of your properties before saving this listing.',
        severity: 'warning',
      });
      return;
    }
    if (!editingAirbnb && selectedImages.length < MIN_AIRBNB_IMAGES) {
      setNotification({
        open: true,
        message: `Add at least ${MIN_AIRBNB_IMAGES} photos before saving`,
        severity: 'warning',
      });
      return;
    }
    setSaveLoading(true);
    try {
      const imageStrings = [];
      for (const file of selectedImages) {
        if (typeof file === 'string') {
          imageStrings.push(file);
        } else {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          imageStrings.push(base64);
        }
      }

      const airbnbData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        max_guests: parseInt(formData.max_guests, 10),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseInt(formData.bathrooms, 10),
        images: imageStrings.length > 0 ? imageStrings.join('|||IMAGE_SEPARATOR|||') : null,
      };

      if (editingAirbnb) {
        await api.put(`/airbnb/${editingAirbnb.id}`, airbnbData);
        setNotification({ open: true, message: 'Short-stay listing updated.', severity: 'success' });
      } else {
        await api.post('/airbnb/', airbnbData);
        setNotification({ open: true, message: 'Short-stay listing created.', severity: 'success' });
      }

      handleCloseDialog();
      loadAirbnbs(true);
    } catch (err) {
      console.error('Error saving Airbnb:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to save listing',
        severity: 'error',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this short-stay listing?')) return;
    try {
      await api.delete(`/airbnb/${id}`);
      setNotification({ open: true, message: 'Listing deleted.', severity: 'success' });
      loadAirbnbs(true);
    } catch (err) {
      console.error('Error deleting Airbnb:', err);
      setNotification({ open: true, message: 'Failed to delete listing', severity: 'error' });
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const id = String(bookingId);
    try {
      await api.put(`/airbnb/bookings/${id}`, { status: newStatus });
      setNotification({
        open: true,
        message: `Booking ${newStatus.replace('_', ' ')}.`,
        severity: 'success',
      });
      loadAirbnbs(true);
    } catch (err) {
      console.error('Error updating booking:', err);
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'Failed to update booking',
        severity: 'error',
      });
    }
  };

  const listingColumns = useMemo(
    () => [
      {
        id: 'title',
        label: 'Listing',
        render: (a) => (
          <>
            <Typography variant="body2" fontWeight={600}>
              {a.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getAirbnbPropertyTypeLabel(a.property_type)} · {a.bedrooms} bed · {a.max_guests} guests
            </Typography>
          </>
        ),
      },
      {
        id: 'property',
        label: 'Property',
        render: (a) =>
          a.property_name ||
          properties.find((p) => String(p.id) === String(a.property_id))?.name ||
          '—',
      },
      {
        id: 'location',
        label: 'Location',
        render: (a) => a.location || '—',
      },
      {
        id: 'rate',
        label: 'Nightly rate',
        render: (a) => formatMoney(a.price_per_night, a.currency || 'UGX'),
      },
      {
        id: 'status',
        label: 'Status',
        render: (a) => (
          <OwnerStatusChip
            status={a.is_available}
            label={getListingStatusMeta(a.is_available).label}
          />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        render: (a) => (
          <TableActions
            actions={[
              {
                icon: <CalendarIcon fontSize="small" />,
                label: 'Calendar',
                onClick: () => {
                  setCalendarListing(a);
                  setCalendarOpen(true);
                },
              },
            ]}
          />
        ),
      },
    ],
    [properties]
  );

  const bookingColumns = useMemo(
    () => [
      {
        id: 'property',
        label: 'Listing',
        render: (booking) => (
          <>
            <Typography variant="body2" fontWeight={600}>
              {booking.airbnb_title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {booking.airbnb_location}
            </Typography>
          </>
        ),
      },
      {
        id: 'guest',
        label: 'Guest',
        render: (booking) => (
          <>
            <Typography variant="body2" fontWeight={600}>
              {booking.guest_name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {booking.guest_email || booking.guest_phone || '—'}
            </Typography>
          </>
        ),
      },
      {
        id: 'dates',
        label: 'Stay',
        render: (b) => (
          <>
            <Typography variant="body2">{formatBookingDate(b.check_in)}</Typography>
            <Typography variant="caption" color="text.secondary">
              → {formatBookingDate(b.check_out)} · {b.number_of_guests || '—'} guests
            </Typography>
          </>
        ),
      },
      {
        id: 'total',
        label: 'Total',
        render: (booking) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {formatMoney(booking.total_amount, booking.currency || 'UGX')}
            </Typography>
            {booking.prepayment_amount != null && (
              <Typography variant="caption" color="text.secondary">
                Prepaid {formatMoney(booking.prepayment_amount, booking.currency || 'UGX')}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'status',
        label: 'Booking',
        render: (b) => (
          <OwnerStatusChip status={bookingStatusOf(b)} label={getBookingStatusMeta(b.status).label} />
        ),
      },
      {
        id: 'payment_status',
        label: 'Payment',
        render: (b) => <OwnerStatusChip status={paymentStatusOf(b)} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        render: (booking) => {
          const st = bookingStatusOf(booking);
          const actions = [
            {
              icon: <Visibility fontSize="small" />,
              label: 'View details',
              onClick: () => setBookingDetail(booking),
            },
          ];

          if (st === 'pending') {
            actions.push(
              {
                icon: <CheckCircle fontSize="small" />,
                label: 'Confirm booking',
                onClick: () => handleUpdateBookingStatus(booking.id, 'confirmed'),
              },
              {
                icon: <Cancel fontSize="small" />,
                label: 'Decline booking',
                onClick: () => handleUpdateBookingStatus(booking.id, 'cancelled'),
              }
            );
          } else if (st === 'confirmed') {
            actions.push({
              icon: <CheckCircle fontSize="small" />,
              label: 'Mark completed',
              onClick: () => handleUpdateBookingStatus(booking.id, 'completed'),
            });
          }

          if (booking.id && paymentStatusOf(booking) !== 'paid') {
            actions.push({
              icon: <OpenInNew fontSize="small" />,
              label: 'Guest payment page',
              onClick: () => window.open(`/airbnb/payment/${booking.id}`, '_blank'),
            });
          }

          return <TableActions actions={actions} />;
        },
      },
    ],
    []
  );

  const paymentColumns = useMemo(
    () => [
      {
        id: 'guest',
        label: 'Guest',
        render: (p) => (
          <>
            <Typography variant="body2" fontWeight={600}>
              {p.guest_name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {p.airbnb_title}
            </Typography>
          </>
        ),
      },
      {
        id: 'amount',
        label: 'Collected',
        render: (p) => (
          <Typography variant="body2" fontWeight={600}>
            {formatMoney(p.amount, p.currency)}
          </Typography>
        ),
      },
      {
        id: 'reference',
        label: 'Reference',
        render: (p) => (
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textMuted }}>
            {p.payment_reference || `#${p.booking_id}`}
          </Typography>
        ),
      },
      {
        id: 'method',
        label: 'Method',
        render: (p) => (
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {(p.payment_method || '—').replace(/_/g, ' ')}
          </Typography>
        ),
      },
      {
        id: 'payment_status',
        label: 'Status',
        render: (p) => <OwnerStatusChip status={p.payment_status} />,
      },
      {
        id: 'date',
        label: 'Paid',
        render: (p) => formatBookingDate(p.payment_date),
      },
    ],
    []
  );

  if (loading) {
    return (
      <OwnerPageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: colors.brand }} />
        </Box>
      </OwnerPageContainer>
    );
  }

  return (
    <OwnerPageContainer>
      <PageHeader
        title="Short stays"
        action={
          <Button
            variant="contained"
            startIcon={<NotifyIcon />}
            onClick={() => setRequestDialogOpen(true)}
            disabled={properties.length === 0}
            sx={ownerPrimaryButtonSx}
          >
            Request short stay
          </Button>
        }
      />

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {properties.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add a property first (Properties tab), then request a short-stay listing.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Short-stay listings are published by CarryIT admins. Use <strong>Request short stay</strong> to
        notify the team — guest bookings and payouts appear below once live.
      </Alert>

      <OwnerStatStrip
        sx={{ mb: 2 }}
        stats={[
          {
            title: 'Listings',
            value: String(stats.totalListings),
            icon: <HomeIcon />,
            variantIndex: 0,
            subtitle: `${stats.availableListings} open · ${stats.bookedListings} booked`,
          },
          {
            title: 'Bookings',
            value: String(stats.totalBookings),
            icon: <CalendarIcon />,
            variantIndex: 1,
            subtitle: `${stats.pendingPayments} awaiting payment`,
          },
          {
            title: 'Wallet balance',
            value: formatMoney(wallet?.balance ?? 0, wallet?.currency || 'UGX'),
            icon: <AccountBalanceWallet />,
            variantIndex: 2,
            subtitle: 'After platform fee',
          },
          {
            title: 'Collected',
            value: formatMoney(stats.monthlyCollected, 'UGX'),
            icon: <AttachMoney />,
            variantIndex: 0,
            subtitle: `${formatMoney(stats.collected, 'UGX')} all-time prepaid`,
          },
        ]}
      />

      <OwnerListingRequestsPanel
        requests={listingRequests}
        requestType="short_stay"
        loading={requestsLoading}
        onRefresh={loadListingRequests}
      />

      <OwnerDataTable
        title="Short-stay listings"
        subtitle="Published by CarryIT — calendar and bookings below."
        columns={listingColumns}
        rows={airbnbs}
        loading={refreshing && !airbnbs.length}
        emptyTitle="No short-stay listings"
        emptyDescription="Request a short stay and an admin will publish your nightly listing."
        emptyIcon={HomeIcon}
        emptyActionLabel="Request short stay"
        onEmptyAction={() => setRequestDialogOpen(true)}
      />

      <Box sx={{ mt: 3 }}>
        <OwnerDataTable
          title="Bookings"
          subtitle="Guest stay requests — confirm after reviewing dates and payment status."
          columns={bookingColumns}
          rows={bookings}
          loading={refreshing && !bookings.length}
          emptyTitle="No bookings yet"
          emptyDescription="Bookings appear when guests request stays on your listings."
          emptyIcon={CalendarIcon}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <OwnerDataTable
          title="Payments"
          subtitle="Guest prepayments via Pesapal or mobile money."
          columns={paymentColumns}
          rows={paymentRows}
          loading={refreshing && !paymentRows.length}
          emptyTitle="No payments yet"
          emptyDescription="Payments appear when guests complete checkout."
          emptyIcon={Payment}
        />
      </Box>

      {walletTransactions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <OwnerDataTable
            title="Wallet activity"
            subtitle="Credits from short-stay bookings."
            columns={[
              {
                id: 'desc',
                label: 'Description',
                render: (t) => t.description || t.category || '—',
              },
              {
                id: 'amount',
                label: 'Amount',
                render: (t) => (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={t.type === 'credit' ? colors.success : colors.text}
                  >
                    {t.type === 'credit' ? '+' : '−'}
                    {formatMoney(Math.abs(t.amount), wallet?.currency || 'UGX')}
                  </Typography>
                ),
              },
              {
                id: 'type',
                label: 'Type',
                render: (t) => <OwnerStatusChip status={t.type} label={t.type} />,
              },
              {
                id: 'date',
                label: 'Date',
                render: (t) => formatBookingDate(t.created_at),
              },
            ]}
            rows={walletTransactions}
            searchable={false}
            hidePaginationWhenEmpty
          />
        </Box>
      )}

      <ListingRequestDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        requestType="short_stay"
        properties={properties}
        onSubmitted={loadListingRequests}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingAirbnb ? 'Edit short-stay listing' : 'Add short-stay listing'}</DialogTitle>
        <DialogContent>
          <AirbnbListingFormFields
            formData={formData}
            setFormData={setFormData}
            properties={properties}
            requireProperty
            onPropertyChange={handlePropertyChange}
            selectedImages={selectedImages}
            onImageSelect={handleImageSelect}
            onRemoveImage={handleRemoveImage}
            showOwnerNote
          />
          {uploadingImages && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing images...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} sx={portalOutlinedButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saveLoading || (!editingAirbnb && selectedImages.length < MIN_AIRBNB_IMAGES)}
            sx={ownerPrimaryButtonSx}
          >
            {saveLoading ? 'Saving…' : `${editingAirbnb ? 'Update' : 'Create'} listing`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(bookingDetail)} onClose={() => setBookingDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking details</DialogTitle>
        <DialogContent dividers>
          {bookingDetail && (
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <strong>Listing:</strong> {bookingDetail.airbnb_title}
              </Typography>
              <Typography variant="body2">
                <strong>Guest:</strong> {bookingDetail.guest_name} · {bookingDetail.guest_phone}
              </Typography>
              {bookingDetail.guest_email && (
                <Typography variant="body2">
                  <strong>Email:</strong> {bookingDetail.guest_email}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Stay:</strong> {formatBookingDate(bookingDetail.check_in)} →{' '}
                {formatBookingDate(bookingDetail.check_out)} ({bookingDetail.number_of_guests} guests)
              </Typography>
              <Divider />
              <Typography variant="body2">
                <strong>Total:</strong> {formatMoney(bookingDetail.total_amount, bookingDetail.currency || 'UGX')}
              </Typography>
              <Typography variant="body2">
                <strong>Prepaid:</strong>{' '}
                {formatMoney(bookingDetail.prepayment_amount, bookingDetail.currency || 'UGX')}
              </Typography>
              {bookingDetail.remaining_amount != null && (
                <Typography variant="body2">
                  <strong>Balance due:</strong>{' '}
                  {formatMoney(bookingDetail.remaining_amount, bookingDetail.currency || 'UGX')}
                </Typography>
              )}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <OwnerStatusChip status={bookingStatusOf(bookingDetail)} label="Booking" />
                <OwnerStatusChip status={paymentStatusOf(bookingDetail)} label="Payment" />
              </Stack>
              {bookingDetail.payment_reference && (
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textMuted }}>
                  Ref: {bookingDetail.payment_reference}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {bookingDetail?.id && paymentStatusOf(bookingDetail) !== 'paid' && (
            <Button
              startIcon={<OpenInNew />}
              onClick={() => window.open(`/airbnb/payment/${bookingDetail.id}`, '_blank')}
            >
              Guest payment page
            </Button>
          )}
          <Button onClick={() => setBookingDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <AirbnbCalendarDialog
        open={calendarOpen}
        onClose={() => {
          setCalendarOpen(false);
          setCalendarListing(null);
        }}
        listing={calendarListing}
        onUpdated={() => loadAirbnbs(true)}
      />

      <NotificationSystem
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </OwnerPageContainer>
  );
};

export default OwnerAirbnb;
