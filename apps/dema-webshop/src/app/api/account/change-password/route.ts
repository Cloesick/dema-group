import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const dynamic = 'force-dynamic';

// Mock password storage - Replace with real database and bcrypt in production
const MOCK_PASSWORDS: Record<string, string> = {
  'nicolas.cloet@gmail.com': 'password123',
  'nicolas@demashop.be': 'password123',
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
    const { currentPassword, newPassword, email } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // In production, verify current password with bcrypt:
    // const user = await db.user.findUnique({ where: { email: userEmail } });
    // const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    
    // For development, use mock data
    const storedPassword = MOCK_PASSWORDS[userEmail];
    
    if (!storedPassword) {
      // User doesn't have a password (OAuth only)
      return NextResponse.json(
        { error: 'Account uses social login. Password cannot be changed.' },
        { status: 400 }
      );
    }

    if (currentPassword !== storedPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // In production, hash and save new password:
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await db.user.update({
    //   where: { email: userEmail },
    //   data: { passwordHash: hashedPassword }
    // });

    // For development, update mock data
    MOCK_PASSWORDS[userEmail] = newPassword;

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
