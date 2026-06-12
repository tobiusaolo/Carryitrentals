import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Typography,
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteImageIcon } from '@mui/icons-material';
import FormSection from './FormSection';
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  AIRBNB_LISTING_STATUS_OPTIONS,
  AIRBNB_PROPERTY_TYPE_OPTIONS,
  MIN_AIRBNB_IMAGES,
  MAX_AIRBNB_IMAGES,
} from '../../constants/airbnb';

const AirbnbListingFormFields = ({
  formData,
  setFormData,
  properties = [],
  requireProperty = true,
  onPropertyChange,
  selectedImages = [],
  onImageSelect,
  onRemoveImage,
  showOwnerNote = false,
}) => (
  <Grid container spacing={2}>
    {showOwnerNote && (
      <Grid item xs={12}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Short stays appear on the public <strong>Short stays</strong> page. Use clear photos and accurate
          house rules — guests book by check-in / check-out dates.
        </Alert>
      </Grid>
    )}

    <Grid item xs={12}>
      <FormSection
        title="What are you listing?"
        subtitle={requireProperty ? 'Pick your property, then describe the short stay' : 'Title, property type, and visibility'}
        first
      >
        <Grid container spacing={2}>
          {(requireProperty || properties.length > 0) && (
            <Grid item xs={12}>
              <FormControl fullWidth required={requireProperty}>
                <InputLabel>Your property</InputLabel>
                <Select
                  value={formData.property_id || ''}
                  label="Your property"
                  onChange={(e) => {
                    const propertyId = e.target.value;
                    if (onPropertyChange) {
                      onPropertyChange(propertyId);
                    } else {
                      setFormData({ ...formData, property_id: propertyId });
                    }
                  }}
                >
                  {!requireProperty && <MenuItem value="">None</MenuItem>}
                  {properties.length === 0 ? (
                    <MenuItem disabled value="">
                      No properties — add one under Properties first
                    </MenuItem>
                  ) : (
                    properties.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>
                  {properties.length === 0
                    ? 'Create a property first, then link this short-stay listing to it.'
                    : 'Same as Units for rent — guests see the listing; it stays tied to your portfolio.'}
                </FormHelperText>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Listing title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 2BR apartment in Kololo with parking"
              helperText="Short, specific title guests will see in search"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Property type</InputLabel>
              <Select
                value={formData.property_type}
                label="Property type"
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              >
                {AIRBNB_PROPERTY_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {AIRBNB_PROPERTY_TYPE_OPTIONS.find((o) => o.value === formData.property_type)?.hint}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Listing status</InputLabel>
              <Select
                value={formData.is_available}
                label="Listing status"
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value })}
              >
                {AIRBNB_LISTING_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {AIRBNB_LISTING_STATUS_OPTIONS.find((o) => o.value === formData.is_available)?.hint}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </FormSection>
    </Grid>

    <Grid item xs={12}>
      <FormSection title="Location" subtitle="Where guests will stay">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Area / address"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Kololo, Kampala — near Acacia Mall"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </FormSection>
    </Grid>

    <Grid item xs={12}>
      <FormSection title="Space & pricing" subtitle="Capacity and nightly rate">
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Bedrooms"
              inputProps={{ min: 0 }}
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Bathrooms"
              inputProps={{ min: 1 }}
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Max guests"
              inputProps={{ min: 1 }}
              value={formData.max_guests}
              onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Price / night"
              inputProps={{ min: 1 }}
              value={formData.price_per_night}
              onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                label="Currency"
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Shown to guests in this currency</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </FormSection>
    </Grid>

    <Grid item xs={12}>
      <FormSection title="Details for guests">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What makes this stay special? Neighborhood, parking, check-in…"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="WiFi, parking, kitchen, pool, AC, washer…"
              helperText="Comma-separated — shown on the listing page"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="House rules"
              value={formData.house_rules}
              onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
              placeholder="No smoking · Quiet after 10pm · Check-in from 2pm"
            />
          </Grid>
        </Grid>
      </FormSection>
    </Grid>

    {onImageSelect && (
      <Grid item xs={12}>
        <FormSection title="Photos" subtitle={`${MIN_AIRBNB_IMAGES}–${MAX_AIRBNB_IMAGES} images required`}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="airbnb-listing-image-upload"
            multiple
            type="file"
            onChange={onImageSelect}
          />
          <label htmlFor="airbnb-listing-image-upload">
            <Button variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth sx={{ mb: 2 }}>
              {selectedImages.length > 0 ? 'Add more photos' : 'Upload photos'}
            </Button>
          </label>
          <Alert severity={selectedImages.length >= MIN_AIRBNB_IMAGES ? 'success' : 'warning'} sx={{ mb: 2 }}>
            {selectedImages.length} / {MAX_AIRBNB_IMAGES} photos
            {selectedImages.length >= MIN_AIRBNB_IMAGES ? ' — ready to save' : ` — need at least ${MIN_AIRBNB_IMAGES}`}
          </Alert>
          {selectedImages.length > 0 && (
            <ImageList cols={3} gap={8}>
              {selectedImages.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Listing ${index + 1}`}
                    style={{ height: 120, objectFit: 'cover' }}
                  />
                  {onRemoveImage && (
                    <ImageListItemBar
                      actionIcon={
                        <IconButton sx={{ color: 'white' }} onClick={() => onRemoveImage(index)}>
                          <DeleteImageIcon />
                        </IconButton>
                      }
                    />
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </FormSection>
      </Grid>
    )}
  </Grid>
);

export default AirbnbListingFormFields;
