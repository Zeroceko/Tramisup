import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { verifyRecaptchaToken } from "./recaptcha";
import { verifySignupBypassToken } from "./signup-bypass";

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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const hasValidSignupBypass = verifySignupBypassToken(
          credentials.signupBypassToken,
          credentials.email,
        );

        if (!hasValidSignupBypass) {
          const recaptchaResult = await verifyRecaptchaToken({
            token: credentials.captchaToken,
          });

          if (!recaptchaResult.success) {
            if (recaptchaResult.error === "recaptcha_required") {
              throw new Error("recaptcha_required");
            }

            throw new Error("recaptcha_invalid");
          }
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
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
