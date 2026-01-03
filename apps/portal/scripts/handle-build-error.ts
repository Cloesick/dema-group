import { parseBuildLogs, sendToWindsurf } from '../src/lib/parse-build-logs';

// Get build output from stdin
let buildOutput = '';
process.stdin.on('data', (data) => {
  buildOutput += data;
});

process.stdin.on('end', async () => {
  console.log('Parsing build errors...');
  
  const errors = parseBuildLogs(buildOutput);
  
  if (errors.length === 0) {
    console.log('No build errors found');
    process.exit(0);
  }

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

  // Exit with error code to indicate build failure
  process.exit(1);
});
