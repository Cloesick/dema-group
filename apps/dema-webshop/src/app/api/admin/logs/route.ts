import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(200, parseInt(searchParams.get('limit') || '50', 10)));

    const logPath = path.resolve(process.cwd(), 'public', 'data', 'admin_activity.log');
    try {
      const content = await fs.readFile(logPath, 'utf-8');
      const lines = content.trim().split(/\r?\n/).filter(Boolean);
      const last = lines.slice(-limit).map((line) => {
        try { return JSON.parse(line); } catch { return { raw: line }; }
      }).reverse();
      return NextResponse.json({ entries: last, count: last.length });
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        return NextResponse.json({ entries: [], count: 0 });
      }
      throw e;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
  }
}
