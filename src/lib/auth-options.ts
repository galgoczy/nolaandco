import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

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
          },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
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
  secret: process.env.NEXTAUTH_SECRET || process.env.ADMIN_SECRET || 'nola-admin-secret-change-me',
};
