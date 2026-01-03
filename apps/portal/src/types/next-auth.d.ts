import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
  }

  interface Session {
    user: User;
    expires: string;
  }

  interface DefaultUser {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}
