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
 * Validates that a URL uses a safe protocol (http or https).
 * Prevents javascript: URI attacks.
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // Invalid URL, ignore
  }
  return '';
};

/**
 * Generates a SHA-256 checksum for a data string with a salt.
 * Used for integrity checking of local storage data.
 */
export const generateChecksum = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  // Salt ensures that simply knowing the hash algorithm isn't enough to forge data
  const salt = "SENTINEL_SECURE_SALT_v1";
  const dataBuffer = encoder.encode(data + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifies that the data matches the provided checksum.
 */
export const verifyChecksum = async (data: string, checksum: string): Promise<boolean> => {
  const calculated = await generateChecksum(data);
  return calculated === checksum;
};
