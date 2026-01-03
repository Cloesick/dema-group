import type { BuildError } from '@/types/deployment';

interface BuildLogEntry {
  type: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  suggestion?: string;
}

const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Build Parser] ${message}`, data || '');
  }
}

export function parseBuildLogs(logs: string): BuildLogEntry[] {
  const entries: BuildLogEntry[] = [];
  if (!logs) {
    debugLog('No logs provided');
    return entries;
  }
  debugLog('Parsing build logs:', logs);

  const lines = logs.split('\n');
  let currentEntry: Partial<BuildLogEntry> | null = null;

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
        entries.push(currentEntry as BuildLogEntry);
      }
    }
    
    // Next.js build errors
    else if (line.includes('Failed to compile')) {
      currentEntry = {
        type: 'error',
        message: 'Build compilation failed',
        suggestion: 'Check the error details below'
      };
      entries.push(currentEntry as BuildLogEntry);
    }
    
    // Lockfile errors
    else if (line.includes('ERR_PNPM_OUTDATED_LOCKFILE')) {
      currentEntry = {
        type: 'error',
        message: 'Lockfile is out of date with package.json',
        suggestion: 'Run: git checkout main && pnpm install --no-frozen-lockfile'
      };
      entries.push(currentEntry as BuildLogEntry);
    }
    // Dependency errors
    else if (line.includes('Cannot find module')) {
      const moduleName = line.match(/'([^']+)'/);
      currentEntry = {
        type: 'error',
        message: line,
        suggestion: moduleName ? `pnpm add -D ${moduleName[1]}` : 'Check package.json dependencies'
      };
      entries.push(currentEntry as BuildLogEntry);
    }
    
    // ESLint errors
    else if (line.includes('ESLint:')) {
      const message = line.split('ESLint:')[1]?.trim();
      if (message) {
        currentEntry = {
          type: 'warning',
          message,
          suggestion: 'Run pnpm lint to check all linting errors'
        };
        entries.push(currentEntry as BuildLogEntry);
      }
    }
  }

  return entries;
}

export function formatBuildErrorForWindsurf(error: BuildLogEntry): string {
  if (!error?.message) return '';

  const parts: string[] = [
    `# ${error.type === 'error' ? '❌' : '⚠️'} Build ${error.type.toUpperCase()}\n`,
  ];

  if (error.file) {
    parts.push('## Location\n');
    parts.push(`- File: ${error.file}\n`);
    if (error.line) {
      parts.push(`- Line: ${error.line}${error.column ? `, Column: ${error.column}` : ''}\n`);
    }
    parts.push('');
  }

  parts.push('## Message\n```\n' + error.message + '\n```\n');

  if (error.suggestion) {
    parts.push('## Suggested Fix\n```bash\n' + error.suggestion + '\n```\n');
  }

  if (error.message.includes('Type error')) {
    parts.push(
      '## Common Solutions\n',
      '1. Check type definitions in `src/types`\n',
      '2. Run `pnpm type-check` locally\n',
      '3. Update type imports\n',
      '4. Add type assertions if necessary\n'
    );
  }

  return parts.join('');
}

export async function sendToWindsurf(message: string, metadata?: Record<string, any>): Promise<void> {
  if (!message) return;

  try {
    const response = await fetch('http://localhost:3000/api/windsurf/chat', {
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
  }
}
