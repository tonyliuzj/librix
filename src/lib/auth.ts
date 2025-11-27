// src/lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import db from '@/utils/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
          .get(credentials.username, credentials.password) as { id: number; username: string } | undefined;

        if (user) {
          return {
            id: user.id.toString(),
            name: user.username,
            email: null,
            image: null,
            role: 'admin',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.role = token.role as string;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
