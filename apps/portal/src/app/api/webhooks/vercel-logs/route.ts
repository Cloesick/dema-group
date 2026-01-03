import { NextResponse } from 'next/server';
import { deploymentManager } from '@/lib/deployment-manager';
import { parseTypeScriptError } from '@/lib/parse-build-error';

export async function POST(request: Request) {
  const buildLog = await request.json();
  
  // Extract deployment ID from Vercel
  const deploymentId = buildLog.deploymentId || `deploy_${Date.now()}`;
  
  // Start tracking this deployment if we haven't seen it before
  if (buildLog.type === 'build-start') {
    await deploymentManager.startDeployment(deploymentId);
    return NextResponse.json({ success: true });
  }

  // Handle build errors
  if (buildLog.type === 'build-error') {
    const error = parseTypeScriptError(buildLog.text);
    await deploymentManager.handleBuildError(error);
    return NextResponse.json({ success: true });
  }

  // Log build progress
  await deploymentManager.logBuildStep(buildLog.text || 'Build step completed');

  // Handle successful deployment
  if (buildLog.type === 'build-success') {
    await deploymentManager.deploymentSuccess(buildLog.url);
  }

  return NextResponse.json({ success: true });
}
