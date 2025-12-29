import { NextResponse } from 'next/server';
import { testDB } from '../../../../scripts/test-db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
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

  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();

  try {
    await testDB.init();

    switch (endpoint) {
      case 'active':
        return NextResponse.json(await testDB.getActiveTests());
      case 'recent':
        return NextResponse.json(await testDB.getRecentResults());
      case 'suites':
        return NextResponse.json(await testDB.getTestSuites());
      case 'performance':
        return NextResponse.json(await testDB.getPerformanceTrends());
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
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

  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();

  try {
    switch (endpoint) {
      case 'start':
        // Start test execution
        const { smartRunner } = await import('../../../../scripts/smart-runner');
        smartRunner.runTests().catch(console.error);
        return NextResponse.json({ status: 'started' });

      case 'stop':
        // Stop test execution
        const { smartRunner: runner } = await import('../../../../scripts/smart-runner');
        runner.stop();
        return NextResponse.json({ status: 'stopped' });

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
