type ClientData = {
  searches: string[];
  lastSent: number;
  email?: string;
  consent?: boolean;
};

// Simple in-memory store (per server process). Replace with DB in production.
const store = new Map<string, ClientData>();

function now() {
  return Date.now();
}

export function getOrCreateClient(id: string): ClientData {
  if (!store.has(id)) {
    store.set(id, { searches: [], lastSent: 0 });
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return store.get(id)!;
}

export function recordSearch(id: string, query: string) {
  const cd = getOrCreateClient(id);
  const q = String(query || '').trim().toLowerCase();
  if (!q) return cd;
  // keep last 25
  cd.searches.push(q);
  if (cd.searches.length > 25) cd.searches.splice(0, cd.searches.length - 25);
  return cd;
}

export function setProfile(id: string, { email, consent }: { email?: string; consent?: boolean }) {
  const cd = getOrCreateClient(id);
  if (typeof email === 'string' && email.trim()) cd.email = email.trim();
  if (typeof consent === 'boolean') cd.consent = consent;
  return cd;
}

export function getClient(id: string) {
  return store.get(id);
}

export function setLastSent(id: string) {
  const cd = getOrCreateClient(id);
  cd.lastSent = now();
}
