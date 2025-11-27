import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Facebook,
  Instagram,
  WhatsApp,
} from '@mui/icons-material';
import logoImage from '../assets/images/er13.png';

// Custom SVG icons for TikTok
const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentYear = new Date().getFullYear();

  const socialLinks = {
    whatsapp: 'https://wa.me/256754577922',
    email: 'mailto:stuartkevinz852@gmail.com?subject=Inquiry from Easy Rentals Website',
    facebook: 'https://www.facebook.com/easyrentals',
    instagram: 'https://www.instagram.com/easyrentals',
    tiktok: 'https://www.tiktok.com/@easyrentals',
  };

  const handleSocialClick = (url, isEmail = false) => {
    if (isEmail) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        color: 'rgba(255, 255, 255, 0.9)',
        mt: 'auto',
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box
                component="img"
                src={logoImage}
                alt="Easy Rentals Logo"
                sx={{
                  height: { xs: 50, md: 60 },
                  width: 'auto',
                  mb: 2,
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: 'white',
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Easy Rentals
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                Your trusted partner for rental homes and Airbnb properties in Uganda. 
                Find your perfect home or list your property with us.
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'white',
                fontSize: '1rem',
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/public/rentals')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  textAlign: 'left',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                  cursor: 'pointer',
                }}
              >
                Browse Rentals
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/public/airbnb')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  textAlign: 'left',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                  cursor: 'pointer',
                }}
              >
                Browse Airbnb
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/public/guidelines')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  textAlign: 'left',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                  cursor: 'pointer',
                }}
              >
                Guidelines
              </Link>
              <Link
                href="mailto:stuartkevinz852@gmail.com"
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  textAlign: 'left',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                }}
              >
                List Your Property
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'white',
                fontSize: '1rem',
              }}
            >
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Link
                  href="mailto:stuartkevinz852@gmail.com"
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  stuartkevinz852@gmail.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Link
                  href="mailto:info@easyrentals.com"
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  info@easyrentals.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Link
                  href="tel:+256754577922"
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  +256 754 577 922
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Uganda
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'white',
                fontSize: '1rem',
              }}
            >
              Follow Us
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 2,
              }}
            >
              Stay connected with us on social media
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <IconButton
                onClick={() => handleSocialClick(socialLinks.whatsapp)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#25D366',
                  '&:hover': {
                    bgcolor: '#25D366',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="WhatsApp"
              >
                <WhatsApp />
              </IconButton>
              <IconButton
                onClick={() => handleSocialClick(socialLinks.facebook)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#1877F2',
                  '&:hover': {
                    bgcolor: '#1877F2',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="Facebook"
              >
                <Facebook />
              </IconButton>
              <IconButton
                onClick={() => handleSocialClick(socialLinks.instagram)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E4405F',
                  '&:hover': {
                    bgcolor: '#E4405F',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="Instagram"
              >
                <Instagram />
              </IconButton>
              <IconButton
                onClick={() => handleSocialClick(socialLinks.tiktok)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#000000',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="TikTok"
              >
                <TikTokIcon />
              </IconButton>
              <IconButton
                onClick={() => handleSocialClick(socialLinks.email, true)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#EA4335',
                  '&:hover': {
                    bgcolor: '#EA4335',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label="Email"
              >
                <Email />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            © {currentYear} Easy Rentals. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/public/guidelines')}
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline',
                },
                cursor: 'pointer',
              }}
            >
              Terms & Conditions
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/public/guidelines')}
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline',
                },
                cursor: 'pointer',
              }}
            >
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

