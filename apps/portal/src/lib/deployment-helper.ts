import { BuildError } from '@/types/deployment';

export async function reportBuildError(error: BuildError) {
  const message = formatBuildError(error);
  
  try {
    await fetch('http://localhost:3000/api/windsurf/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        source: 'build',
        status: 'error',
        error: {
          type: error.type,
          file: error.file,
          line: error.line,
          column: error.column,
          message: error.message
        }
      })
    });
  } catch (e) {
    console.error('Failed to send build error to Windsurf:', e);
  }
}

function formatBuildError(error: BuildError): string {
  const lines = [
    `# ❌ Build Error: ${error.type}`,
    '',
    '## Location',
    `- **File:** ${error.file}`,
    `- **Line:** ${error.line}`,
    `- **Column:** ${error.column}`,
    '',
    '## Error Message',
    '```',
    error.message,
    '```'
  ];

  if (error.suggestion) {
    lines.push(
      '',
      '## Suggested Fix',
      '```typescript',
      error.suggestion,
      '```'
    );
  }

  if (error.context) {
    lines.push(
      '',
      '## Code Context',
      '```typescript',
      error.context,
      '```'
    );
  }

  return lines.join('\\n');
}
