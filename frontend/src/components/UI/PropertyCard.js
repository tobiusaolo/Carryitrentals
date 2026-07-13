import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
  alpha,
  Stack,
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
  People,
  Nightlight,
  HomeWork,
  Videocam,
} from '@mui/icons-material';
import { isListingSaved, toggleSavedListing } from '../../utils/favorites';
import { getRentalStatusMeta } from '../../utils/rentalStatus';
import { getAirbnbPropertyTypeLabel, getListingStatusMeta } from '../../constants/airbnb';
import DisplayPrice from '../Public/DisplayPrice';
import WatermarkedImage from '../Public/WatermarkedImage';
import ListingVideoBadge from '../Public/ListingVideoBadge';
import { hasListingVideo } from '../../utils/listingVideo';
import { colors, layout, typography } from '../../theme/designTokens';

const verifiedLabel = (property) =>
  property.carryit_verified ? 'CarryIT Verified' : property.is_verified ? 'Verified' : null;

const formatUnitType = (type) => {
  if (!type) return null;
  const raw = typeof type === 'object' && type.value ? type.value : type;
  return String(raw).replace(/_/g, ' ');
};

const MetaPill = ({ icon: Icon, label }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.35,
      px: 1,
      py: 0.35,
      borderRadius: `${layout.radius.sm}px`,
      bgcolor: colors.surfaceMuted,
      border: `1px solid ${colors.border}`,
    }}
  >
    <Icon sx={{ fontSize: 14, color: colors.textMuted }} />
    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.7rem' }}>
      {label}
    </Typography>
  </Box>
);

/**
 * Public listing card — long-term rentals and short stays (Airbnb).
 * @param {'rental'|'airbnb'} variant
 */
const PropertyCard = ({ property, onClick, variant = 'rental' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isFavorite, setIsFavorite] = useState(() => isListingSaved(property.id));
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isAirbnb = variant === 'airbnb';
  const images = property.images || [];
  const statusMeta = isAirbnb
    ? getListingStatusMeta(property.is_available || property.status)
    : getRentalStatusMeta(property.status);

  const title = property.title || property.name || property.location || (isAirbnb ? 'Short stay' : 'Rental listing');
  const beds = property.bedrooms;
  const baths = property.bathrooms;
  const guests = property.max_guests;
  const unitTypeLabel = property.unit_type
    ? formatUnitType(property.unit_type)
    : property.property_type
      ? getAirbnbPropertyTypeLabel(property.property_type)
      : null;

  const priceAmount =
    property.monthly_rent ||
    property.rental_price ||
    property.price_per_night ||
    property.rent ||
    0;
  const pricePeriod = isAirbnb || property.price_per_night ? '/ night' : '/ month';
  const showVideoBadge = !isAirbnb;
  const listingHasVideo = showVideoBadge && hasListingVideo(property);

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
        borderRadius: `${layout.radius.lg + 4}px`,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: typography.fontBody,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          borderColor: alpha(colors.brand, 0.25),
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          transform: 'translateY(-3px)',
          '& .image-controls': { opacity: 1 },
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', width: '100%', pt: '68%', bgcolor: '#ececec' }}>
        <WatermarkedImage
          src={images[currentImage] || 'https://via.placeholder.com/800x544?text=No+photo'}
          alt={title}
          variant="card"
          wrapperSx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          sx={{
            filter: statusMeta.isAvailable ? 'none' : 'grayscale(40%) brightness(0.92)',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: isHovered && statusMeta.isAvailable ? 'scale(1.04)' : 'scale(1)',
          }}
        />

        {/* Bottom gradient for depth */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, ${alpha('#000', 0.35)} 0%, transparent 45%)`,
            pointerEvents: 'none',
          }}
        />

        {!statusMeta.isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: alpha('#fff', 0.12),
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Top badges */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10, flexWrap: 'wrap', maxWidth: '70%' }}
        >
          <Chip
            label={statusMeta.label}
            size="small"
            sx={{
              height: 26,
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: statusMeta.chipColor,
              bgcolor: alpha(statusMeta.chipBg || '#fff', 0.95),
              border: `1px solid ${alpha(statusMeta.chipColor, 0.2)}`,
              backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <Chip
            icon={isAirbnb ? <Nightlight sx={{ fontSize: '14px !important' }} /> : <HomeWork sx={{ fontSize: '14px !important' }} />}
            label={isAirbnb ? 'Short stay' : 'Long-term'}
            size="small"
            sx={{
              height: 26,
              fontWeight: 700,
              fontSize: '0.68rem',
              bgcolor: alpha('#fff', 0.92),
              backdropFilter: 'blur(8px)',
              '& .MuiChip-icon': { color: isAirbnb ? '#7c3aed' : colors.brand },
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {showVideoBadge && listingHasVideo && (
            <Chip
              icon={<Videocam sx={{ fontSize: '14px !important' }} />}
              label="Video"
              size="small"
              sx={{
                height: 26,
                fontWeight: 700,
                fontSize: '0.68rem',
                color: '#5b21b6',
                bgcolor: alpha('#fff', 0.92),
                backdropFilter: 'blur(8px)',
                '& .MuiChip-icon': { color: '#7c3aed' },
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Stack>

        {/* Save */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(toggleSavedListing(property.id));
          }}
          aria-label={isFavorite ? 'Remove from saved' : 'Save listing'}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            bgcolor: alpha('#fff', 0.88),
            backdropFilter: 'blur(10px)',
            color: isFavorite ? colors.brand : colors.text,
            width: 38,
            height: 38,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' },
            transition: 'transform 0.15s ease',
          }}
        >
          {isFavorite ? <Favorite sx={{ fontSize: 20 }} /> : <FavoriteBorder sx={{ fontSize: 20 }} />}
        </IconButton>

        {/* Verified — bottom left on image */}
        {(property.carryit_verified || property.is_verified) && (
          <Chip
            icon={<Verified sx={{ fontSize: '15px !important', color: `${colors.success} !important` }} />}
            label={verifiedLabel(property)}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              zIndex: 10,
              height: 28,
              fontWeight: 700,
              fontSize: '0.68rem',
              bgcolor: alpha('#fff', 0.96),
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Carousel controls */}
        {images.length > 1 && (
          <>
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
                px: 0.75,
                opacity: isMobile ? 1 : 0,
                transition: 'opacity 0.2s ease',
                zIndex: 5,
              }}
            >
              <IconButton
                size="small"
                onClick={handlePrevImage}
                sx={{
                  bgcolor: alpha('#fff', 0.95),
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNextImage}
                sx={{
                  bgcolor: alpha('#fff', 0.95),
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Box>

            {/* Dot indicators */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                zIndex: 10,
                display: 'flex',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha('#000', 0.45),
                backdropFilter: 'blur(4px)',
              }}
            >
              {images.slice(0, 5).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: currentImage === i ? 8 : 6,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: currentImage === i ? '#fff' : alpha('#fff', 0.45),
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
              {images.length > 5 && (
                <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.6rem', ml: 0.25 }}>
                  +{images.length - 5}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Body */}
      <CardContent
        sx={{
          px: 2,
          py: 1.75,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: typography.fontDisplay,
              fontWeight: 700,
              fontSize: '1rem',
              color: colors.text,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7em',
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 0.75, minWidth: 0 }}>
            <Place sx={{ fontSize: 15, color: colors.textMuted, flexShrink: 0, mt: 0.15 }} />
            <Typography
              variant="body2"
              sx={{
                color: colors.textMuted,
                fontSize: '0.8125rem',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {property.location || property.country || 'Location not set'}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {beds != null && <MetaPill icon={Bed} label={`${beds} bed${beds !== 1 ? 's' : ''}`} />}
          {baths != null && <MetaPill icon={Bathtub} label={`${baths} bath${baths !== 1 ? 's' : ''}`} />}
          {isAirbnb && guests != null && (
            <MetaPill icon={People} label={`${guests} guest${guests !== 1 ? 's' : ''}`} />
          )}
          {unitTypeLabel && (
            <MetaPill
              icon={isAirbnb ? Nightlight : HomeWork}
              label={unitTypeLabel.length > 14 ? `${unitTypeLabel.slice(0, 12)}…` : unitTypeLabel}
            />
          )}
        </Stack>

        {property.listing_code && (
          <Typography
            variant="caption"
            sx={{
              color: colors.textMuted,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          >
            Ref {property.listing_code}
          </Typography>
        )}

        {showVideoBadge && (
          <ListingVideoBadge unit={property} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
        )}

        <Box
          sx={{
            mt: 'auto',
            pt: 1.25,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box>
            <DisplayPrice
              amount={priceAmount}
              listingCurrency={property.currency}
              period={pricePeriod}
              variant="h6"
              fontWeight={800}
              showSecondary
            />
            {!statusMeta.isAvailable && (
              <Typography variant="caption" sx={{ display: 'block', color: colors.textMuted, mt: 0.5 }}>
                {isAirbnb ? 'Not bookable right now' : 'Currently rented — details only'}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
