import { describe, it, expect } from 'vitest';
import { signSessionToken, parseSessionToken } from '../src/services/session';
import { computeSig, safeEqual, generateOtpCode, generateReference } from '../src/services/crypto';

const SECRET = 'test-signing-secret';

describe('session cookie signing', () => {
  it('round-trips a session id', async () => {
    const token = await signSessionToken('S-abc123', SECRET);
    expect(await parseSessionToken(token, SECRET)).toBe('S-abc123');
  });
  it('rejects a tampered token', async () => {
    const token = await signSessionToken('S-abc123', SECRET);
    const tampered = token.slice(0, -1) + (token.slice(-1) === 'A' ? 'B' : 'A');
    expect(await parseSessionToken(tampered, SECRET)).toBeNull();
  });
  it('rejects a token signed with a different secret', async () => {
    const token = await signSessionToken('S-abc123', SECRET);
    expect(await parseSessionToken(token, 'other-secret')).toBeNull();
  });
  it('rejects a malformed token', async () => {
    expect(await parseSessionToken('no-dot-here', SECRET)).toBeNull();
    expect(await parseSessionToken('', SECRET)).toBeNull();
  });
});

describe('OTP hashing', () => {
  it('generates a 6-digit code', () => {
    for (let i = 0; i < 50; i++) expect(generateOtpCode()).toMatch(/^\d{6}$/);
  });
  it('verifies a code by HMAC hash and rejects a wrong one', async () => {
    const code = '123456';
    const hash = await computeSig(code, SECRET);
    expect(safeEqual(await computeSig('123456', SECRET), hash)).toBe(true);
    expect(safeEqual(await computeSig('654321', SECRET), hash)).toBe(false);
  });
});

describe('collection reference', () => {
  it('looks like PC-XXXX with safe characters', () => {
    const ref = generateReference();
    expect(ref).toMatch(/^PC-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
  });
});
