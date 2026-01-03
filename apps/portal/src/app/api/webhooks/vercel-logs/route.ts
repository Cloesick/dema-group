import { NextResponse } from 'next/server';
import { deploymentTracker } from '@/lib/deployment-tracker';

export async function POST(request: Request) {
  try {
    const buildLog = await request.json();
    
    // Extract deployment ID from Vercel
    const deploymentId = buildLog.deploymentId || `deploy_${Date.now()}`;
    
    // Start tracking this deployment if we haven't seen it before
    if (buildLog.type === 'build-start') {
      await deploymentTracker.trackBuildStart(deploymentId);
    } else {
      // Process all other log types
      await deploymentTracker.processVercelLog(buildLog);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process Vercel log:', error);
    return NextResponse.json({ error: 'Failed to process log' }, { status: 500 });
  }
}
