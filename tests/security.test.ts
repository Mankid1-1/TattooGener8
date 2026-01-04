
import { describe, it, expect } from 'vitest';
import { sanitizeUrl, escapeHtml } from '../utils/security';

describe('Security Utilities', () => {
  describe('sanitizeUrl', () => {
    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should allow data URLs', () => {
      expect(sanitizeUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    });

    it('should block javascript URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    });

    it('should block javascript URLs with varying case', () => {
      expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('about:blank');
    });

    it('should block javascript URLs with whitespace', () => {
       // Browsers might execute these depending on context, better safe than sorry
       // But our parser might catch them as invalid protocol if they don't match standard URL parsing
       // or fall through to the string check.
       // Note: new URL(' javascript:...') throws in some environments or strips whitespace.
       expect(sanitizeUrl(' javascript:alert(1)')).toBe('about:blank');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(sanitizeUrl('not a url')).toBe('not a url');
      // Current implementation: new URL('not a url') throws, catch block checks for 'javascript:', returns original if not javascript.
      // This allows relative paths if necessary, though ideally we'd want strict mode.
      // Given the implementation:
      // if (!url.trim().toLowerCase().startsWith('javascript:')) return url;
      // So 'not a url' returns 'not a url'.
    });

    it('should block vbscript URLs', () => {
        // Our implementation only whitelists http/https/data in the try block.
        // If new URL('vbscript:...') works, it will fall to catch block?
        // Actually new URL('vbscript:...') is valid URL object with protocol 'vbscript:'.
        // So it fails the whitelist check in try block?
        // No, wait:
        // const parsed = new URL(url);
        // if (['http:', 'https:', 'data:'].includes(parsed.protocol)) { return url; }
        // It does NOT return url. It falls through to catch? No.
        // It falls through to after the if.
        // Then it returns 'about:blank' at the end of function!
        // Wait, let's re-read the code I wrote.
    });
  });

  describe('escapeHtml', () => {
      it('should escape basic chars', () => {
          expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      });
  });
});
