interface ErrorPattern {
  pattern: RegExp;
  type: 'typescript' | 'build' | 'runtime' | 'dependency';
  suggestion: string;
  example?: string;
  priority: 'high' | 'medium' | 'low';
  autoFix?: string;
}

export const errorPatterns: ErrorPattern[] = [
  // TypeScript Errors
  {
    pattern: /Cannot find module '(.+?)'/,
    type: 'dependency',
    priority: 'high',
    suggestion: 'Install the missing package',
    autoFix: (match: RegExpMatchArray) => `pnpm add -D ${match[1]}`
  },
  {
    pattern: /Property '(.+?)' does not exist on type '(.+?)'/,
    type: 'typescript',
    priority: 'high',
    suggestion: 'Add missing property to type definition',
    example: `interface User {
  name: string;
  // Add the missing property
  role: string;
}`
  },
  {
    pattern: /Type '(.+?)' is not assignable to type '(.+?)'/,
    type: 'typescript',
    priority: 'medium',
    suggestion: 'Ensure types match or add type assertion',
    example: `// Option 1: Fix the type
const value: ExpectedType = actualValue;

// Option 2: Type assertion (use carefully)
const value = actualValue as ExpectedType;`
  },
  {
    pattern: /Parameter '(.+?)' implicitly has an 'any' type/,
    type: 'typescript',
    priority: 'medium',
    suggestion: 'Add explicit type annotation',
    example: `// Before
function process(data: any) {
  return data;
}

// After
function process(data: DataType) {
  return data;
}\`
  },
  
  // Next.js Build Errors
  {
    pattern: /Invalid route export pattern/,
    type: 'build',
    priority: 'high',
    suggestion: 'Check route export naming',
    example: \`// Valid exports
export { GET, POST }  // ✅
export default function   // ✅

// Invalid exports
export const handler  // ❌
export { default as handler }  // ❌\`
  },
  {
    pattern: /The edge runtime does not support Node.js '(.+?)' module/,
    type: 'build',
    priority: 'high',
    suggestion: 'Use edge-compatible alternatives',
    example: \`// Instead of 'fs'
import { promises as fs } from 'fs'  // ❌

// Use Web APIs
const data = await fetch('...')  // ✅\`
  },

  // Runtime Errors
  {
    pattern: /ReferenceError: (.+?) is not defined/,
    type: 'runtime',
    priority: 'high',
    suggestion: 'Check variable scope and imports',
    example: \`// Make sure the variable is imported or defined
import { requiredFunction } from './module';
// or
const requiredVariable = 'value';\`
  },
  
  // Dependency Errors
  {
    pattern: /ERESOLVE unable to resolve dependency tree/,
    type: 'dependency',
    priority: 'high',
    suggestion: 'Resolve peer dependency conflicts',
    autoFix: 'pnpm install --no-frozen-lockfile'
  },
  
  // Performance Warnings
  {
    pattern: /Large page data/,
    type: 'build',
    priority: 'medium',
    suggestion: 'Optimize page data size',
    example: \`// Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'))

// Or use pagination/infinite loading
const { data } = useSWR('/api/items?page=' + page)\`
  }
];
