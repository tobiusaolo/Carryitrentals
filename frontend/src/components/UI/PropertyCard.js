import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  ChevronLeft,
  ChevronRight,
  Verified,
  Bed,
  Bathtub,
  Place,
} from '@mui/icons-material';
import { isListingSaved, toggleSavedListing } from '../../utils/favorites';
import { getRentalStatusMeta } from '../../utils/rentalStatus';
import { getAirbnbPropertyTypeLabel } from '../../constants/airbnb';
import DisplayPrice from '../Public/DisplayPrice';
import { colors } from '../../theme/designTokens';

const formatUnitType = (type) => {
  if (!type) return null;
  const raw = typeof type === 'object' && type.value ? type.value : type;
  return String(raw).replace(/_/g, ' ');
};

const PropertyCard = ({ property, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isFavorite, setIsFavorite] = useState(() => isListingSaved(property.id));
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = property.images || [];
  const statusMeta = getRentalStatusMeta(property.status);
  const title = property.title || property.name || property.location || 'Rental listing';
  const beds = property.bedrooms;
  const baths = property.bathrooms;
  const unitTypeLabel = property.unit_type
    ? formatUnitType(property.unit_type)
    : property.property_type
      ? getAirbnbPropertyTypeLabel(property.property_type)
      : null;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: alpha(colors.brand, 0.35),
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          '& .image-controls': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', pt: '66.67%', bgcolor: '#f4f4f4' }}>
        <CardMedia
          component="img"
          image={images[currentImage] || 'https://via.placeholder.com/800x533?text=No+photo'}
          alt={title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: statusMeta.isAvailable ? 'none' : 'grayscale(35%)',
            transition: 'transform 0.45s ease',
            transform: isHovered && statusMeta.isAvailable ? 'scale(1.03)' : 'scale(1)',
          }}
        />

        {!statusMeta.isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: alpha('#000', 0.18),
              pointerEvents: 'none',
            }}
          />
        )}

        <Chip
          label={statusMeta.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 10,
            height: 26,
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.02em',
            color: statusMeta.chipColor,
            bgcolor: statusMeta.chipBg,
            border: `1px solid ${alpha(statusMeta.chipColor, 0.2)}`,
          }}
          onClick={(e) => e.stopPropagation()}
        />

        {property.is_verified && (
          <Chip
            icon={<Verified sx={{ fontSize: '14px !important', color: '#1a73e8 !important' }} />}
            label="Verified"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              zIndex: 10,
              height: 24,
              bgcolor: alpha('#FFF', 0.96),
              fontWeight: 600,
              fontSize: '0.65rem',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(toggleSavedListing(property.id));
          }}
          aria-label={isFavorite ? 'Remove from saved' : 'Save listing'}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: alpha('#FFF', 0.92),
            color: isFavorite ? colors.brand : colors.textMuted,
            width: 36,
            height: 36,
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          {isFavorite ? <Favorite sx={{ fontSize: 20 }} /> : <FavoriteBorder sx={{ fontSize: 20 }} />}
        </IconButton>

        {images.length > 1 && (
          <Box
            className="image-controls"
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              justifyContent: 'space-between',
              px: 0.5,
              opacity: isMobile ? 1 : 0,
              transition: 'opacity 0.2s ease',
              zIndex: 5,
            }}
          >
            <IconButton
              size="small"
              onClick={handlePrevImage}
              sx={{
                bgcolor: alpha('#FFF', 0.95),
                color: colors.text,
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNextImage}
              sx={{
                bgcolor: alpha('#FFF', 0.95),
                color: colors.text,
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>
        )}

        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: alpha('#000', 0.55),
            }}
          >
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.65rem' }}>
              {currentImage + 1}/{images.length}
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ px: 1.75, py: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, minWidth: 0 }}>
          <Place sx={{ fontSize: 16, color: colors.textMuted, flexShrink: 0 }} />
          <Typography
            variant="body2"
            sx={{
              color: colors.textMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {property.location || 'Location not set'}
            {property.listing_code ? ` · ${property.listing_code}` : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {beds != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Bed sx={{ fontSize: 17, color: colors.textMuted }} />
              <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 500 }}>
                {beds} bed{beds !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          {baths != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Bathtub sx={{ fontSize: 17, color: colors.textMuted }} />
              <Typography variant="body2" sx={{ color: colors.textMuted, fontWeight: 500 }}>
                {baths} bath{baths !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          {unitTypeLabel && (
            <Typography
              variant="body2"
              sx={{
                color: colors.textMuted,
                textTransform: 'capitalize',
                ml: 'auto',
                fontWeight: 500,
              }}
            >
              {unitTypeLabel}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          <DisplayPrice
            amount={property.monthly_rent || property.rental_price || property.price_per_night || 0}
            listingCurrency={property.currency}
            period={property.price_per_night || property.rental_price ? '/ night' : '/ month'}
            showSecondary
          />
          {!statusMeta.isAvailable && (
            <Typography variant="caption" sx={{ display: 'block', color: colors.textMuted, mt: 0.5 }}>
              This home is currently rented — view details only
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
