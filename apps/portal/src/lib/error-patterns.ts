interface ErrorPattern {
  id: string;
  pattern: RegExp;
  type: 'typescript' | 'build' | 'runtime' | 'dependency' | 'performance' | 'security';
  suggestion: string;
  example?: string;
  priority: 'high' | 'medium' | 'low';
  autoFix?: string | ((match: RegExpMatchArray) => string);
  relatedPatterns?: string[];
  documentation?: string;
}

export const errorPatterns: ErrorPattern[] = [
  // Security Errors
  {
    id: 'SEC001',
    pattern: /Detected unescaped content in innerHTML/,
    type: 'security',
    priority: 'high',
    suggestion: 'Use safe content rendering methods',
    example: `// Unsafe
div.innerHTML = userContent;  // ❌

// Safe
import DOMPurify from 'dompurify';
div.innerHTML = DOMPurify.sanitize(userContent);  // ✅

// Or better
div.textContent = userContent;  // ✅`,
    documentation: 'https://owasp.org/www-community/attacks/xss/'
  },
  {
    id: 'SEC002',
    pattern: /Detected hardcoded secret/,
    type: 'security',
    priority: 'high',
    suggestion: 'Use environment variables for secrets',
    example: `// Unsafe
const apiKey = '1234567890';  // ❌

// Safe
const apiKey = process.env.API_KEY;  // ✅`,
    documentation: 'https://nextjs.org/docs/basic-features/environment-variables'
  },

  // Performance Errors
  {
    id: 'PERF001',
    pattern: /Component .+ re-rendered .+ times/,
    type: 'performance',
    priority: 'medium',
    suggestion: 'Optimize component rendering',
    example: `// Add memoization
const MemoizedComponent = React.memo(Component);

// Or use useMemo/useCallback
const value = useMemo(() => computeValue(), [dep]);`,
    relatedPatterns: ['PERF002']
  },
  {
    id: 'PERF002',
    pattern: /Bundle size exceeds recommended limit/,
    type: 'performance',
    priority: 'high',
    suggestion: 'Optimize bundle size',
    example: `// Use dynamic imports
const Component = dynamic(() => import('./Component'));

// Use bundle analyzer
// pnpm add -D @next/bundle-analyzer`,
    relatedPatterns: ['PERF001']
  },

  // TypeScript Errors
  {
    id: 'TS001',
    pattern: /Cannot find module '(.+?)'/,
    type: 'dependency',
    priority: 'high',
    suggestion: 'Install the missing package',
    autoFix: (match: RegExpMatchArray) => `pnpm add -D ${match[1]}`
  },
  {
    id: 'TS002',
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
    id: 'TS003',
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
    id: 'TS004',
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
}`
  },

  // Next.js Build Errors
  {
    id: 'NJ001',
    pattern: /Invalid route export pattern/,
    type: 'build',
    priority: 'high',
    suggestion: 'Check route export naming',
    example: `// Valid exports
export { GET, POST }  // 
export default function   // 

// Invalid exports
export const handler  // 
export { default as handler }  // `
  },
  {
    id: 'NJ002',
    pattern: /The edge runtime does not support Node.js '(.+?)' module/,
    type: 'build',
    priority: 'high',
    suggestion: 'Use edge-compatible alternatives',
    example: `// Instead of 'fs'
import { promises as fs } from 'fs'  // 

// Use Web APIs
const data = await fetch('...')  // `
  },

  // Runtime Errors
  {
    id: 'RT001',
    pattern: /ReferenceError: (.+?) is not defined/,
    type: 'runtime',
    priority: 'high',
    suggestion: 'Check variable scope and imports',
    example: `// Make sure the variable is imported or defined
import { requiredFunction } from './module';
// or
const requiredVariable = 'value';`
  },

  // Dependency Errors
  {
    id: 'DEP001',
    pattern: /ERESOLVE unable to resolve dependency tree/,
    type: 'dependency',
    priority: 'high',
    suggestion: 'Resolve peer dependency conflicts',
    autoFix: 'pnpm install --no-frozen-lockfile'
  },

  // Performance Warnings
  {
    id: 'PERF003',
    pattern: /Large page data/,
    type: 'build',
    priority: 'medium',
    suggestion: 'Optimize page data size',
    example: `// Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'))

// Or use pagination/infinite loading
const { data } = useSWR('/api/items?page=' + page)`
  }
];
