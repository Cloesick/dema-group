export const createMockUser = () => ({
  id: '123',
  email: 'test@example.com',
  companyId: '456',
  role: 'customer'
});

export const createMockToken = (
  user: ReturnType<typeof createMockUser>,
  options: { expired?: boolean } = {}
) => {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64');

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      iat: now,
      exp: options.expired ? now - 3600 : now + 3600
    })
  ).toString('base64');

  const signature = 'mock_signature';

  return `${header}.${payload}.${signature}`;
};
