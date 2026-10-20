import { describe, expect, it } from 'vitest';
import { adminOrigin, allowedUser, digest, pageNumber, statusChange, token } from './policy';
describe('private admin policy', () => {
  it('requires exact server allowlist IDs, never partial or empty matches', () => {
    expect(allowedUser('123', ' 123,456 ')).toBe(true);
    for (const value of ['', '12', '1234', 'email@example.com']) expect(allowedUser(value, '123,456')).toBe(false);
    expect(allowedUser('123', '')).toBe(false);
  });
  it('uses opaque random tokens and non-reversible lookup hashes', () => { const a = token(); expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/); expect(a).not.toBe(token()); expect(digest(a)).toHaveLength(64); });
  it('pins a safe origin without arbitrary redirect paths', () => {
    expect(adminOrigin('https://example.com')).toBe('https://example.com');
    expect(adminOrigin('http://127.0.0.1:4173')).toBe('http://127.0.0.1:4173');
    for (const value of ['http://example.com', 'https://example.com/evil', 'https://u:p@example.com', 'https://example.com?next=evil']) expect(() => adminOrigin(value)).toThrow();
  });
  it('bounds pagination and rejects injected status updates', () => {
    expect(pageNumber('2')).toBe(2); for (const value of ['-1', '1e8', '100000', '0', 'foo']) expect(pageNumber(value)).toBe(1);
    expect(statusChange({ status: 'CLOSED', version: 2 })).toEqual({ status: 'CLOSED', version: 2 });
    for (const value of [{ status: 'ADMIN', version: 0 }, { status: 'CLOSED', version: -1 }, { status: 'NEW', version: 0, userId: 'attacker' }, []]) expect(() => statusChange(value)).toThrow();
  });
});
