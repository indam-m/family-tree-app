// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: 'select_account' } },
    }),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user?.hashedPassword) return null;
        const ok = await compare(creds.password, user.hashedPassword);
        return ok ? user : null;
      },
    }),
  ],
  callbacks: {
    async signIn({
      account,
      profile,
    }: {
      user: unknown;
      account: import('next-auth').Account | null;
      profile?: import('next-auth').Profile;
    }) {
      // Optional: ensure Google accounts have verified emails
      if (account?.provider === 'google') {
        // Some providers (like Google) include email_verified in the profile
        const verified =
          profile && 'email_verified' in profile
            ? profile.email_verified
            : true;
        return !!verified;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { id: true, role: true, personId: true },
        });
        token.uid = dbUser?.id;
        token.role = dbUser?.role ?? 'user';
        token.personId = dbUser?.personId ?? null;

        // OPTIONAL: sign your own accessToken for your Node backend
        token.accessToken = jwt.sign(
          { uid: token.uid, role: token.role, personId: token.personId },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: '7d' },
        );
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-expect-error: accessToken is not defined on session by default
      session.accessToken = token.accessToken as string | undefined;
      // @ts-expect-error: user.id is not defined on session.user by default
      session.user.id = token.uid;
      // @ts-expect-error: user.role is not defined on session.user by default
      session.user.role = token.role;
      // @ts-expect-error: user.personId is not defined on session.user by default
      session.user.personId = token.personId ?? null;
      // session.accessToken = token.accessToken; // if you enabled it above
      return session;
    },
  },
});
