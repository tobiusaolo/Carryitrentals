import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Apartment as ApartmentIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  Home as HomeIcon,
  Notifications as NotifyIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { unitAPI } from '../../services/api/unitAPI';
import { propertyAPI } from '../../services/api/propertyAPI';
import { isCommercialUnit } from '../../constants/rentalUnit';
import {
  countListingImages,
  isListingDraft,
  isListingPublished,
  MIN_RENTAL_LISTING_IMAGES,
  formatRentalApiError,
} from '../../utils/rentalUnitForm';
import { normalizeRentalStatus } from '../../utils/rentalStatus';
import PageHeader from '../../components/UI/PageHeader';
import {
  OwnerPage,
  OwnerStatStrip,
  OwnerDataTable,
  ListingRequestDialog,
  OwnerListingRequestsPanel,
} from '../../components/Owner';
import TableActions from '../../components/UI/TableActions';
import { formatMoney } from '../../utils/formatMoney';
import { colors, ownerPrimaryButtonSx } from '../../theme/designTokens';
import { resolveMediaUrl } from '../../config/api';
import { fetchMyListingRequests } from '../../services/api/listingRequestAPI';
import useOwnerSoftRefresh from '../../hooks/useOwnerSoftRefresh';
import { useRegisterPageMeta } from '../../contexts/PageMetaContext';
import RentalVideoField from '../../components/Forms/RentalVideoField';
import ListingVideoPlayer from '../../components/Public/ListingVideoPlayer';
import ListingVideoBadge from '../../components/Public/ListingVideoBadge';
import ListingAvailabilityMeta from '../../components/Public/ListingAvailabilityMeta';
import ListingInspectionBookingsBadge from '../../components/Public/ListingInspectionBookingsBadge';
import { showSuccess, showError } from '../../utils/sweetAlert';

function listingImageUrls(images) {
  if (!images) return [];
  return images
    .split('|||IMAGE_SEPARATOR|||')
    .filter((img) => img.trim())
    .map((img) => {
      if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      return resolveMediaUrl(img);
    });
}

const UnitsForRent = () => {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rentalUnits, setRentalUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [internalUnitsAll, setInternalUnitsAll] = useState([]);
  const [viewingUnit, setViewingUnit] = useState(null);
  const [viewingVideo, setViewingVideo] = useState(null);
  const [removeListingVideo, setRemoveListingVideo] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [listingRequests, setListingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestPrefill, setRequestPrefill] = useState({ propertyId: '', unitId: '', title: '' });

  useRegisterPageMeta({
    title: 'Listings',
    subtitle: 'Marketplace units published by CarryIT',
  });

  const loadRentalUnits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await unitAPI.getRentalUnits();
      setRentalUnits(
        (response.data || []).map((u) => ({ ...u, status: normalizeRentalStatus(u.status) }))
      );
      setError(null);
    } catch (err) {
      console.error('Failed to load rental units:', err);
      setError(formatRentalApiError(err, 'Failed to load rental units'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const response = await propertyAPI.getAllProperties();
      setProperties(response.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  }, []);

  const loadInternalUnits = useCallback(async () => {
    try {
      const response = await unitAPI.getUnits();
      setInternalUnitsAll(response.data || []);
    } catch (err) {
      console.error('Failed to load internal units:', err);
    }
  }, []);

  const loadListingRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const rows = await fetchMyListingRequests('rental_unit');
      setListingRequests(rows);
    } catch (err) {
      console.error('Failed to load listing requests:', err);
      setListingRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadRentalUnits(), loadProperties(), loadInternalUnits(), loadListingRequests()]);
  }, [loadRentalUnits, loadProperties, loadInternalUnits, loadListingRequests]);

  useEffect(() => {
    if (!user) return;
    refreshAll();
  }, [user?.id, user?.role, refreshAll]);

  useOwnerSoftRefresh(refreshAll);

  const listedInternalIds = useMemo(
    () => new Set(rentalUnits.map((u) => String(u.internal_unit_id || '')).filter(Boolean)),
    [rentalUnits]
  );

  const unlistedInternalUnits = useMemo(
    () => internalUnitsAll.filter((u) => !listedInternalIds.has(String(u.id))),
    [internalUnitsAll, listedInternalIds]
  );

  const draftListings = useMemo(() => rentalUnits.filter((u) => isListingDraft(u)), [rentalUnits]);
  const publishedListings = useMemo(() => rentalUnits.filter((u) => isListingPublished(u)), [rentalUnits]);

  const openViewUnit = (unit) => {
    setViewingUnit(unit);
    setViewingVideo(null);
    setRemoveListingVideo(false);
  };

  const handleSaveListingVideo = async () => {
    if (!viewingUnit) return;
    if (!viewingVideo && !(removeListingVideo && viewingUnit.video_url)) return;
    setVideoSaving(true);
    try {
      if (viewingVideo) {
        await unitAPI.uploadRentalUnitVideo(viewingUnit.id, viewingVideo);
      } else if (removeListingVideo) {
        await unitAPI.removeRentalUnitVideo(viewingUnit.id);
      }
      await loadRentalUnits();
      showSuccess('Video updated', 'Your listing video was saved.');
      setViewingUnit(null);
    } catch (err) {
      showError('Video failed', formatRentalApiError(err, 'Could not save video'));
    } finally {
      setVideoSaving(false);
    }
  };

  const openRequestDialog = (prefill = {}) => {
    setRequestPrefill({
      propertyId: prefill.propertyId || '',
      unitId: prefill.unitId || '',
      title: prefill.title || '',
    });
    setRequestDialogOpen(true);
  };

  const handleCreateFromInternalUnit = (internalUnit) => {
    openRequestDialog({
      propertyId: internalUnit.property_id || '',
      unitId: internalUnit.id || '',
      title: `Unit ${internalUnit.unit_number || ''}`.trim(),
    });
  };

  return (
    <OwnerPage>
      <PageHeader
        title="Listings"
        action={
          <Button
            variant="contained"
            startIcon={<NotifyIcon />}
            onClick={() => openRequestDialog()}
            disabled={properties.length === 0}
            sx={ownerPrimaryButtonSx}
          >
            Request listing
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Marketplace listings are published by CarryIT admins. Use <strong>Request listing</strong> to notify
        the team when you have a unit ready for rent — {MIN_RENTAL_LISTING_IMAGES}+ photos are required before going live.
      </Alert>

      {unlistedInternalUnits.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                openRequestDialog({
                  propertyId: unlistedInternalUnits[0]?.property_id,
                  unitId: unlistedInternalUnits[0]?.id,
                  title: unlistedInternalUnits[0] ? `Unit ${unlistedInternalUnits[0].unit_number}` : '',
                })
              }
            >
              Request listing
            </Button>
          }
        >
          You have <strong>{unlistedInternalUnits.length}</strong> internal unit(s) not yet on the marketplace
          ({unlistedInternalUnits.map((u) => u.unit_number).join(', ')}).
        </Alert>
      )}

      <OwnerStatStrip
        stats={[
          { title: 'Listings', value: rentalUnits.length, icon: <ApartmentIcon /> },
          { title: 'Live on site', value: publishedListings.length, icon: <CheckCircleIcon /> },
          { title: 'Drafts', value: draftListings.length, icon: <ImageIcon /> },
          { title: 'Not listed yet', value: unlistedInternalUnits.length, icon: <HomeIcon /> },
        ]}
      />

      {unlistedInternalUnits.length > 0 && (
        <OwnerDataTable
          title="Internal units — not on marketplace yet"
          subtitle="These exist under Units; request a listing to advertise them publicly."
          columns={[
            {
              id: 'unit',
              label: 'Unit',
              render: (u) => (
                <Typography variant="body2" fontWeight={600}>
                  Unit {u.unit_number}
                </Typography>
              ),
            },
            {
              id: 'property',
              label: 'Property',
              render: (u) => u.property_name || '—',
            },
            {
              id: 'rent',
              label: 'Rent',
              render: (u) => formatMoney(u.monthly_rent || 0, u.currency || 'UGX'),
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'right',
              render: (u) => (
                <Button size="small" variant="outlined" onClick={() => handleCreateFromInternalUnit(u)}>
                  Request listing
                </Button>
              ),
            },
          ]}
          rows={unlistedInternalUnits}
          searchable={false}
          emptyTitle="All internal units are listed"
        />
      )}

      <OwnerListingRequestsPanel
        requests={listingRequests}
        requestType="rental_unit"
        loading={requestsLoading}
        onRefresh={loadListingRequests}
        showUnitColumn
      />

      <Box sx={{ mt: 3 }}>
        <OwnerDataTable
          title="Marketplace listings"
          subtitle="Published by CarryIT — view-only here. Contact support if updates are needed."
          columns={[
            {
              id: 'title',
              label: 'Title',
              render: (unit) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: `${colors.brand}14`, color: colors.brand, width: 36, height: 36 }}>
                    <ApartmentIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {unit.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isCommercialUnit(unit.unit_type)
                        ? `${unit.square_feet || '—'} sq ft`
                        : `${unit.bedrooms || '—'} bed · ${unit.bathrooms || '—'} bath`}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              id: 'location',
              label: 'Location',
              render: (unit) => unit.location || '—',
            },
            {
              id: 'rent',
              label: 'Rent',
              render: (unit) => formatMoney(unit.monthly_rent || 0, unit.currency || 'UGX'),
            },
            {
              id: 'marketplace',
              label: 'Marketplace',
              render: (unit) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-start' }}>
                  {isListingDraft(unit) ? (
                    <Chip
                      size="small"
                      color="warning"
                      label={`Draft · ${countListingImages(unit)}/${MIN_RENTAL_LISTING_IMAGES} photos`}
                    />
                  ) : (
                    <Chip size="small" color="success" variant="outlined" label="Live" />
                  )}
                  <ListingVideoBadge unit={unit} variant="outlined" />
                  <ListingInspectionBookingsBadge unit={unit} variant="outlined" />
                  <ListingAvailabilityMeta unit={unit} variant="caption" />
                </Box>
              ),
            },
            {
              id: 'status',
              label: 'Rent status',
              render: (unit) => (
                <Chip
                  size="small"
                  label={unit.status || 'available'}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'right',
              render: (unit) => (
                <TableActions
                  actions={[
                    { icon: <ViewIcon fontSize="small" />, label: 'View details', onClick: () => openViewUnit(unit) },
                  ]}
                />
              ),
            },
          ]}
          rows={rentalUnits}
          loading={loading}
          emptyTitle="No listings yet"
          emptyDescription="Request a listing and an admin will publish it on the marketplace."
          emptyIcon={ApartmentIcon}
          emptyActionLabel="Request listing"
          onEmptyAction={() => openRequestDialog()}
        />
      </Box>

      <ListingRequestDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        requestType="rental_unit"
        properties={properties}
        units={internalUnitsAll}
        defaultPropertyId={requestPrefill.propertyId}
        defaultUnitId={requestPrefill.unitId}
        defaultTitle={requestPrefill.title}
        onSubmitted={loadListingRequests}
      />

      <Dialog open={!!viewingUnit} onClose={() => setViewingUnit(null)} maxWidth="md" fullWidth>
        <DialogTitle>{viewingUnit?.title}</DialogTitle>
        <DialogContent dividers>
          {viewingUnit && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {viewingUnit.location}
                  {viewingUnit.country ? `, ${viewingUnit.country}` : ''}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                  {formatMoney(viewingUnit.monthly_rent || 0, viewingUnit.currency || 'UGX')}/mo
                </Typography>
              </Grid>
              {listingImageUrls(viewingUnit.images).length > 0 && (
                <Grid item xs={12}>
                  <ImageList cols={3} rowHeight={140} gap={8}>
                    {listingImageUrls(viewingUnit.images).map((url, index) => (
                      <ImageListItem key={index}>
                        <img src={url} alt={`Listing ${index + 1}`} loading="lazy" style={{ objectFit: 'cover' }} />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Grid>
              )}
              <Grid item xs={12}>
                <ListingVideoPlayer
                  unit={viewingUnit}
                  poster={listingImageUrls(viewingUnit.images)[0]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Unit type
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {viewingUnit.unit_type?.replace('_', ' ')}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Bedrooms
                </Typography>
                <Typography variant="body2">{viewingUnit.bedrooms ?? '—'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Bathrooms
                </Typography>
                <Typography variant="body2">{viewingUnit.bathrooms ?? '—'}</Typography>
              </Grid>
              {viewingUnit.description && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">{viewingUnit.description}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <RentalVideoField
                  existingUrl={removeListingVideo ? '' : viewingUnit.video_url}
                  selectedFile={viewingVideo}
                  onSelectFile={(file) => {
                    setViewingVideo(file);
                    setRemoveListingVideo(false);
                  }}
                  onClear={() => {
                    setViewingVideo(null);
                    setRemoveListingVideo(true);
                  }}
                  disabled={videoSaving}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {(viewingVideo || (removeListingVideo && viewingUnit?.video_url)) && (
            <Button
              variant="contained"
              onClick={() => void handleSaveListingVideo()}
              disabled={videoSaving}
              sx={ownerPrimaryButtonSx}
            >
              {videoSaving ? 'Saving…' : 'Save video'}
            </Button>
          )}
          <Button onClick={() => setViewingUnit(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </OwnerPage>
  );
};

export default UnitsForRent;
