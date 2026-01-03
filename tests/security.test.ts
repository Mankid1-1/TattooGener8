import { describe, it, expect } from 'vitest';
import { generateChecksum, verifyChecksum } from '../utils/security';

describe('Security Utils', () => {
  it('should generate a consistent checksum', () => {
    const data = "test-data";
    const checksum1 = generateChecksum(data);
    const checksum2 = generateChecksum(data);
    expect(checksum1).toBe(checksum2);
    expect(checksum1).not.toBe("");
  });

  it('should verify a valid checksum', () => {
    const data = "valid-data";
    const checksum = generateChecksum(data);
    expect(verifyChecksum(data, checksum)).toBe(true);
  });

  it('should reject an invalid checksum', () => {
    const data = "valid-data";
    const checksum = generateChecksum(data);
    expect(verifyChecksum("tampered-data", checksum)).toBe(false);
  });
});
