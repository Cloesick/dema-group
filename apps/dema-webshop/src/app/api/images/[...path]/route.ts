import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Base directories for product images
// Note: These paths are resolved at runtime to serve images from multiple locations
const getImageBaseDirs = () => {
  const cwd = process.cwd();
  return {
    documents: path.resolve(cwd, 'documents', 'Product_pdfs', 'images'),
    public: path.resolve(cwd, 'public', 'images'),
  };
};

// MIME types for supported image formats
const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  
  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: 'No image path provided' }, { status: 400 });
  }

  // Join path segments and decode URI components
  const imagePath = pathSegments.map(decodeURIComponent).join('/');
  
  // Prevent directory traversal attacks
  if (imagePath.includes('..') || imagePath.includes('\\..') || imagePath.includes('../')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // Get base directories at runtime
  const dirs = getImageBaseDirs();
  
  // Try documents directory first, then public directory
  let fullPath = path.join(dirs.documents, imagePath);
  
  // If not found in documents, try public/images
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(dirs.public, imagePath);
  }
  
  // Ensure the resolved path is still within one of the base directories
  if (!fullPath.startsWith(dirs.documents) && !fullPath.startsWith(dirs.public)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  // Get file extension and MIME type
  const ext = path.extname(fullPath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  
  if (!mimeType) {
    return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
  }

  // Read file and return with appropriate headers
  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const stat = fs.statSync(fullPath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Last-Modified': stat.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error('Error reading image:', error);
    return NextResponse.json({ error: 'Failed to read image' }, { status: 500 });
  }
}
