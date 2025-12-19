import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = pathSegments.join('/');
  
  // Security: only allow PDF files from documents folder
  if (!filePath.endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
  }

  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  try {
    // Try to read the file from public/documents/
    const publicPath = path.join(process.cwd(), 'public', 'documents', filePath);
    
    // Check if file exists
    if (!fs.existsSync(publicPath)) {
      console.error('PDF not found:', publicPath);
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(publicPath);
    
    // Return the PDF with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json({ error: 'Failed to serve PDF' }, { status: 500 });
  }
}
