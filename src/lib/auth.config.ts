import type { NextAuthConfig } from "next-auth";

// Sanitize URL environment variables to prevent "Invalid URL" crash in Vercel Edge/Server actions
function sanitizeEnvUrls() {
  const sanitize = (url?: string) => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  if (process.env.AUTH_URL) {
    process.env.AUTH_URL = sanitize(process.env.AUTH_URL);
  }
  if (process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = sanitize(process.env.NEXTAUTH_URL);
  }

  // Automatically adapt to Vercel deployments
  if (process.env.VERCEL) {
    const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    if (
      vercelHost &&
      (!process.env.NEXTAUTH_URL ||
        process.env.NEXTAUTH_URL.includes("localhost") ||
        !process.env.AUTH_URL ||
        process.env.AUTH_URL.includes("localhost"))
    ) {
      const cleanVercelUrl = `https://${vercelHost.replace(/^https?:\/\//, "")}`;
      process.env.AUTH_URL = cleanVercelUrl;
      process.env.NEXTAUTH_URL = cleanVercelUrl;
    }
  }
}

sanitizeEnvUrls();

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "botadi-studio-secret-key-32-chars-minimum",
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.ownerId = (user as any).ownerId;
        token.studioName = (user as any).studioName;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as "admin" | "staff";
        (session.user as any).ownerId = token.ownerId as string | null | undefined;
        (session.user as any).studioName = token.studioName as string | undefined;
      }
      return session;
    },
  },
  providers: [],
};
