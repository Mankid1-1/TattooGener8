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
