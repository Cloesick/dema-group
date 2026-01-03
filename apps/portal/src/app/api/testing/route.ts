import { NextResponse } from 'next/server';
// import { testDB } from '../../../../scripts/test-db';
import { getServerSession } from 'next-auth';
import type { Session, User } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

async function checkAdmin(): Promise<Response | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as (User & { role?: string }) | null;
  if (!user?.role || user.role !== 'admin') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403 }
    );
  }
  return null;
}

export async function GET(req: Request) {
  const unauthorized = await checkAdmin();
  if (unauthorized) return unauthorized;

  try {
    // Testing endpoints temporarily disabled
    return NextResponse.json(
      { message: 'Testing endpoints temporarily disabled' },
      { status: 503 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const unauthorized = await checkAdmin();
  if (unauthorized) return unauthorized;

  try {
    // Testing endpoints temporarily disabled
    return NextResponse.json(
      { message: 'Testing endpoints temporarily disabled' },
      { status: 503 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
