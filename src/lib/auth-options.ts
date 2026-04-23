import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

function requireSessionSecret(): string {
  const value = process.env.NEXTAUTH_SECRET ?? process.env.ADMIN_SECRET;
  if (!value) {
    throw new Error(
      'NEXTAUTH_SECRET (or ADMIN_SECRET as fallback) env var is not set. JWT sessions cannot be signed.',
    );
  }
  return value;
}
const NEXTAUTH_SECRET = requireSessionSecret();

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email / jelszó',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Jelszó', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? '';
        if (!email || !password) return null;

        const customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer || !customer.passwordHash) return null;
        if (!verifyPassword(password, customer.passwordHash)) return null;
        if (!customer.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name ?? null,
          image: customer.image ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Credentials sign-in already verified in authorize — no upsert needed.
      if (account?.provider === 'credentials') return true;

      // Admins are allowed and recognised by AdminUser table.
      const admin = await prisma.adminUser.findUnique({
        where: { email: user.email },
      });

      if (!admin) {
        // Non-admin Google users are treated as customers: upsert their profile.
        await prisma.customer.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            emailVerified: true,
          },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: true,
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      // On sign in `user` is present — resolve the role once and persist it in the JWT.
      if (user?.email) {
        const admin = await prisma.adminUser.findUnique({
          where: { email: user.email },
        });
        token.role = admin ? 'admin' : 'customer';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? 'customer';
      }
      return session;
    },
  },
  pages: {
    signIn: '/bejelentkezes',
    error: '/bejelentkezes',
  },
  secret: NEXTAUTH_SECRET,
};
