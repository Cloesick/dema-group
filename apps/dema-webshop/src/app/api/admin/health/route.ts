import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testDir = path.resolve(process.cwd(), 'public', 'data');
    await fs.mkdir(testDir, { recursive: true });
    const testFile = path.join(testDir, 'fs_write_test.txt');
    const ts = new Date().toISOString();
    await fs.writeFile(testFile, `test ${ts}\n`, { flag: 'a', encoding: 'utf-8' });
    const ok = true;

    return NextResponse.json({ ok, details: 'Successfully wrote to public/data', path: testFile });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Filesystem write failed', message: (error as Error)?.message }, { status: 500 });
  }
}
