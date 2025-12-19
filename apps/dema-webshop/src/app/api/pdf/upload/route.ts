import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for large file uploads

interface PdfUpload {
  id: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  uploadedBy: string;
  uploadedByEmail: string;
  uploadedAt: string;
  status: 'uploading' | 'compressing' | 'ready' | 'error';
  path: string;
  publicUrl: string;
  errorMessage?: string;
}

async function getUploadHistory(): Promise<PdfUpload[]> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'pdf-uploads.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

async function saveUploadHistory(uploads: PdfUpload[]): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const dataPath = path.join(dataDir, 'pdf-uploads.json');
    await fs.writeFile(dataPath, JSON.stringify(uploads, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving upload history:', error);
  }
}

/**
 * Compress a PDF using pdf-lib by re-saving with optimizations.
 * This removes unused objects and optimizes the PDF structure.
 */
async function compressPdf(inputBuffer: Buffer): Promise<{ buffer: Buffer; originalSize: number; compressedSize: number }> {
  const originalSize = inputBuffer.length;
  
  try {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(inputBuffer, {
      ignoreEncryption: true,
    });
    
    // Save with compression options
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    
    const compressedBuffer = Buffer.from(compressedBytes);
    const compressedSize = compressedBuffer.length;
    
    // Only use compressed version if it's actually smaller
    if (compressedSize < originalSize) {
      return {
        buffer: compressedBuffer,
        originalSize,
        compressedSize,
      };
    }
    
    // Return original if compression didn't help
    return {
      buffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
    };
  } catch (error) {
    console.error('PDF compression error:', error);
    // Return original on error
    return {
      buffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

async function checkEmployeeVerification(email: string): Promise<boolean> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'employees.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const employees = JSON.parse(fileContents);
    
    const employee = employees.find(
      (emp: any) => emp.email === email && emp.verified && emp.active
    );
    
    return !!employee;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in first' },
        { status: 401 }
      );
    }

    // Check employee verification
    const isVerified = await checkEmployeeVerification(session.user.email);
    if (!isVerified) {
      return NextResponse.json(
        { 
          error: 'Not authorized',
          message: 'You must be a verified Dema employee to upload PDFs. Please verify your employee ID first.'
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const compressionLevel = formData.get('compressionLevel') as string || 'medium';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const uploadId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Save original file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    await fs.mkdir(uploadDir, { recursive: true });

    const originalFilename = file.name;
    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(uploadDir, `${uploadId}_${safeFilename}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Compress the PDF
    const compressionResult = await compressPdf(buffer);
    const { buffer: finalBuffer, originalSize, compressedSize } = compressionResult;
    
    // Save the (possibly compressed) file
    await writeFile(filePath, finalBuffer);
    
    // Calculate compression ratio
    const compressionRatio = originalSize > 0 
      ? Math.round((1 - compressedSize / originalSize) * 100) 
      : 0;

    // Create upload record
    const upload: PdfUpload = {
      id: uploadId,
      filename: originalFilename,
      originalSize: originalSize,
      compressedSize: compressedSize,
      compressionRatio: compressionRatio,
      uploadedBy: session.user.name || 'Unknown',
      uploadedByEmail: session.user.email,
      uploadedAt: timestamp,
      status: 'ready',
      path: filePath,
      publicUrl: `/uploads/pdfs/${uploadId}_${safeFilename}`
    };

    // Save to history
    const history = await getUploadHistory();
    history.unshift(upload); // Add to beginning
    await saveUploadHistory(history);

    const savedMB = ((originalSize - compressedSize) / (1024 * 1024)).toFixed(2);
    const compressionMessage = compressionRatio > 0
      ? `PDF compressed by ${compressionRatio}% (saved ${savedMB} MB)`
      : 'PDF uploaded (no compression needed)';

    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        filename: upload.filename,
        originalSize: upload.originalSize,
        compressedSize: upload.compressedSize,
        compressionRatio: upload.compressionRatio,
        status: upload.status,
        publicUrl: upload.publicUrl,
        uploadedAt: upload.uploadedAt
      },
      message: compressionMessage
    });

  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { error: 'Failed to upload PDF', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch upload history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const history = await getUploadHistory();
    
    // Filter by user's email or show all if admin
    const userEmail = session.user.email;
    const isAdmin = (session.user as any)?.role === 'admin';

    const userUploads = isAdmin 
      ? history 
      : history.filter(upload => upload.uploadedByEmail === userEmail);

    return NextResponse.json({
      uploads: userUploads
    });

  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
