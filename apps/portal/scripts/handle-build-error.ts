import { parseBuildLogs, sendToWindsurf } from '../src/lib/parse-build-logs';

// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1';

// Get build output from stdin
let buildOutput = '';
let errorCount = 0;
const startTime = Date.now();
process.stdin.on('data', (data) => {
  buildOutput += data;
});

process.stdin.on('end', async () => {
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

  // Send final status if in Vercel
  if (isVercel) {
    const status = errorCount > 0 ? '❌ Failed' : '✅ Success';
    await sendToWindsurf(`# Build ${status}

## Summary
- Total Errors: ${errorCount}
- Duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s
`);
  }

  // Exit with error code to indicate build failure
  process.exit(errorCount > 0 ? 1 : 0);
});
