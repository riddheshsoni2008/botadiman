import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validators/auth";
import { authConfig } from "@/lib/auth.config";

// Ensure environment URLs are sanitized before initializing NextAuth
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "botadi-studio-secret-key-32-chars-minimum",
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        await connectDB();

        const user = await User.findOne({
          email: email.toLowerCase().trim(),
        }).select("+passwordHash");

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          ownerId: user.ownerId ? user.ownerId.toString() : null,
          studioName: user.studioName || "Botadi Studio",
        };
      },
    }),
  ],
});
