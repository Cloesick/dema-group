import { parseTypeScriptError } from './parse-build-error';
import { reportBuildError } from './deployment-helper';

const currentError = `
Failed to compile.
./cypress/support/generators/test-data.ts:1:23
Type error: Cannot find module '@faker-js/faker' or its corresponding type declarations.
> 1 | import { faker } from '@faker-js/faker';
    |                       ^
  2 |
  3 | export interface User {
  4 |   id?: string;
`;

// Parse and report the error
const error = parseTypeScriptError(currentError);
await reportBuildError(error);
