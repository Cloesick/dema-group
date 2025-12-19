import { NextResponse } from 'next/server';
import { setOtp } from '@/lib/otpStore';

function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 });

    const apiKey = process.env.DIALPAD_API_KEY;
    const fromNumber = process.env.DIALPAD_NUMBER;
    const apiUrl = process.env.DIALPAD_SMS_API_URL || 'https://dialpad.com/api/v2/sms';
    if (!apiKey || !fromNumber) {
      return NextResponse.json({ error: 'Dialpad not configured' }, { status: 501 });
    }

    const code = generateCode(6);
    setOtp(phone, code);

    // Attempt to send SMS via Dialpad (generic JSON API shape; adjust to your account's API spec)
    try {
      const payload = {
        to: phone,
        from: fromNumber,
        text: `Your Dema verification code: ${code}`,
      } as any;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        // Still return success to avoid leaking whether a number is valid; OTP is stored
        return NextResponse.json({ success: true, warning: 'SMS send failed', details: txt });
      }
    } catch {
      // Silent failure on SMS send; OTP is stored and can be read from logs if needed
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
