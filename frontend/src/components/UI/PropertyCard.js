import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Rating,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  ChevronLeft,
  ChevronRight,
  Star
} from '@mui/icons-material';

const PropertyCard = ({ property, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = property.images || [];
  
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
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '0', // Airbnb cards usually have rounded images but transparent card containers
        bgcolor: 'transparent',
        boxShadow: 'none',
        cursor: 'pointer',
        '&:hover': {
          '& .image-controls': { opacity: 1 },
        },
      }}
    >
      {/* Favorite Button */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          color: isFavorite ? '#ff385c' : 'rgba(255,255,255,0.9)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: isFavorite ? '#ff385c' : '#FFF' },
          transition: 'transform 0.2s ease',
          '&:active': { transform: 'scale(0.8)' }
        }}
      >
        {isFavorite ? <Favorite sx={{ fontSize: 28 }} /> : <FavoriteBorder sx={{ fontSize: 28 }} />}
      </IconButton>

      {/* Image Container - Fixed Aspect Ratio (1:1) */}
      <Box sx={{ position: 'relative', width: '100%', pt: '100%', borderRadius: '12px', overflow: 'hidden', bgcolor: '#F0F0F0' }}>
        <CardMedia
          component="img"
          image={images[currentImage] || 'https://via.placeholder.com/600x600?text=Listing+Image'}
          alt={property.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Carousel Controls */}
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
              px: 1,
              opacity: isMobile ? 1 : 0,
              transition: 'opacity 0.2s ease',
              zIndex: 5
            }}
          >
            <IconButton
              size="small"
              onClick={handlePrevImage}
              sx={{ 
                bgcolor: alpha('#FFF', 0.9), 
                color: '#222',
                '&:hover': { bgcolor: '#FFF' },
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNextImage}
              sx={{ 
                bgcolor: alpha('#FFF', 0.9), 
                color: '#222',
                '&:hover': { bgcolor: '#FFF' },
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Carousel Indicators */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 0.8,
              zIndex: 5
            }}
          >
            {images.slice(0, 5).map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: idx === currentImage ? '#FFF' : alpha('#FFF', 0.6),
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ px: 0, py: 1.5, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 800, color: '#222', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
            {property.location || 'Kampala, Uganda'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ fontSize: 14, color: '#222' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#222' }}>
              {(4.5 + Math.random() * 0.5).toFixed(2)}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ color: '#717171', mb: 0.2 }}>
          {property.distance || 'Available for viewing'}
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#717171', mb: 1 }}>
          {property.unit_type?.replace('_', ' ') || 'Premier Stay'}
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 800, color: '#222', mt: 'auto' }}>
          {property.currency || '$'}{(property.monthly_rent || property.rental_price || property.price_per_night || 0).toLocaleString()}
          <Typography component="span" variant="body1" sx={{ fontWeight: 400, ml: 0.5 }}>
            {property.price_per_night || property.rental_price ? '/ night' : '/ month'}
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
