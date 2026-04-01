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
      const admin = await prisma.adminUser.findUnique({
        where: { email: user.email },
      });
      return !!admin;
    },
    async session({ session }) {
      if (session.user?.email) {
        const admin = await prisma.adminUser.findUnique({
          where: { email: session.user.email },
        });
        if (!admin) {
          return { ...session, user: undefined } as typeof session;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/bejelentkezes',
    error: '/admin/bejelentkezes',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.ADMIN_SECRET || 'nola-admin-secret-change-me',
};
