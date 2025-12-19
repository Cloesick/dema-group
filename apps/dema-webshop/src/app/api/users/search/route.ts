import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// User accounts (same as in auth.ts - in production this would be a database query)
const USER_ACCOUNTS: Record<string, { name: string; company?: string; phone?: string; role: string }> = {
  'plumber@demo.com': {
    name: 'Jan De Loodgieter',
    role: 'user',
    company: 'Sanitair Pro BVBA',
    phone: '+32 477 11 22 33',
  },
  'farmer@demo.com': {
    name: 'Piet Boerderij',
    role: 'user',
    company: 'Hoeve Boerderij NV',
    phone: '+32 478 22 33 44',
  },
  'contractor@demo.com': {
    name: 'Marc Aannemer',
    role: 'user',
    company: 'Bouwbedrijf Aannemer',
    phone: '+32 479 33 44 55',
  },
  'industrial@demo.com': {
    name: 'Sophie Industrie',
    role: 'user',
    company: 'Industrie Solutions NV',
    phone: '+32 470 44 55 66',
  },
  'installer@demo.com': {
    name: 'Koen Installateur',
    role: 'user',
    company: 'Technische Installaties BV',
    phone: '+32 471 55 66 77',
  },
  'gardener@demo.com': {
    name: 'Lisa Tuinier',
    role: 'user',
    company: 'Groene Vingers Tuinen',
    phone: '+32 472 66 77 88',
  },
  'test@demo.com': {
    name: 'Test User',
    role: 'user',
    phone: '+32 499 00 00 00',
  },
};

export async function GET(request: NextRequest) {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  // Search users by name, email, or company
  const results = Object.entries(USER_ACCOUNTS)
    .filter(([email, user]) => {
      const searchString = `${email} ${user.name} ${user.company || ''}`.toLowerCase();
      return searchString.includes(query);
    })
    .map(([email, user]) => ({
      email,
      name: user.name,
      company: user.company || '',
      phone: user.phone || '',
    }))
    .slice(0, 10); // Limit to 10 results

  return NextResponse.json({ users: results });
}
