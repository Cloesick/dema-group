import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminFirestore, COLLECTIONS, QuoteDocument } from '@/lib/firebaseAdmin';
import { generateQuotePdf } from '@/lib/generateQuotePdf';

// Email recipients
// For production, add: 'info@demashop.be'
const RECIPIENTS = ['nicolas.cloet@gmail.com'];

// Demo mode: redirect demo emails to real email for testing
const DEMO_EMAIL_REDIRECT: Record<string, string> = {
  'gardener@demo.com': 'nicolas.cloet@gmail.com',
  'farmer@demo.com': 'nicolas.cloet@gmail.com',
  'plumber@demo.com': 'nicolas.cloet@gmail.com',
  'handyman@demo.com': 'nicolas.cloet@gmail.com',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, timestamp } = body;
    
    // Save to Firestore
    let quoteId: string | null = null;
    try {
      const db = getAdminFirestore();
      const quoteData: Omit<QuoteDocument, 'id'> = {
        customer: {
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone,
          company: customer.company,
          vatNumber: customer.vatNumber,
          address: customer.address,
        },
        items: items.map((item: any) => ({
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          brand: item.brand,
          imageUrl: item.imageUrl,
          properties: item.properties,
          notes: item.notes,
        })),
        status: 'pending',
        totalItems: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        createdAt: new Date(timestamp),
        updatedAt: new Date(),
        notes: customer.message,
        metadata: {
          ip: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          source: 'website',
        },
      };
      
      const docRef = await db.collection(COLLECTIONS.QUOTES).add(quoteData);
      quoteId = docRef.id;
      console.log('✅ Quote saved to Firestore:', quoteId);
    } catch (dbError) {
      console.error('⚠️ Failed to save quote to Firestore:', dbError);
      // Continue with email - don't fail the request
    }

    // Format email content as HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .section { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #f97316; }
    .customer-info { display: grid; grid-template-columns: 120px 1fr; gap: 10px; }
    .item { background: #fff; padding: 12px; margin: 8px 0; border: 1px solid #e5e7eb; border-radius: 4px; }
    .item-header { font-weight: bold; color: #f97316; margin-bottom: 5px; }
    .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 New Quote Request</h1>
      <p style="margin: 5px 0 0 0;">DEMA Shop - Quote Management System</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="color: #f97316; margin-top: 0;">👤 Customer Information</h2>
        <div class="customer-info">
          <strong>Name:</strong><span>${customer.name || 'N/A'}</span>
          <strong>Email:</strong><span><a href="mailto:${customer.email}">${customer.email || 'N/A'}</a></span>
          <strong>Phone:</strong><span><a href="tel:${customer.phone}">${customer.phone || 'N/A'}</a></span>
          <strong>Company:</strong><span>${customer.company || 'N/A'}</span>
          ${customer.vatNumber ? `<strong>VAT Number:</strong><span>${customer.vatNumber}</span>` : ''}
          ${customer.address ? `<strong>Address:</strong><span>${customer.address}</span>` : ''}
        </div>
        ${customer.message ? `
          <div style="margin-top: 15px;">
            <strong>📝 Message:</strong>
            <p style="background: #f9fafb; padding: 10px; border-radius: 4px; margin: 5px 0;">${customer.message}</p>
          </div>
        ` : ''}
      </div>

      <div class="section">
        <h2 style="color: #f97316; margin-top: 0;">📦 Requested Items (${items.length})</h2>
        ${items.map((item: any, index: number) => `
          <div class="item">
            <div class="item-header">${index + 1}. ${item.name}</div>
            <div style="font-size: 14px; color: #6b7280;">
              <strong>SKU:</strong> ${item.sku}<br>
              <strong>Quantity:</strong> ${item.quantity}<br>
              ${item.category ? `<strong>Category:</strong> ${item.category}<br>` : ''}
              ${item.notes ? `<strong>Notes:</strong> ${item.notes}<br>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>📅 Submitted: ${new Date(timestamp).toLocaleString('nl-BE', { 
          dateStyle: 'full', 
          timeStyle: 'long' 
        })}</p>
        <p>This is an automated message from DEMA Shop Quote System</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text version
    const emailText = `
New Quote Request Received
========================

Customer Information:
- Name: ${customer.name || 'N/A'}
- Email: ${customer.email || 'N/A'}
- Phone: ${customer.phone || 'N/A'}
- Company: ${customer.company || 'N/A'}
${customer.vatNumber ? `- VAT Number: ${customer.vatNumber}\n` : ''}
${customer.address ? `- Address: ${customer.address}\n` : ''}

Message: ${customer.message || 'None'}

Requested Items (${items.length}):
${items.map((item: any, index: number) => `
${index + 1}. ${item.name}
   SKU: ${item.sku}
   Quantity: ${item.quantity}
   ${item.category ? `Category: ${item.category}\n   ` : ''}${item.notes ? `Notes: ${item.notes}` : ''}
`).join('\n')}

Submitted at: ${new Date(timestamp).toLocaleString()}
========================
    `;

    // Send email using nodemailer
    // Configure your SMTP settings in environment variables
    console.log('📧 SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? '✓ set' : '✗ missing',
      pass: process.env.SMTP_PASS ? '✓ set' : '✗ missing',
      from: process.env.SMTP_FROM,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Generate PDF attachment
    let pdfBuffer: Buffer | null = null;
    try {
      const pdfBytes = await generateQuotePdf({
        items,
        customer,
        timestamp,
        quoteId: quoteId || undefined,
      });
      pdfBuffer = Buffer.from(pdfBytes);
      console.log('✅ Quote PDF generated successfully');
    } catch (pdfError) {
      console.error('⚠️ Failed to generate PDF:', pdfError);
      // Continue without PDF attachment
    }

    // Verify SMTP connection before sending
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      throw new Error(`SMTP connection failed: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`);
    }

    // Send to both recipients (admin copy)
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"DEMA Shop" <noreply@demashop.be>',
      to: RECIPIENTS.join(', '),
      replyTo: customer.email,
      subject: `🎯 New Quote Request from ${customer.name || customer.email}`,
      text: emailText,
      html: emailHtml,
      attachments: pdfBuffer ? [{
        filename: `DEMA-Quote-${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }] : [],
    });

    // Send confirmation email to customer with PDF
    if (customer.email) {
      const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00ADEF 0%, #0095D9 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .section { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #00ADEF; }
    .item { background: #fff; padding: 12px; margin: 8px 0; border: 1px solid #e5e7eb; border-radius: 4px; }
    .item-header { font-weight: bold; color: #00ADEF; margin-bottom: 5px; }
    .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
    .cta-button { display: inline-block; background: #00ADEF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Quote Request Received</h1>
      <p style="margin: 5px 0 0 0;">Thank you for your request, ${customer.name || 'valued customer'}!</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="color: #00ADEF; margin-top: 0;">📋 Your Quote Summary</h2>
        <p>We have received your quote request for <strong>${items.length} product(s)</strong>.</p>
        <p>Our team will review your request and get back to you within <strong>24-48 hours</strong> with pricing and availability.</p>
      </div>

      <div class="section">
        <h2 style="color: #00ADEF; margin-top: 0;">📦 Requested Items</h2>
        ${items.map((item: any, index: number) => `
          <div class="item">
            <div class="item-header">${index + 1}. ${item.name}</div>
            <div style="font-size: 14px; color: #6b7280;">
              <strong>SKU:</strong> ${item.sku}<br>
              <strong>Quantity:</strong> ${item.quantity}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 style="color: #00ADEF; margin-top: 0;">📎 Your Quote PDF</h2>
        <p>A detailed PDF of your quote request is attached to this email for your records.</p>
      </div>

      <div class="section" style="text-align: center;">
        <h2 style="color: #00ADEF; margin-top: 0;">Need Help?</h2>
        <p>If you have any questions, feel free to contact us:</p>
        <p>
          📧 <a href="mailto:info@demashop.be">info@demashop.be</a><br>
          📞 +32 (0)51 20 51 41
        </p>
        <a href="https://www.demashop.be" class="cta-button">Visit Our Website</a>
      </div>

      <div class="footer">
        <p>Thank you for choosing DEMA Shop!</p>
        <p>This is an automated confirmation email.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      // Redirect demo emails to real email for testing
      const customerEmailTo = DEMO_EMAIL_REDIRECT[customer.email] || customer.email;
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"DEMA Shop" <noreply@demashop.be>',
        to: customerEmailTo,
        subject: `✅ Your DEMA Quote Request - ${items.length} item(s)${DEMO_EMAIL_REDIRECT[customer.email] ? ` [DEMO: ${customer.email}]` : ''}`,
        html: customerEmailHtml,
        attachments: pdfBuffer ? [{
          filename: `DEMA-Quote-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }] : [],
      });

      console.log('✅ Confirmation email sent to customer:', customer.email);
    }

    console.log('✅ Quote request email sent to:', RECIPIENTS.join(', '));

    return NextResponse.json({ 
      success: true,
      message: 'Quote request sent successfully'
    });

  } catch (error) {
    console.error('❌ Error processing quote request:', error);
    
    // Log detailed error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);

    return NextResponse.json(
      { 
        error: 'Failed to send quote request. Please try again or contact us directly.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
