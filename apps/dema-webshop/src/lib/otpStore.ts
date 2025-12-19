type Entry = { code: string; expiresAt: number; verified: boolean };

const store: Map<string, Entry> = new Map();
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function setOtp(phone: string, code: string, ttlMs: number = DEFAULT_TTL_MS) {
  const expiresAt = Date.now() + ttlMs;
  store.set(normalize(phone), { code, expiresAt, verified: false });
}

export function verifyOtp(phone: string, code: string): boolean {
  const key = normalize(phone);
  const e = store.get(key);
  if (!e) return false;
  if (Date.now() > e.expiresAt) { store.delete(key); return false; }
  if (e.code !== code) return false;
  e.verified = true;
  // Optionally clear code but keep verified state until expiry
  store.set(key, e);
  return true;
}

export function isVerified(phone: string): boolean {
  const e = store.get(normalize(phone));
  if (!e) return false;
  if (Date.now() > e.expiresAt) { store.delete(normalize(phone)); return false; }
  return e.verified === true;
}

export function clearOtp(phone: string) {
  store.delete(normalize(phone));
}

function normalize(p: string) {
  return String(p || '').replace(/\s+/g, '');
}
