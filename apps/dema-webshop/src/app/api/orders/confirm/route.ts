import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderRef,
      items,
      totals,
      customer,
      billing,
      locale,
      bank
    } = body || {};

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
    }

    const notifyRaw = process.env.ORDER_NOTIFY_EMAILS || 'info@demashop.be,nicolas.cloet@gmail.com';
    const notifyList = notifyRaw.split(',').map(s => s.trim()).filter(Boolean);

    const toCustomer = String(customer?.email || '').trim();
    if (!toCustomer) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    const subject = `Order ${orderRef} received`;
    const itemLines = Array.isArray(items) && items.length
      ? items.map((it: any) => `- ${it.name || it.sku || 'Item'} x${it.quantity || 1} — €${Number(it.price || 0).toFixed(2)}`).join('\n')
      : '- (No items attached)';

    const bankBlock = `
Bank transfer details:\n
${bank?.accountName ? `Account Name: ${bank.accountName}\n` : ''}${bank?.bankName ? `Bank: ${bank.bankName}\n` : ''}${bank?.iban ? `IBAN: ${bank.iban}\n` : ''}${bank?.bic ? `BIC: ${bank.bic}\n` : ''}Payment Reference: ${orderRef}
`;

    const text = `Thank you for your order!\n\nOrder: ${orderRef}\n\nItems:\n${itemLines}\n\nTotals:\n- Subtotal: €${Number(totals?.subtotal || 0).toFixed(2)}\n- Shipping: €${Number(totals?.shipping || 0).toFixed(2)}\n- Tax: €${Number(totals?.tax || 0).toFixed(2)}\n- Total: €${Number(totals?.total || 0).toFixed(2)}\n\n${bankBlock}\nWe'll start preparing your order as soon as we receive your payment.`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">
        <h2>Thank you for your order!</h2>
        <p><strong>Order:</strong> ${orderRef}</p>
        <h3>Items</h3>
        <ul>
          ${(Array.isArray(items) ? items : []).map((it: any) => `<li>${it.name || it.sku || 'Item'} x${it.quantity || 1} — €${Number(it.price || 0).toFixed(2)}</li>`).join('')}
        </ul>
        <h3>Totals</h3>
        <ul>
          <li>Subtotal: €${Number(totals?.subtotal || 0).toFixed(2)}</li>
          <li>Shipping: €${Number(totals?.shipping || 0).toFixed(2)}</li>
          <li>Tax: €${Number(totals?.tax || 0).toFixed(2)}</li>
          <li><strong>Total: €${Number(totals?.total || 0).toFixed(2)}</strong></li>
        </ul>
        <h3>Bank Transfer Details</h3>
        <ul>
          ${bank?.accountName ? `<li>Account Name: <strong>${bank.accountName}</strong></li>` : ''}
          ${bank?.bankName ? `<li>Bank: <strong>${bank.bankName}</strong></li>` : ''}
          ${bank?.iban ? `<li>IBAN: <strong>${bank.iban}</strong></li>` : ''}
          ${bank?.bic ? `<li>BIC: <strong>${bank.bic}</strong></li>` : ''}
          <li>Payment Reference: <strong>${orderRef}</strong></li>
        </ul>
        <p>We'll start preparing your order as soon as we receive your payment.</p>
      </div>
    `;

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'DemaShop <noreply@demashop.be>',
        to: [toCustomer],
        bcc: notifyList,
        subject,
        text,
        html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Resend failed', details: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error', details: e?.message || String(e) }, { status: 500 });
  }
}
