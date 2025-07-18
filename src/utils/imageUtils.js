// src/utils/imageUtils.js
// Utility functions for handling images with cache-busting

/**
 * Adds a cache-busting parameter to image URLs
 * @param {string} imagePath - The image path (e.g., '/images/hero.jpg')
 * @param {string} version - Optional version string (defaults to timestamp)
 * @returns {string} - Image path with cache-busting parameter
 */
export function getImageWithCacheBust(imagePath, version = null) {
  const timestamp = version || Date.now();
  const separator = imagePath.includes('?') ? '&' : '?';
  return `${imagePath}${separator}v=${timestamp}`;
}

/**
 * Gets an image path with a specific version for cache-busting
 * Use this when you update an image and want to force a refresh
 * @param {string} imagePath - The image path
 * @param {string} version - Version string (e.g., 'v2', '2024-01-15')
 * @returns {string} - Image path with version parameter
 */
export function getImageWithVersion(imagePath, version) {
  const separator = imagePath.includes('?') ? '&' : '?';
  return `${imagePath}${separator}v=${version}`;
}

/**
 * Gets the current timestamp as a version string
 * @returns {string} - Current timestamp
 */
export function getCurrentTimestamp() {
  return Date.now().toString();
}

/**
 * Gets today's date as a version string (YYYY-MM-DD format)
 * @returns {string} - Today's date
 */
export function getTodayVersion() {
  return new Date().toISOString().split('T')[0];
} 