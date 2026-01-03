import { NextResponse } from 'next/server';
import type { VercelDeployment } from '@/types/vercel';

export async function POST(request: Request) {
  try {
    const payload = await request.json() as VercelDeployment;
    const { type, payload: deploymentData } = payload;

    // Format message based on deployment status
    let emoji = '🔄';
    switch (deploymentData.state) {
      case 'READY':
        emoji = '✅';
        break;
      case 'ERROR':
        emoji = '❌';
        break;
      case 'BUILDING':
        emoji = '🏗️';
        break;
      case 'CANCELED':
        emoji = '⚠️';
        break;
    }

    const message = `# ${emoji} Vercel Deployment Update

## Status: ${deploymentData.state}
- **URL:** ${deploymentData.url}
- **Branch:** ${deploymentData.meta?.branch || 'unknown'}
- **Commit:** ${deploymentData.meta?.commit || 'unknown'}
${deploymentData.state === 'ERROR' ? `\n## Error\n\`\`\`\n${deploymentData.errorMessage}\n\`\`\`` : ''}

## Build Info
- **Created:** ${new Date(deploymentData.createdAt).toLocaleString()}
- **Duration:** ${Math.round((Date.now() - new Date(deploymentData.createdAt).getTime()) / 1000)}s
- **Region:** ${deploymentData.regions?.[0] || 'unknown'}

[View Deployment →](${deploymentData.inspectorUrl})`;

    // Send to Windsurf chat
    await fetch('http://localhost:3000/api/windsurf/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        source: 'vercel',
        status: deploymentData.state === 'READY' ? 'success' : 
                deploymentData.state === 'ERROR' ? 'failure' : 'info',
        deployment: {
          id: deploymentData.id,
          url: deploymentData.url,
          status: deploymentData.state,
          createdAt: deploymentData.createdAt,
          meta: deploymentData.meta
        }
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vercel webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
