import type { NextAuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

// User account type matching registration form fields
interface UserAccount {
  password: string;
  name: string;        // Full Name
  role: string;
  company?: string;    // Company
  phone?: string;      // Phone Number
}

// User accounts - In production, store in database with bcrypt hashed passwords
const USER_ACCOUNTS: Record<string, UserAccount> = {
  // ============ ADMIN ACCOUNTS ============
  'admin@demashop.be': {
    password: process.env.ADMIN_PASSWORD || 'DemaAdmin2024!',
    name: 'DEMA Administrator',
    role: 'admin',
    company: 'DEMA Shop',
    phone: '+32 9 xxx xx xx',
  },
  'nicolas.cloet@gmail.com': {
    password: process.env.NICOLAS_PASSWORD || 'DemaAdmin2024!',
    name: 'Nicolas Cloet',
    role: 'admin',
    company: 'DEMA Shop',
    phone: '+32 477 xx xx xx',
  },
  'info@demashop.be': {
    password: process.env.INFO_PASSWORD || 'DemaAdmin2024!',
    name: 'DEMA Info',
    role: 'admin',
    company: 'DEMA Shop',
    phone: '+32 9 xxx xx xx',
  },
  
  // ============ SAMPLE USER ACCOUNTS ============
  // Plumber - Sanitair professional
  'plumber@demo.com': {
    password: 'Demo1234!',
    name: 'Jan De Loodgieter',
    role: 'user',
    company: 'Sanitair Pro BVBA',
    phone: '+32 477 11 22 33',
  },
  // Farmer - Agricultural business
  'farmer@demo.com': {
    password: 'Demo1234!',
    name: 'Piet Boerderij',
    role: 'user',
    company: 'Hoeve Boerderij NV',
    phone: '+32 478 22 33 44',
  },
  // Contractor - Construction company
  'contractor@demo.com': {
    password: 'Demo1234!',
    name: 'Marc Aannemer',
    role: 'user',
    company: 'Bouwbedrijf Aannemer',
    phone: '+32 479 33 44 55',
  },
  // Industrial buyer - Factory/manufacturing
  'industrial@demo.com': {
    password: 'Demo1234!',
    name: 'Sophie Industrie',
    role: 'user',
    company: 'Industrie Solutions NV',
    phone: '+32 470 44 55 66',
  },
  // Installer - HVAC/Technical installations
  'installer@demo.com': {
    password: 'Demo1234!',
    name: 'Koen Installateur',
    role: 'user',
    company: 'Technische Installaties BV',
    phone: '+32 471 55 66 77',
  },
  // Gardener - Landscaping/irrigation
  'gardener@demo.com': {
    password: 'Demo1234!',
    name: 'Lisa Tuinier',
    role: 'user',
    company: 'Groene Vingers Tuinen',
    phone: '+32 472 66 77 88',
  },
  // General test user - No company
  'test@demo.com': {
    password: 'Demo1234!',
    name: 'Test User',
    role: 'user',
    phone: '+32 499 00 00 00',
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials provider for email/password login
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const account = USER_ACCOUNTS[email];
        
        // Check if account exists and password matches
        if (account && credentials.password === account.password) {
          return {
            id: email,
            email: email,
            name: account.name,
            role: account.role,
            company: account.company,
            phone: account.phone,
            aliasEmail: email,
          };
        }

        // Fallback: Allow any @demashop.be email with correct env password
        if (email.endsWith('@demashop.be')) {
          const envPassword = process.env.DEMASHOP_PASSWORD || 'DemaAdmin2024!';
          if (credentials.password === envPassword) {
            return {
              id: email,
              email: email,
              name: email.split('@')[0],
              role: 'admin',
              aliasEmail: email,
            };
          }
        }

        return null;
      }
    }),
    
    // Google OAuth; requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login', // Custom login page
  },
  callbacks: {
    // Note: 'authorized' callback removed - not compatible with current Next Auth version
    // Use middleware for route protection instead
    async session({ session, token }) {
      // Propagate user fields to session
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).aliasEmail = token.aliasEmail;
        (session.user as any).company = token.company;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // On initial sign in, copy user fields to token
      if (user) {
        token.role = (user as any).role;
        token.company = (user as any).company;
        token.phone = (user as any).phone;
        token.aliasEmail = (user as any).aliasEmail;
      }
      
      // Fallback: Determine admin role based on email domain
      if (!token.role) {
        const email = (profile as any)?.email || token.email || '';
        const emailLower = String(email).toLowerCase();
        const isDemashopDomain = emailLower.endsWith('@demashop.be');
        const isAliasAdmin = emailLower === 'nicolas.cloet@gmail.com';
        token.aliasEmail = isAliasAdmin ? 'nicolas@demashop.be' : emailLower;
        token.role = (isDemashopDomain || isAliasAdmin) ? 'admin' : 'user';
      }
      return token;
    },
  },
};
