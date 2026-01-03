import { BuildError } from '@/types/deployment';

export function parseTypeScriptError(errorText: string): BuildError {
  // Example error format:
  // Type error: Cannot find module '@faker-js/faker' or its corresponding type declarations.
  // > 1 | import { faker } from '@faker-js/faker';
  //     |                       ^
  //   2 |
  //   3 | export interface User {
  //   4 |   id?: string;

  const lines = errorText.split('\\n');
  const fileMatch = lines[0].match(/\.\/(.*?):/);
  const lineMatch = lines[0].match(/:(\d+):/);
  const columnMatch = lines[0].match(/:(\d+)$/);
  
  const error: BuildError = {
    type: 'typescript',
    file: fileMatch ? fileMatch[1] : 'unknown',
    line: lineMatch ? parseInt(lineMatch[1], 10) : 0,
    column: columnMatch ? parseInt(columnMatch[1], 10) : 0,
    message: lines[0].split(': ')[1] || lines[0],
    context: lines.slice(1).join('\\n')
  };

  // Add suggestion based on error type
  if (error.message.includes('Cannot find module')) {
    const moduleName = error.message.match(/'([^']+)'/)?.[1];
    if (moduleName) {
      error.suggestion = `pnpm add -D ${moduleName}`;
    }
  }

  return error;
}
