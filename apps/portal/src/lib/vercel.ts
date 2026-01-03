const VERCEL_API_URL = 'https://api.vercel.com';

export async function fetchBuildLogs(deploymentId: string) {
  const response = await fetch(
    `${VERCEL_API_URL}/v6/deployments/${deploymentId}/events?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch build logs: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Filter for build-related events and format them
  const buildLogs = data.events
    .filter((event: any) => event.type === 'build-log' || event.type === 'command')
    .map((event: any) => ({
      timestamp: new Date(event.createdAt).toISOString(),
      type: event.type,
      payload: event.payload,
      message: event.message || event.payload?.text || '',
    }));

  return buildLogs;
}
