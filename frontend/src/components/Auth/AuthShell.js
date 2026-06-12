import React from 'react';
import { Box, Typography, Avatar, Fade, useMediaQuery } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import logoImage from '../../assets/images/er13.png';
import { colors } from '../../theme/designTokens';

/**
 * Professional split-screen authentication layout.
 * Left: branded value panel. Right: form content.
 */
const AuthShell = ({
  accent = colors.brand,
  accentDark,
  eyebrow = 'CarryIT',
  panelTitle,
  panelSubtitle,
  highlights = [],
  footnote,
  formTitle,
  formSubtitle,
  badgeIcon,
  children,
  wide = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const darkAccent = accentDark || accent;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: colors.surface }}>
      {/* Brand panel */}
      {!isMobile && (
        <Box
          sx={{
            position: 'relative',
            width: '44%',
            maxWidth: 620,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 6,
            overflow: 'hidden',
            background: `linear-gradient(150deg, ${darkAccent} 0%, ${accent} 100%)`,
          }}
        >
          {/* Decorative blobs */}
          <Box
            sx={{
              position: 'absolute',
              top: -120,
              right: -120,
              width: 340,
              height: 340,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -100,
              left: -80,
              width: 260,
              height: 260,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.06)',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={logoImage} alt="CarryIT" variant="rounded" sx={{ width: 40, height: 40, borderRadius: '10px' }} />
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>
              {eyebrow}
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', mb: 2 }}>
              {panelTitle}
            </Typography>
            {panelSubtitle && (
              <Typography sx={{ fontSize: '1.05rem', opacity: 0.92, mb: 4, maxWidth: 420 }}>
                {panelSubtitle}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              {highlights.map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CheckCircle sx={{ fontSize: 22, mt: '1px', opacity: 0.95 }} />
                  <Typography sx={{ fontSize: '0.95rem', opacity: 0.95 }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography sx={{ position: 'relative', zIndex: 1, fontSize: '0.8rem', opacity: 0.7 }}>
            {footnote || `© ${new Date().getFullYear()} CarryIT. All rights reserved.`}
          </Typography>
        </Box>
      )}

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          bgcolor: colors.surfaceMuted,
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ width: '100%', maxWidth: wide ? 520 : 400 }}>
            {/* Mobile brand mark */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
                <Avatar src={logoImage} alt="CarryIT" variant="rounded" sx={{ width: 40, height: 40, borderRadius: '10px' }} />
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: colors.text }}>{eyebrow}</Typography>
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              {badgeIcon && (
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    mb: 2,
                    bgcolor: `${accent}14`,
                    color: accent,
                  }}
                >
                  {badgeIcon}
                </Avatar>
              )}
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', mb: 0.5 }}>
                {formTitle}
              </Typography>
              {formSubtitle && (
                <Typography variant="body2" sx={{ color: colors.textMuted }}>
                  {formSubtitle}
                </Typography>
              )}
            </Box>

            {children}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AuthShell;
