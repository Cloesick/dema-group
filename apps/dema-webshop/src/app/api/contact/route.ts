import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import dns from 'dns/promises';
import { getAdminAuth, getAdminFirestore, COLLECTIONS, ContactDocument } from '@/lib/firebaseAdmin';

// Make this route dynamic (not statically generated at build time)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Initialize Resend at runtime (not during build)
  const resend = new Resend(process.env.RESEND_API_KEY || '');
  
  try {
    const formData = await request.json();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA (required)
    try {
      const recaptchaToken = formData.recaptchaToken as string | undefined;
      const secret = process.env.RECAPTCHA_SECRET_KEY;
      if (!secret) {
        return NextResponse.json({ error: 'reCAPTCHA not configured' }, { status: 501 });
      }
      if (!recaptchaToken) {
        return NextResponse.json({ error: 'Missing reCAPTCHA token' }, { status: 400 });
      }
      const body = new URLSearchParams({ secret, response: recaptchaToken });
      const r = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body });
      const j = await r.json();
      if (!j.success) {
        return NextResponse.json({ error: 'Failed human verification' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
    }

    // Email validation: syntax + MX
    const email: string = String(formData.email || '').trim();
    const emailSyntaxOk = /^(?:[a-zA-Z0-9_'^&\/+{}=!?`~-]+(?:\.[a-zA-Z0-9_'^&\/+{}=!?`~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)]?)$/.test(email);
    if (!emailSyntaxOk) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    try {
      const domain = email.split('@')[1];
      const mx = await dns.resolveMx(domain);
      if (!mx || mx.length === 0) {
        return NextResponse.json({ error: 'Email domain has no MX records' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Failed to validate email domain' }, { status: 400 });
    }

    // Phone verification: require Firebase ID token if phone provided
    try {
      const phone: string | undefined = formData.phone ? String(formData.phone).replace(/\s+/g, '') : undefined;
      if (phone) {
        const idToken = formData.firebaseIdToken as string | undefined;
        if (!idToken) return NextResponse.json({ error: 'Missing Firebase token' }, { status: 400 });
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(idToken);
        const decodedPhone = decoded.phone_number ? String(decoded.phone_number).replace(/\s+/g, '') : '';
        if (!decodedPhone) return NextResponse.json({ error: 'Phone not verified' }, { status: 400 });
        if (decodedPhone !== phone) return NextResponse.json({ error: 'Phone mismatch' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Phone verification failed' }, { status: 400 });
    }

    // Address verification via Google Geocoding API
    try {
      const address: string | undefined = formData.address;
      if (address) {
        const gkey = process.env.GOOGLE_MAPS_SERVER_KEY;
        if (!gkey) return NextResponse.json({ error: 'Address verification not configured' }, { status: 501 });
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${gkey}`;
        const r = await fetch(url);
        const j = await r.json();
        if (j.status !== 'OK' || !Array.isArray(j.results) || j.results.length === 0) {
          return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
        }
        // Replace with normalized formatted address
        formData.address = j.results[0].formatted_address;
      }
    } catch {
      return NextResponse.json({ error: 'Address verification failed' }, { status: 400 });
    }

    // 1. Save to Firestore
    try {
      const db = getAdminFirestore();
      const contactData: Omit<ContactDocument, 'id'> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        address: formData.address || undefined,
        inquiryType: formData.inquiryType || undefined,
        message: formData.message,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
        heardAbout: formData.heardAbout || undefined,
        status: 'new',
        createdAt: new Date(),
        metadata: {
          ip: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      };
      
      const docRef = await db.collection(COLLECTIONS.CONTACTS).add(contactData);
      console.log('✅ Contact saved to Firestore:', docRef.id);
    } catch (dbError) {
      console.error('⚠️ Failed to save contact to Firestore:', dbError);
      // Don't fail the request if database save fails
    }

    // 2. Send confirmation email to the user
    await resend.emails.send({
      from: 'DemaShop <noreply@demashop.be>',
      to: formData.email,
      subject: 'Thank you for contacting DemaShop!',
      text: `Hi ${formData.name},\n\nThank you for reaching out to DemaShop. We've received your message and our team will get back to you within 24-48 hours.\n\nHere's a summary of your inquiry:\n- Name: ${formData.name}\n- Email: ${formData.email}\n- Phone: ${formData.phone || 'Not provided'}\n- Company: ${formData.company || 'Not provided'}\n- Inquiry Type: ${formData.inquiryType || 'Not specified'}\n- Budget: ${formData.budget || 'Not specified'}\n- Timeline: ${formData.timeline || 'Not specified'}\n\nYour Message:\n${formData.message}\n\nBest regards,\nThe DemaShop Team`,
    });

    // 3. Send notification to your sales team and Nicolas
    await resend.emails.send({
      from: 'DemaShop Contact Form <noreply@demashop.be>',
      to: ['info@demashop.be', 'nicolas.cloet@gmail.com'],
      subject: `New Contact Form Submission: ${formData.inquiryType || 'General Inquiry'}`,
      text: `New contact form submission from ${formData.name} (${formData.email}):\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone || 'Not provided'}\n` +
        `Address: ${formData.address || 'Not provided'}\n` +
        `Company: ${formData.company || 'Not provided'}\n` +
        `Inquiry Type: ${formData.inquiryType || 'Not specified'}\n` +
        `Budget: ${formData.budget || 'Not specified'}\n` +
        `Timeline: ${formData.timeline || 'Not specified'}\n` +
        `How they heard about us: ${formData.heardAbout || 'Not specified'}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\n` +
        `IP: ${request.headers.get('x-forwarded-for') || 'unknown'}\n` +
        `User Agent: ${request.headers.get('user-agent') || 'unknown'}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
