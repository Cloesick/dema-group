import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const dynamic = 'force-dynamic';

// Mock user data storage - Replace with real database in production
const MOCK_USER_DATA: Record<string, { email: string; phone: string }> = {
  'nicolas.cloet@gmail.com': {
    email: 'nicolas.cloet@gmail.com',
    phone: '+32123456789',
  },
  'nicolas@demashop.be': {
    email: 'nicolas@demashop.be',
    phone: '+32123456789',
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, phone } = body;

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Email and phone are required' },
        { status: 400 }
      );
    }

    // Get user data from session email
    const userEmail = session.user.email;
    
    // In production, query your database:
    // const user = await db.user.findUnique({ where: { email: userEmail } });
    
    // For development, use mock data
    const userData = MOCK_USER_DATA[userEmail] || {
      email: userEmail,
      phone: '+32000000000', // Default test phone
    };

    // Verify email and phone match
    const emailMatches = email.toLowerCase() === userData.email.toLowerCase();
    const phoneMatches = phone.replace(/\s+/g, '') === userData.phone.replace(/\s+/g, '');

    if (emailMatches && phoneMatches) {
      return NextResponse.json({
        verified: true,
        message: 'Identity verified successfully',
      });
    } else {
      return NextResponse.json({
        verified: false,
        error: 'Email or phone number does not match our records',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
