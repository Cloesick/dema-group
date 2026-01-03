import { deploymentManager } from './deployment-manager';
import { parseTypeScriptError } from './parse-build-error';

export async function handleDeployment() {
  const deploymentId = `deploy_${Date.now()}`;
  await deploymentManager.startDeployment(deploymentId);

  try {
    // Log each major step
    await deploymentManager.logBuildStep('Installing dependencies...');
    // Run pnpm install
    
    await deploymentManager.logBuildStep('Type checking...');
    // Run type check
    
    await deploymentManager.logBuildStep('Building application...');
    // Run build
    
    await deploymentManager.logBuildStep('Running tests...');
    // Run tests
    
    await deploymentManager.logBuildStep('Deploying to Vercel...');
    // Deploy to Vercel
    
    await deploymentManager.deploymentSuccess('https://dema-group-portal.vercel.app');
  } catch (error) {
    if (error instanceof Error) {
      // Parse the error and send it to Windsurf
      const buildError = parseTypeScriptError(error.message);
      await deploymentManager.handleBuildError(buildError);
    }
  }
}

// Handle current TypeScript error
export async function handleCurrentError() {
  const deploymentId = `fix_${Date.now()}`;
  await deploymentManager.startDeployment(deploymentId);

  const errorText = `
Failed to compile.
./cypress/support/generators/test-data.ts:1:23
Type error: Cannot find module '@faker-js/faker' or its corresponding type declarations.
> 1 | import { faker } from '@faker-js/faker';
    |                       ^
  2 |
  3 | export interface User {
  4 |   id?: string;
`;

  const buildError = parseTypeScriptError(errorText);
  await deploymentManager.handleBuildError(buildError);
}
