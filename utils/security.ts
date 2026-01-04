/**
 * Security utilities for TattooCrate
 */

/**
 * Escapes special characters in a string for use in HTML to prevent XSS.
 * This should be used whenever user-controlled input is inserted into the DOM
 * or document.write() calls.
 *
 * @param str The unsafe string to escape
 * @returns The escaped safe string
 */
export const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Sanitizes a URL to ensure it uses a safe protocol (http, https, or data).
 * Prevents javascript: URI attacks.
 *
 * @param url The URL to sanitize
 * @returns The original URL if safe, or 'about:blank' if unsafe
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // If URL parsing fails, it might be a relative URL (which is fine if not starting with javascript:)
    // But for this app, we expect absolute URLs or data URIs for images.
    // Let's do a basic check for javascript: at the start
    if (!url.trim().toLowerCase().startsWith('javascript:')) {
         return url;
    }
  }
  return 'about:blank';
};
