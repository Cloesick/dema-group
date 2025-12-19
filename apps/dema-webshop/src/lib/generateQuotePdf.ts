import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface QuoteItem {
  sku: string;
  name: string;
  quantity: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
  properties?: Record<string, any>;
  notes?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  vatNumber?: string;
  address?: string;
  message?: string;
}

interface QuoteData {
  items: QuoteItem[];
  customer: CustomerInfo;
  timestamp: string;
  quoteId?: string;
}

export async function generateQuotePdf(data: QuoteData): Promise<Uint8Array> {
  const { items, customer, timestamp, quoteId } = data;
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // DEMA colors
  const demaBlue = rgb(0, 0.68, 0.94); // #00ADEF
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const white = rgb(1, 1, 1);
  
  // Page dimensions
  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin + 50) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      return true;
    }
    return false;
  };
  
  // Helper function to draw text
  const drawText = (text: string, x: number, y: number, options: {
    font?: typeof helvetica;
    size?: number;
    color?: typeof darkGray;
  } = {}) => {
    const { font = helvetica, size = 10, color = darkGray } = options;
    currentPage.drawText(text, { x, y, font, size, color });
  };
  
  // ============ HEADER ============
  // Blue header bar
  currentPage.drawRectangle({
    x: 0,
    y: pageHeight - 80,
    width: pageWidth,
    height: 80,
    color: demaBlue,
  });
  
  // DEMA Logo text
  drawText('DEMA', margin, pageHeight - 50, { font: helveticaBold, size: 28, color: white });
  drawText('Professional Equipment & Tools', margin, pageHeight - 70, { font: helvetica, size: 12, color: white });
  
  // Quote title
  drawText('QUOTE REQUEST', pageWidth - margin - 150, pageHeight - 50, { font: helveticaBold, size: 18, color: white });
  
  yPosition = pageHeight - 110;
  
  // Quote reference and date
  const quoteDate = new Date(timestamp).toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  drawText(`Date: ${quoteDate}`, margin, yPosition, { font: helvetica, size: 10, color: lightGray });
  if (quoteId) {
    drawText(`Reference: ${quoteId}`, pageWidth - margin - 150, yPosition, { font: helvetica, size: 10, color: lightGray });
  }
  
  yPosition -= 30;
  
  // ============ CUSTOMER INFORMATION ============
  // Section header
  currentPage.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: contentWidth,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  });
  drawText('CUSTOMER INFORMATION', margin + 10, yPosition, { font: helveticaBold, size: 12, color: demaBlue });
  yPosition -= 35;
  
  // Customer details in two columns
  const col1X = margin + 10;
  const col2X = margin + 300;
  const lineHeight = 18;
  
  drawText('Name:', col1X, yPosition, { font: helveticaBold, size: 10 });
  drawText(customer.name || 'N/A', col1X + 80, yPosition, { size: 10 });
  
  drawText('Email:', col2X, yPosition, { font: helveticaBold, size: 10 });
  drawText(customer.email || 'N/A', col2X + 80, yPosition, { size: 10 });
  yPosition -= lineHeight;
  
  if (customer.phone) {
    drawText('Phone:', col1X, yPosition, { font: helveticaBold, size: 10 });
    drawText(customer.phone, col1X + 80, yPosition, { size: 10 });
  }
  
  if (customer.company) {
    drawText('Company:', col2X, yPosition, { font: helveticaBold, size: 10 });
    drawText(customer.company, col2X + 80, yPosition, { size: 10 });
  }
  yPosition -= lineHeight;
  
  if (customer.vatNumber) {
    drawText('VAT Number:', col1X, yPosition, { font: helveticaBold, size: 10 });
    drawText(customer.vatNumber, col1X + 80, yPosition, { size: 10 });
    yPosition -= lineHeight;
  }
  
  if (customer.address) {
    drawText('Address:', col1X, yPosition, { font: helveticaBold, size: 10 });
    drawText(customer.address, col1X + 80, yPosition, { size: 10 });
    yPosition -= lineHeight;
  }
  
  if (customer.message) {
    yPosition -= 10;
    drawText('Message:', col1X, yPosition, { font: helveticaBold, size: 10 });
    yPosition -= lineHeight;
    // Wrap long messages
    const words = customer.message.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (testLine.length > 80) {
        drawText(line, col1X, yPosition, { size: 10 });
        yPosition -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      drawText(line, col1X, yPosition, { size: 10 });
      yPosition -= lineHeight;
    }
  }
  
  yPosition -= 20;
  
  // ============ PRODUCTS TABLE ============
  checkNewPage(100);
  
  // Section header
  currentPage.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: contentWidth,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  });
  drawText(`REQUESTED PRODUCTS (${items.length} items)`, margin + 10, yPosition, { font: helveticaBold, size: 12, color: demaBlue });
  yPosition -= 35;
  
  // Table header
  const tableStartX = margin;
  const colWidths = {
    num: 30,
    sku: 100,
    name: 200,
    qty: 50,
    category: 115,
  };
  
  currentPage.drawRectangle({
    x: tableStartX,
    y: yPosition - 5,
    width: contentWidth,
    height: 22,
    color: demaBlue,
  });
  
  let colX = tableStartX + 5;
  drawText('#', colX, yPosition, { font: helveticaBold, size: 10, color: white });
  colX += colWidths.num;
  drawText('SKU', colX, yPosition, { font: helveticaBold, size: 10, color: white });
  colX += colWidths.sku;
  drawText('Product Name', colX, yPosition, { font: helveticaBold, size: 10, color: white });
  colX += colWidths.name;
  drawText('Qty', colX, yPosition, { font: helveticaBold, size: 10, color: white });
  colX += colWidths.qty;
  drawText('Category', colX, yPosition, { font: helveticaBold, size: 10, color: white });
  
  yPosition -= 30;
  
  // Table rows
  let totalQuantity = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    totalQuantity += item.quantity;
    
    // Check if we need a new page
    const rowHeight = item.notes ? 45 : 25;
    if (checkNewPage(rowHeight + 20)) {
      // Redraw table header on new page
      currentPage.drawRectangle({
        x: tableStartX,
        y: yPosition - 5,
        width: contentWidth,
        height: 22,
        color: demaBlue,
      });
      
      colX = tableStartX + 5;
      drawText('#', colX, yPosition, { font: helveticaBold, size: 10, color: white });
      colX += colWidths.num;
      drawText('SKU', colX, yPosition, { font: helveticaBold, size: 10, color: white });
      colX += colWidths.name;
      drawText('Product Name', colX, yPosition, { font: helveticaBold, size: 10, color: white });
      colX += colWidths.qty;
      drawText('Qty', colX, yPosition, { font: helveticaBold, size: 10, color: white });
      colX += colWidths.category;
      drawText('Category', colX, yPosition, { font: helveticaBold, size: 10, color: white });
      
      yPosition -= 30;
    }
    
    // Alternating row background
    if (i % 2 === 0) {
      currentPage.drawRectangle({
        x: tableStartX,
        y: yPosition - 8,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.98),
      });
    }
    
    colX = tableStartX + 5;
    drawText(`${i + 1}`, colX, yPosition, { size: 9 });
    colX += colWidths.num;
    
    // Truncate SKU if too long
    const skuText = item.sku.length > 15 ? item.sku.substring(0, 15) + '...' : item.sku;
    drawText(skuText, colX, yPosition, { font: helveticaBold, size: 9 });
    colX += colWidths.sku;
    
    // Truncate name if too long
    const nameText = item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name;
    drawText(nameText, colX, yPosition, { size: 9 });
    colX += colWidths.name;
    
    drawText(`${item.quantity}`, colX, yPosition, { font: helveticaBold, size: 9, color: demaBlue });
    colX += colWidths.qty;
    
    const categoryText = item.category ? (item.category.length > 18 ? item.category.substring(0, 18) + '...' : item.category) : '-';
    drawText(categoryText, colX, yPosition, { size: 9, color: lightGray });
    
    // Notes if present
    if (item.notes) {
      yPosition -= 15;
      drawText(`Note: ${item.notes.substring(0, 60)}${item.notes.length > 60 ? '...' : ''}`, tableStartX + 35, yPosition, { size: 8, color: lightGray });
    }
    
    yPosition -= rowHeight - (item.notes ? 15 : 0);
  }
  
  // ============ SUMMARY ============
  yPosition -= 20;
  checkNewPage(80);
  
  currentPage.drawRectangle({
    x: pageWidth - margin - 200,
    y: yPosition - 5,
    width: 200,
    height: 50,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: demaBlue,
    borderWidth: 1,
  });
  
  drawText('SUMMARY', pageWidth - margin - 190, yPosition + 25, { font: helveticaBold, size: 10, color: demaBlue });
  drawText(`Total Items: ${items.length}`, pageWidth - margin - 190, yPosition + 8, { size: 10 });
  drawText(`Total Quantity: ${totalQuantity}`, pageWidth - margin - 190, yPosition - 8, { font: helveticaBold, size: 11, color: demaBlue });
  
  // ============ FOOTER ============
  yPosition = margin + 30;
  
  // Footer line
  currentPage.drawLine({
    start: { x: margin, y: yPosition + 20 },
    end: { x: pageWidth - margin, y: yPosition + 20 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  drawText('DEMA Shop - Professional Equipment & Tools', margin, yPosition, { size: 8, color: lightGray });
  drawText('info@demashop.be | +32 (0)51 20 51 41', margin, yPosition - 12, { size: 8, color: lightGray });
  drawText('www.demashop.be', pageWidth - margin - 80, yPosition, { size: 8, color: demaBlue });
  
  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
