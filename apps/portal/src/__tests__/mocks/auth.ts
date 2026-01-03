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
  ).toString('base64url');

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      iat: now,
      exp: options.expired ? now - 3600 : now + 3600
    })
  ).toString('base64url');

  const data = `${header}.${payload}`;
  const signature = Buffer.from(
    require('crypto')
      .createHmac('sha256', process.env.JWT_SECRET || 'test_jwt_secret_key_min_32_chars_long_for_testing')
      .update(data)
      .digest()
  ).toString('base64url');

  return `${header}.${payload}.${signature}`;
};
