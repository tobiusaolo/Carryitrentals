import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Alert,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteImageIcon } from '@mui/icons-material';
import { resolveMediaUrl } from '../../config/api';

export function previewImageSrc(image) {
  if (!image) return '';
  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }
    return resolveMediaUrl(trimmed);
  }
  if (image instanceof File || image instanceof Blob) {
    return URL.createObjectURL(image);
  }
  return '';
}

/**
 * Image picker with live thumbnail previews while building a selection.
 */
export default function ImagePickerField({
  selectedImages = [],
  onSelect,
  onRemove,
  minImages = 0,
  maxImages = 10,
  inputId = 'image-picker-upload',
  label = 'Upload photos',
  helperText = 'JPEG, PNG, or GIF — max 10 MB each',
  disabled = false,
}) {
  const count = selectedImages.length;
  const atMax = count >= maxImages;

  const previews = useMemo(
    () =>
      selectedImages.map((image, index) => ({
        key: `${index}-${typeof image === 'string' ? image.slice(0, 32) : image?.name || 'file'}`,
        src: previewImageSrc(image),
        index,
      })),
    [selectedImages]
  );

  const handleChange = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    onSelect?.(files);
  };

  const statusSeverity =
    minImages > 0 && count < minImages ? 'warning' : count > 0 ? 'success' : 'info';

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={inputId}
        multiple
        type="file"
        onChange={handleChange}
        disabled={disabled || atMax}
      />
      <label htmlFor={inputId}>
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadIcon />}
          fullWidth
          sx={{ mb: 2 }}
          disabled={disabled || atMax}
        >
          {count > 0 ? 'Add more photos' : label}
        </Button>
      </label>

      {helperText ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {helperText}
        </Typography>
      ) : null}

      <Alert severity={statusSeverity} sx={{ mb: 2 }}>
        {count} / {maxImages} photos
        {minImages > 0
          ? count >= minImages
            ? ' — ready to save'
            : ` — need at least ${minImages}`
          : ''}
      </Alert>

      {previews.length > 0 && (
        <ImageList cols={3} gap={8} sx={{ mb: 1 }}>
          {previews.map(({ key, src, index }) => (
            <ImageListItem key={key} sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <img
                src={src}
                alt={`Selected ${index + 1}`}
                loading="lazy"
                style={{ height: 120, width: '100%', objectFit: 'cover', display: 'block' }}
              />
              {onRemove && (
                <ImageListItemBar
                  actionIcon={
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => onRemove(index)}
                      disabled={disabled}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <DeleteImageIcon />
                    </IconButton>
                  }
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
}
