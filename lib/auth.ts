import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { verifySignupBypassToken } from "./signup-bypass";
import { verifyVerificationAutoLoginToken } from "./verification-autologin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "reCAPTCHA", type: "text" },
        signupBypassToken: { label: "Signup bypass", type: "text" },
        verificationLoginToken: { label: "Verification auto-login", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Invalid credentials");
        }

        const hasPasswordLogin = Boolean(credentials.email && credentials.password);
        const hasVerificationAutoLogin = Boolean(
          credentials.email && credentials.verificationLoginToken,
        );

        if (!hasPasswordLogin && !hasVerificationAutoLogin) {
          throw new Error("Invalid credentials");
        }

        const email = String(credentials.email).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            preferredLocale: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        if (hasVerificationAutoLogin) {
          if (!user.emailVerified) {
            throw new Error("Invalid credentials");
          }

          const tokenValid = verifyVerificationAutoLoginToken(
            credentials.verificationLoginToken,
            user.email,
            user.id,
          );

          if (!tokenValid) {
            throw new Error("invalid_verification_login");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            preferredLocale: user.preferredLocale,
          };
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Block login if email not yet verified — unless this is the immediate
        // post-signup auto-login (signupBypassToken valid for 5 min)
        if (!user.emailVerified) {
          const bypassValid = verifySignupBypassToken(
            credentials.signupBypassToken,
            email,
          );
          if (!bypassValid) {
            throw new Error("email_not_verified");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          preferredLocale: user.preferredLocale,
        };
      }
    })
  ],
  pages: {
    signIn: '/tr/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return Boolean(profile?.email);
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        const dbUser =
          existingUser ||
          (await prisma.user.create({
            data: {
              email,
              name:
                typeof profile.name === "string" && profile.name.trim().length > 0
                  ? profile.name
                  : email.split("@")[0],
              passwordHash: await bcrypt.hash(randomUUID(), 10),
            },
          }));

        if (!dbUser.name && typeof profile.name === "string" && profile.name.trim().length > 0) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { name: profile.name },
          });
          token.name = profile.name;
        }

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.preferredLocale = dbUser.preferredLocale;
      }

      if (user) {
        token.id = user.id;
        token.preferredLocale = (user as { preferredLocale?: string }).preferredLocale;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; preferredLocale?: string }).id = token.id as string;
        (session.user as { id: string; preferredLocale?: string }).preferredLocale =
          token.preferredLocale as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
