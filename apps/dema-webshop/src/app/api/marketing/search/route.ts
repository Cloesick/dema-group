import { NextResponse } from 'next/server';
import { recordSearch, setProfile, getClient } from '@/lib/marketingStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientId = String(body.clientId || '').trim();
    const query = String(body.query || '').trim();
    const profileMarketing = Boolean(body.profileMarketing);
    const email: string | undefined = body.email ? String(body.email).trim() : undefined;

    if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    if (!query) return NextResponse.json({ ok: true }); // ignore empty

    // Only track if the user consented in their profile preferences
    if (!profileMarketing) return NextResponse.json({ ok: true, skipped: true });

    if (email || profileMarketing) setProfile(clientId, { email, consent: profileMarketing });
    recordSearch(clientId, query);

    const c = getClient(clientId);
    return NextResponse.json({ ok: true, searches: c?.searches?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
