import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, confirmation } = body;

    // Verify confirmation text
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text' },
        { status: 400 }
      );
    }

    // Verify email matches session
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // In production, delete user and all related data:
    // await db.$transaction([
    //   db.order.deleteMany({ where: { userId: user.id } }),
    //   db.quote.deleteMany({ where: { userId: user.id } }),
    //   db.address.deleteMany({ where: { userId: user.id } }),
    //   db.session.deleteMany({ where: { userId: user.id } }),
    //   db.user.delete({ where: { id: user.id } }),
    // ]);

    // For development, log the deletion
    console.log(`[MOCK] Account deletion requested for: ${userEmail}`);
    console.log(`[MOCK] In production, this would delete:`);
    console.log(`  - User account: ${userEmail}`);
    console.log(`  - All orders`);
    console.log(`  - All quotes`);
    console.log(`  - All addresses`);
    console.log(`  - All sessions`);

    // Send confirmation email (in production)
    // await sendEmail({
    //   to: userEmail,
    //   subject: 'Account Deletion Confirmation',
    //   template: 'account-deleted',
    // });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
