import React, { useRef } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { Videocam, Delete, Upload } from '@mui/icons-material';

const ACCEPT = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';
const MAX_MB = 100;

/**
 * Optional walkthrough video picker for rental listings (uploaded to R2 after save).
 */
export default function RentalVideoField({
  existingUrl = '',
  selectedFile = null,
  onSelectFile,
  onClear,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : existingUrl;

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please choose an MP4, MOV, or WebM video.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Video must be under ${MAX_MB} MB.`);
      return;
    }
    onSelectFile?.(file);
    e.target.value = '';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Walkthrough video (optional)
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Add a short property tour (MP4/MOV/WebM, max {MAX_MB} MB). Shown on the public listing page.
      </Alert>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {selectedFile || existingUrl ? 'Replace video' : 'Choose video'}
        </Button>
        {(selectedFile || existingUrl) && (
          <Button
            variant="text"
            color="error"
            startIcon={<Delete />}
            onClick={() => onClear?.()}
            disabled={disabled}
          >
            Remove
          </Button>
        )}
      </Box>

      {selectedFile && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB) — uploads when you save
        </Typography>
      )}

      {previewUrl && (
        <Box
          component="video"
          src={previewUrl}
          controls
          playsInline
          sx={{
            width: '100%',
            maxHeight: 320,
            borderRadius: 2,
            bgcolor: '#000',
          }}
        />
      )}

      {!previewUrl && (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            py: 4,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Videocam sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2">No video added</Typography>
        </Box>
      )}
    </Box>
  );
}
