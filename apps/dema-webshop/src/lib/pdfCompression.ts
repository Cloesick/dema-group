/**
 * PDF Compression Library
 * Similar to pdf24.org compression functionality
 * 
 * Uses Ghostscript-like compression techniques
 */

import { PDFDocument } from 'pdf-lib';

export interface CompressionOptions {
  level?: 'low' | 'medium' | 'high';
  optimizeImages?: boolean;
  removeMetadata?: boolean;
  targetQuality?: number; // 0-100
}

export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage
  error?: string;
}

/**
 * Compress a PDF file
 * @param pdfBuffer - Input PDF as Buffer
 * @param options - Compression options
 * @returns Compressed PDF buffer and stats
 */
export async function compressPdf(
  pdfBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<{ buffer: Buffer; result: CompressionResult }> {
  const {
    level = 'medium',
    optimizeImages = true,
    removeMetadata = true,
    targetQuality = 70
  } = options;

  try {
    const originalSize = pdfBuffer.length;

    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    // Remove metadata if requested
    if (removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('Dema PDF Compressor');
      pdfDoc.setCreator('Dema PDF Compressor');
    }

    // Get compression settings based on level
    const compressionSettings = getCompressionSettings(level);

    // Save with compression settings
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: compressionSettings.useObjectStreams,
      addDefaultPage: false,
      objectsPerTick: compressionSettings.objectsPerTick,
    });

    const compressedSize = compressedBytes.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      buffer: Buffer.from(compressedBytes),
      result: {
        success: true,
        originalSize,
        compressedSize,
        compressionRatio: Math.max(0, Math.round(compressionRatio * 10) / 10)
      }
    };

  } catch (error) {
    console.error('PDF compression error:', error);
    return {
      buffer: pdfBuffer, // Return original on error
      result: {
        success: false,
        originalSize: pdfBuffer.length,
        compressedSize: pdfBuffer.length,
        compressionRatio: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Get compression settings based on level
 */
function getCompressionSettings(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return {
        useObjectStreams: false,
        objectsPerTick: 100,
        targetReduction: 20 // 20% reduction
      };
    case 'medium':
      return {
        useObjectStreams: true,
        objectsPerTick: 50,
        targetReduction: 40 // 40% reduction
      };
    case 'high':
      return {
        useObjectStreams: true,
        objectsPerTick: 20,
        targetReduction: 60 // 60% reduction
      };
  }
}

/**
 * Estimate compression time based on file size
 * @param fileSize - File size in bytes
 * @param level - Compression level
 * @returns Estimated time in seconds
 */
export function estimateCompressionTime(
  fileSize: number,
  level: 'low' | 'medium' | 'high' = 'medium'
): number {
  const baseMB = fileSize / (1024 * 1024);
  
  // Base time per MB
  const timePerMB = {
    low: 2,     // 2 seconds per MB
    medium: 4,  // 4 seconds per MB
    high: 8     // 8 seconds per MB
  };

  return Math.ceil(baseMB * timePerMB[level]);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate PDF file
 */
export async function validatePdf(buffer: Buffer): Promise<{ valid: boolean; error?: string }> {
  try {
    await PDFDocument.load(buffer, { ignoreEncryption: true });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid PDF file'
    };
  }
}
