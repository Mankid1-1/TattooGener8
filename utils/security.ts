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
 * A simple client-side checksum generator to prevent casual tampering of local storage data.
 * NOTE: This is NOT a cryptographic signature and does not protect against determined attackers
 * who have access to the source code. It is a defense-in-depth measure for client-side state.
 */
const SALT = "tc-secure-salt-v1-keep-integrity";

export const generateChecksum = (data: string): string => {
  let hash = 0;
  const str = data + SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

export const verifyChecksum = (data: string, checksum: string): boolean => {
  return generateChecksum(data) === checksum;
};
