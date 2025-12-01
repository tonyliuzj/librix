// src/lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import db from '@/utils/db';
import bcrypt from 'bcryptjs';

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

        const user = db.prepare('SELECT * FROM users WHERE username = ?')
          .get(credentials.username) as { id: number; username: string; password: string } | undefined;

        if (!user) {
          return null;
        }

        // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        const isHashed = user.password.startsWith('$2');

        let isPasswordValid = false;
        if (isHashed) {
          // Compare with bcrypt
          isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        } else {
          // Plain text comparison (for backwards compatibility during migration)
          isPasswordValid = credentials.password === user.password;
        }

        if (isPasswordValid) {
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
