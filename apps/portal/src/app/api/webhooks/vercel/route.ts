import { NextResponse } from 'next/server';
import type { VercelDeployment, VercelDeploymentPayload, BuildLogEvent } from '@/types/vercel';
import { fetchBuildLogs } from '@/lib/vercel';

function getDeploymentEmoji(state: string): string {
  switch (state) {
    case 'READY':
      return '✅';
    case 'ERROR':
      return '❌';
    case 'BUILDING':
      return '🏗️';
    case 'CANCELED':
      return '⚠️';
    default:
      return '🔄';
  }
}

function formatDeploymentDetails(deploymentData: VercelDeploymentPayload): string {
  return [
    `- **URL:** ${deploymentData.url}`,
    `- **Branch:** ${deploymentData.meta?.branch || 'unknown'}`,
    `- **Commit:** ${deploymentData.meta?.commit || 'unknown'}`
  ].join('\n');
}

function formatBuildInfo(deploymentData: VercelDeploymentPayload): string {
  const duration = Math.round((Date.now() - new Date(deploymentData.createdAt).getTime()) / 1000);
  return [
    '## Build Info',
    `- **Created:** ${new Date(deploymentData.createdAt).toLocaleString()}`,
    `- **Duration:** ${duration}s`,
    `- **Region:** ${deploymentData.regions?.[0] || 'unknown'}`
  ].join('\n');
}

function formatErrorSection(deploymentData: VercelDeploymentPayload): string {
  if (deploymentData.state !== 'ERROR') return '';
  return [
    '',
    '## Error',
    '```',
    deploymentData.errorMessage || 'No error message provided',
    '```'
  ].join('\n');
}

function formatBuildLogs(buildLogs: string): string {
  return [
    '## Build Logs',
    '```',
    buildLogs,
    '```'
  ].join('\n');
}

function formatDeploymentMessage(emoji: string, deploymentData: VercelDeploymentPayload, buildLogs: string): string {
  const sections = [
    `${emoji} Deployment ${deploymentData.state.toLowerCase()}`,
    '',
    `## Status: ${deploymentData.state}`,
    formatDeploymentDetails(deploymentData),
    formatErrorSection(deploymentData),
    '',
    formatBuildInfo(deploymentData),
    '',
    `[View Deployment →](${deploymentData.inspectorUrl})`,
    '',
    formatBuildLogs(buildLogs)
  ];

  return sections.filter(Boolean).join('\n');
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as VercelDeployment;
    const { payload: deploymentData } = payload;
    const emoji = getDeploymentEmoji(deploymentData.state);

    // Fetch build logs if deployment is complete
    let buildLogs = '';
    if (deploymentData.state === 'READY' || deploymentData.state === 'ERROR') {
      try {
        const logs = await fetchBuildLogs(deploymentData.id);
        buildLogs = logs
          .map((log: BuildLogEvent) => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const message = log.message || log.payload?.text || '';
            return `${time}: ${message}`;
          })
          .join('\n');
      } catch (error) {
        console.error('Failed to fetch build logs:', error);
        buildLogs = 'Failed to fetch build logs';
      }
    }

    const message = formatDeploymentMessage(emoji, deploymentData, buildLogs);

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
