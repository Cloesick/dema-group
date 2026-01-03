import '@testing-library/jest-dom';

// Mock environment variables
process.env.GSUITE_CLIENT_EMAIL = 'test@test.com';
process.env.GSUITE_PRIVATE_KEY = 'test-key';
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_ORG = 'test-org';
process.env.SLACK_TOKEN = 'test-token';
