import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Send to the current chat context
    console.log('Cypress Test Results:', message);

    // In a real implementation, you would send this to your chat system
    // For now, we just log it to the console so you can see it

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending Cypress report:', error);
    return NextResponse.json(
      { error: 'Failed to send Cypress report' },
      { status: 500 }
    );
  }
}
