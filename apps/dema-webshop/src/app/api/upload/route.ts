import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const origName = (formData.get('filename') as string) || file.name || 'document.pdf';
    const safeBase = origName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const filename = `${timestamp}_${safeBase}`;

    const destDir = path.join(process.cwd(), 'public', 'documents', 'Product_pdfs');
    await fs.mkdir(destDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const target = path.join(destDir, filename);
    await fs.writeFile(target, buffer);

    const publicPath = `/documents/Product_pdfs/${encodeURIComponent(filename)}`;
    try {
      const logDir = path.join(process.cwd(), 'public', 'data');
      await fs.mkdir(logDir, { recursive: true });
      const line = JSON.stringify({ ts: new Date().toISOString(), action: 'file_upload', by: (session?.user as any)?.aliasEmail || session?.user?.email, filename, path: publicPath }) + '\n';
      await fs.appendFile(path.join(logDir, 'admin_activity.log'), line, 'utf-8');
    } catch {}
    return NextResponse.json({ ok: true, path: publicPath, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
