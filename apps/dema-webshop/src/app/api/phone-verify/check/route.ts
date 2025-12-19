import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    if (!phone || !code) return NextResponse.json({ error: 'Missing phone or code' }, { status: 400 });

    const ok = verifyOtp(phone, code);
    if (!ok) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
