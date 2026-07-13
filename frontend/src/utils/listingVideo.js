import { resolveMediaUrl } from '../config/api';

/** Whether a rental listing has a walkthrough video attached. */
export function hasListingVideo(unit) {
  const url = unit?.video_url;
  return Boolean(url && String(url).trim());
}

/** Normalize video URL for browser playback (R2, absolute, or relative paths). */
export function resolveListingVideoUrl(videoUrl) {
  if (!videoUrl) return '';
  const trimmed = String(videoUrl).trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  return resolveMediaUrl(trimmed);
}
