"use strict";

const isVercel = process.env.VERCEL === '1';
const startTime = Date.now();
let buildOutput = '';
let errorCount = 0;

// Simple fetch polyfill
const fetch = globalThis.fetch || require('node-fetch');

// Simple error pattern matching
function parseBuildLogs(logs) {
  const entries = [];
  if (!logs) return entries;

  const lines = logs.split('\n');
  let currentEntry = null;

  for (const line of lines) {
    // TypeScript errors
    if (line.includes('Type error:')) {
      currentEntry = {
        type: 'error',
        message: line.split('Type error:')[1]?.trim() || line
      };
      
      // Look for file location in previous line
      const prevLine = lines[lines.indexOf(line) - 1];
      if (prevLine?.includes('.ts:')) {
        const [file, lineCol] = prevLine.split('.ts:');
        const [lineNum, col] = (lineCol || '').split(':').map(Number);
        if (file) {
          currentEntry.file = `${file}.ts`;
          currentEntry.line = lineNum;
          currentEntry.column = col;
        }
      }
      
      if (currentEntry.message) {
        entries.push(currentEntry);
      }
    }
    
    // Next.js build errors
    else if (line.includes('Failed to compile')) {
      currentEntry = {
        type: 'error',
        message: 'Build compilation failed',
        suggestion: 'Check the error details below'
      };
      entries.push(currentEntry);
    }
    
    // Dependency errors
    else if (line.includes('Cannot find module')) {
      const moduleName = line.match(/'([^']+)'/);
      currentEntry = {
        type: 'error',
        message: line,
        suggestion: moduleName ? `pnpm add -D ${moduleName[1]}` : 'Check package.json dependencies'
      };
      entries.push(currentEntry);
    }
  }

  return entries;
}

async function sendToWindsurf(message, metadata = {}) {
  if (!message) return;

  // Determine the API endpoint based on environment
  const baseUrl = process.env.VERCEL_ENV === 'production'
    ? 'https://dema-group-portal.vercel.app'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

  try {
    console.log(`Sending to Windsurf at ${baseUrl}/api/windsurf/chat`);
    const response = await fetch(`${baseUrl}/api/windsurf/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        source: 'build',
        type: 'error',
        metadata: {
          timestamp: new Date().toISOString(),
          environment: process.env.VERCEL_ENV || 'unknown',
          buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
          ...metadata
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send to Windsurf: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send to Windsurf:', error);
    // Log additional context for debugging
    console.log('Environment:', {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV
    });
  }
}

// Collect build output
process.stdin.on('data', (data) => {
  buildOutput += data.toString();
});

process.stdin.on('end', async () => {
  try {
    console.log('Processing build output...');
  // In Vercel, we want to parse the output differently
  if (isVercel) {
    // Extract timestamp and deployment ID
    const deploymentId = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
    const timestamp = new Date().toISOString();

    await sendToWindsurf(`# 🏗️ Build Started

## Details
- Deployment: ${deploymentId}
- Time: ${timestamp}
- Environment: ${process.env.VERCEL_ENV || 'unknown'}
`);
  }

  console.log('Parsing build errors...');
  
  const errors = parseBuildLogs(buildOutput);
  
  if (errors.length === 0) {
    console.log('No build errors found');
    process.exit(0);
  }

  errorCount = errors.length;
  console.log(`Found ${errors.length} build errors`);

  for (const error of errors) {
    const formattedError = `# 🔍 Build Error Analysis

## Error Details
- Type: ${error.type}
${error.file ? `- File: ${error.file}` : ''}
${error.line ? `- Line: ${error.line}${error.column ? `, Column: ${error.column}` : ''}` : ''}

## Message
\`\`\`
${error.message}
\`\`\`

${error.suggestion ? `## Suggested Fix\n\`\`\`bash\n${error.suggestion}\n\`\`\`\n` : ''}

## Next Steps
1. Review the error message carefully
2. Check the file location
3. Apply the suggested fix if available
4. Run \`pnpm type-check\` locally to verify

Need help? Tag me in your response!`;

    await sendToWindsurf(formattedError, {
      errorType: error.type,
      file: error.file,
      line: error.line,
      column: error.column
    });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Build completed in ${duration}s with ${errorCount} errors`);
  const status = errorCount > 0 ? '❌ Failed' : '✅ Success';
  
  if (isVercel) {
    await sendToWindsurf(`# Build ${status}

## Summary
- Total Errors: ${errorCount}
- Duration: ${duration}s
- Environment: ${process.env.VERCEL_ENV || 'unknown'}
- Deployment: ${process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'}
`);
  }

  // Exit with error code to indicate build failure
  process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error processing build output:', error);
    process.exit(1);
  }
});
