import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import nodemailer from 'nodemailer';

// Helper to format property keys for display
function formatPropertyKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Helper to format property values
function formatPropertyValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  return String(value);
}

// Excluded property keys that shouldn't be displayed
const EXCLUDED_KEYS = ['type', 'bestelnr', 'sku_series', 'page_in_pdf', 'pdf_source', 'catalog', 'brand', 'sku', 'label'];

// Demo mode: redirect demo emails to real email for testing
const DEMO_EMAIL_REDIRECT: Record<string, string> = {
  'gardener@demo.com': 'nicolas.cloet@gmail.com',
  'farmer@demo.com': 'nicolas.cloet@gmail.com',
  'plumber@demo.com': 'nicolas.cloet@gmail.com',
  'handyman@demo.com': 'nicolas.cloet@gmail.com',
};

export async function POST(request: NextRequest) {
  try {
    const { formData, products } = await request.json();

    // Generate PDF with exhaustive product data
    const pdfBytes = await generateQuotePDF(formData, products);

    // Send emails with product details
    await sendQuoteEmails(formData, products, pdfBytes);

    return NextResponse.json({
      success: true,
      message: 'Quote generated and sent successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error generating quote:', errorMessage);
    console.error('Stack:', error instanceof Error ? error.stack : '');
    return NextResponse.json(
      { 
        error: 'Failed to generate quote',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Helper to draw text and handle page breaks
function drawTextWithPageBreak(
  pdfDoc: PDFDocument,
  currentPage: PDFPage,
  text: string,
  x: number,
  yPosition: number,
  options: { size: number; font: PDFFont; color?: any; maxWidth?: number },
  pageHeight: number
): { page: PDFPage; y: number } {
  if (yPosition < 80) {
    const newPage = pdfDoc.addPage([595, 842]);
    return { page: newPage, y: pageHeight - 50 };
  }
  currentPage.drawText(text, { x, y: yPosition, ...options });
  return { page: currentPage, y: yPosition };
}

async function generateQuotePDF(formData: any, products: any[]) {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  let yPosition = height - 50;

  // Header - Company Info
  page.drawText('DEMA-SHOP bv', {
    x: 50,
    y: yPosition,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0.68, 0.94),
  });

  yPosition -= 15;
  page.drawText('Ovenstraat 11 • 8800 Roeselare • Belgium', {
    x: 50,
    y: yPosition,
    size: 9,
    font: helveticaFont,
  });

  yPosition -= 12;
  page.drawText('T +32(0)51 20 51 41 • info@demashop.be • www.demashop.be', {
    x: 50,
    y: yPosition,
    size: 9,
    font: helveticaFont,
  });

  yPosition -= 12;
  page.drawText('BTW BE 0426.954.705 • RPR Kortrijk', {
    x: 50,
    y: yPosition,
    size: 8,
    font: helveticaFont,
  });

  // Title
  yPosition -= 40;
  page.drawText('QUOTE REQUEST', {
    x: 50,
    y: yPosition,
    size: 20,
    font: helveticaBold,
    color: rgb(0, 0.68, 0.94),
  });

  // Date and Quote Reference
  yPosition -= 20;
  const today = new Date().toLocaleDateString('en-GB');
  const quoteRef = `QR-${Date.now().toString(36).toUpperCase()}`;
  page.drawText(`Date: ${today}  |  Reference: ${quoteRef}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  // Customer Information Section
  yPosition -= 30;
  page.drawText('CUSTOMER INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 20;
  const customerInfo = [
    `Customer Type: ${formData.customerType === 'business' ? 'Business' : 'Private'}`,
    formData.customerType === 'business' && formData.companyName ? `Company: ${formData.companyName}` : null,
    formData.vatNumber ? `VAT: ${formData.vatNumber}` : null,
    `Name: ${formData.firstName} ${formData.lastName}`,
    `Email: ${formData.email}`,
    `Phone: ${formData.phone}`,
    `Address: ${formData.address}`,
    `${formData.postalCode} ${formData.city}`,
  ].filter(Boolean);

  customerInfo.forEach((line) => {
    page.drawText(line!, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
    });
    yPosition -= 15;
  });

  // Products Section with EXHAUSTIVE DATA
  yPosition -= 25;
  page.drawText('REQUESTED PRODUCTS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 20;

  // Product Cards with full specifications
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Check if we need a new page (need at least 150px for a product card)
    if (yPosition < 150) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }

    // Product card background
    const cardHeight = 80 + (product.properties ? Math.min(Object.keys(product.properties).filter(k => !EXCLUDED_KEYS.includes(k)).length, 6) * 12 : 0);
    page.drawRectangle({
      x: 50,
      y: yPosition - cardHeight,
      width: width - 100,
      height: cardHeight,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    // Product header
    yPosition -= 18;
    page.drawText(`${i + 1}. ${product.name || product.sku}`, {
      x: 60,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0.4, 0.6),
    });

    // SKU and Quantity row
    yPosition -= 16;
    page.drawText(`SKU: ${product.sku}`, {
      x: 60,
      y: yPosition,
      size: 9,
      font: helveticaBold,
    });
    page.drawText(`Quantity: ${product.quantity}`, {
      x: 250,
      y: yPosition,
      size: 9,
      font: helveticaBold,
    });
    if (product.brand) {
      page.drawText(`Brand: ${product.brand}`, {
        x: 380,
        y: yPosition,
        size: 9,
        font: helveticaFont,
      });
    }

    // Category
    if (product.category) {
      yPosition -= 14;
      page.drawText(`Catalog: ${product.category}`, {
        x: 60,
        y: yPosition,
        size: 8,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Product specifications/properties
    if (product.properties && Object.keys(product.properties).length > 0) {
      yPosition -= 16;
      page.drawText('Specifications:', {
        x: 60,
        y: yPosition,
        size: 8,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3),
      });

      yPosition -= 12;
      const props = Object.entries(product.properties)
        .filter(([key]) => !EXCLUDED_KEYS.includes(key))
        .slice(0, 8); // Limit to 8 properties per product

      // Display properties in two columns
      for (let j = 0; j < props.length; j += 2) {
        const [key1, val1] = props[j];
        const text1 = `• ${formatPropertyKey(key1)}: ${formatPropertyValue(val1)}`;
        page.drawText(text1.substring(0, 40), {
          x: 70,
          y: yPosition,
          size: 8,
          font: helveticaFont,
        });

        if (props[j + 1]) {
          const [key2, val2] = props[j + 1];
          const text2 = `• ${formatPropertyKey(key2)}: ${formatPropertyValue(val2)}`;
          page.drawText(text2.substring(0, 40), {
            x: 300,
            y: yPosition,
            size: 8,
            font: helveticaFont,
          });
        }
        yPosition -= 11;
      }
    }

    // Notes for this product
    if (product.notes) {
      yPosition -= 4;
      page.drawText(`Notes: ${product.notes.substring(0, 80)}`, {
        x: 60,
        y: yPosition,
        size: 8,
        font: helveticaFont,
        color: rgb(0.5, 0.3, 0),
      });
      yPosition -= 12;
    }

    yPosition -= 15; // Space between products
  }

  // Comments Section
  if (formData.comments) {
    if (yPosition < 100) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    
    yPosition -= 20;
    page.drawText('ADDITIONAL COMMENTS', {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBold,
    });

    yPosition -= 20;
    const comments = formData.comments.substring(0, 500);
    const lines = comments.match(/.{1,80}/g) || [comments];
    lines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 9,
        font: helveticaFont,
      });
      yPosition -= 12;
    });
  }

  // Footer on last page
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  lastPage.drawText('This is a quote request. A formal quote will be sent to you within 24-48 hours.', {
    x: 50,
    y: 50,
    size: 9,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  lastPage.drawText('Thank you for choosing DEMA-SHOP!', {
    x: 50,
    y: 35,
    size: 9,
    font: helveticaBold,
    color: rgb(0, 0.68, 0.94),
  });

  return await pdfDoc.save();
}

async function sendQuoteEmails(formData: any, products: any[], pdfBytes: Uint8Array) {
  console.log('📧 SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? '✓ set' : '✗ missing',
    pass: process.env.SMTP_PASS ? '✓ set' : '✗ missing',
  });

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (verifyError) {
    console.error('❌ SMTP verification failed:', verifyError);
    throw new Error(`SMTP connection failed: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`);
  }

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  // Generate product HTML for emails
  const generateProductHtml = (product: any, index: number) => {
    const props = product.properties ? Object.entries(product.properties)
      .filter(([key]) => !EXCLUDED_KEYS.includes(key))
      .slice(0, 6) : [];
    
    const propsHtml = props.length > 0 ? `
      <div style="margin-top: 8px; padding: 8px; background-color: #f0f0f0; border-radius: 4px;">
        <strong style="font-size: 11px; color: #666;">Specifications:</strong>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px; font-size: 11px;">
          ${props.map(([key, val]) => `
            <span>• ${formatPropertyKey(key)}: ${formatPropertyValue(val)}</span>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #00ADEF;">
        <div style="font-weight: bold; color: #00ADEF; font-size: 14px;">${index + 1}. ${product.name || product.sku}</div>
        <div style="margin-top: 8px; font-size: 13px;">
          <strong>SKU:</strong> ${product.sku} &nbsp;|&nbsp;
          <strong>Quantity:</strong> ${product.quantity}
          ${product.brand ? `&nbsp;|&nbsp; <strong>Brand:</strong> ${product.brand}` : ''}
        </div>
        ${product.category ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">Catalog: ${product.category}</div>` : ''}
        ${propsHtml}
        ${product.notes ? `<div style="margin-top: 8px; font-size: 12px; color: #996600; font-style: italic;">📝 Notes: ${product.notes}</div>` : ''}
      </div>
    `;
  };

  const productsHtml = products.map((p, i) => generateProductHtml(p, i)).join('');

  // Redirect demo emails to real email for testing
  const customerEmailTo = DEMO_EMAIL_REDIRECT[formData.email] || formData.email;
  
  // Email to customer with product details
  await transporter.sendMail({
    from: `"DEMA-SHOP" <${process.env.SMTP_USER}>`,
    to: customerEmailTo,
    subject: `Your Quote Request - DEMA-SHOP${DEMO_EMAIL_REDIRECT[formData.email] ? ` [DEMO: ${formData.email}]` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background-color: #00ADEF; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Quote Request Received</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Dear ${formData.firstName} ${formData.lastName},</p>
          
          <p>Thank you for your quote request. We have received your inquiry and will process it shortly.</p>
          
          <h3 style="color: #00ADEF; border-bottom: 2px solid #00ADEF; padding-bottom: 8px;">📦 Your Requested Products (${products.length})</h3>
          ${productsHtml}
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #00ADEF; margin: 20px 0;">
            <strong>What happens next?</strong><br/>
            1. Our team reviews your request<br/>
            2. We prepare a customized quote<br/>
            3. You receive the quote via email<br/>
            4. You can accept or discuss modifications
          </div>
          
          <p>Please find attached a PDF copy of your quote request for your records.</p>
          
          <p>If you have any questions, feel free to contact us:</p>
          <ul>
            <li>Email: info@demashop.be</li>
            <li>Phone: +32(0)51 20 51 41</li>
          </ul>
          
          <p>Best regards,<br/>
          <strong>DEMA-SHOP Team</strong></p>
        </div>
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          DEMA-SHOP bv • Ovenstraat 11 • 8800 Roeselare • Belgium<br/>
          www.demashop.be
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'quote-request.pdf',
        content: pdfBase64,
        encoding: 'base64',
      },
    ],
  });

  // Email to DEMA-SHOP team with full product details
  await transporter.sendMail({
    from: `"DEMA-SHOP Website" <${process.env.SMTP_USER}>`,
    to: 'nicolas.cloet@gmail.com', // For production, add: 'info@demashop.be'
    subject: `🔔 New Quote Request from ${formData.firstName} ${formData.lastName} (${products.length} items)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background-color: #00ADEF; color: white; padding: 20px;">
          <h1 style="margin: 0;">🔔 New Quote Request</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${products.length} product(s) requested</p>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">👤 Customer Information</h2>
          <table style="width: 100%; background-color: white; padding: 15px; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.firstName} ${formData.lastName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${formData.email}">${formData.email}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${formData.phone}">${formData.phone}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.customerType === 'business' ? '🏢 Business' : '👤 Private'}</td></tr>
            ${formData.companyName ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.companyName}</td></tr>` : ''}
            ${formData.vatNumber ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>VAT:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.vatNumber}</td></tr>` : ''}
            <tr><td style="padding: 8px;"><strong>Address:</strong></td><td style="padding: 8px;">${formData.address}, ${formData.postalCode} ${formData.city}</td></tr>
          </table>
          
          <h2 style="color: #333; margin-top: 25px;">📦 Requested Products (${products.length})</h2>
          ${productsHtml}
          
          ${formData.comments ? `
            <h3 style="color: #333; margin-top: 25px;">💬 Customer Comments:</h3>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #f97316; border-radius: 4px;">
              ${formData.comments}
            </div>
          ` : ''}
          
          <p style="margin-top: 25px; padding: 15px; background-color: #e8f4f8; border-radius: 4px;">
            <strong>📎 Full quote request details are attached as PDF.</strong>
          </p>
        </div>
        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 11px;">
          Submitted: ${new Date().toLocaleString('nl-BE', { dateStyle: 'full', timeStyle: 'short' })}
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'quote-request.pdf',
        content: pdfBase64,
        encoding: 'base64',
      },
    ],
  });
}
