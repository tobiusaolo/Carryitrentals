import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, alpha, CircularProgress } from '@mui/material';
import { PlayCircleOutline, VideocamOff } from '@mui/icons-material';
import { hasListingVideo, resolveListingVideoUrl } from '../../utils/listingVideo';
import { colors } from '../../theme/designTokens';

/**
 * Inline walkthrough video for rental listing detail pages.
 */
export default function ListingVideoPlayer({
  unit,
  poster,
  title = 'Property walkthrough',
  subtitle = 'Short video tour of this home',
  sx = {},
}) {
  const videoSrc = useMemo(
    () => resolveListingVideoUrl(unit?.video_url),
    [unit?.video_url]
  );
  const [loading, setLoading] = useState(Boolean(videoSrc));
  const [error, setError] = useState(false);

  if (!hasListingVideo(unit)) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          border: `1px dashed ${colors.border}`,
          bgcolor: alpha(colors.textMuted, 0.04),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          ...sx,
        }}
      >
        <VideocamOff sx={{ color: colors.textMuted, fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text }}>
            No walkthrough video
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Photos only — ask the agent about a video tour at your viewing.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <PlayCircleOutline sx={{ color: '#7c3aed' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          bgcolor: '#000',
          border: `1px solid ${alpha('#7c3aed', 0.2)}`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        }}
      >
        {loading && !error && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha('#000', 0.35),
              zIndex: 1,
            }}
          >
            <CircularProgress size={36} sx={{ color: '#fff' }} />
          </Box>
        )}

        {error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
              Could not load video in browser.
            </Typography>
            <Typography
              component="a"
              href={videoSrc}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{ color: '#c4b5fd', fontWeight: 700 }}
            >
              Open video in new tab
            </Typography>
          </Box>
        ) : (
          <Box
            component="video"
            src={videoSrc}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            onLoadedData={() => setLoading(false)}
            onCanPlay={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            sx={{
              width: '100%',
              maxHeight: 480,
              display: 'block',
              bgcolor: '#000',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
