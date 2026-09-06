"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ServiceType } from "@/models/ServiceType";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

export async function loginUser(formData: { email: string; password: string }): Promise<ActionResult> {
  try {
    const validated = loginSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const email = validated.data.email.toLowerCase().trim();
    const password = validated.data.password;

    // Check account and password in DB first for immediate clear feedback
    await connectDB();
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      return { success: false, error: "No account found with this email address." };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    // Authenticate and issue session cookie via NextAuth
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error: any) {
    // Next.js redirect errors are expected on successful authentication
    if (
      error?.message?.includes("NEXT_REDIRECT") ||
      error?.digest?.startsWith("NEXT_REDIRECT")
    ) {
      return { success: true };
    }

    if (
      error?.name === "CredentialsSignin" ||
      error?.type === "CredentialsSignin" ||
      error?.message?.includes("CredentialsSignin") ||
      error?.cause?.err?.name === "CredentialsSignin"
    ) {
      return { success: false, error: "Invalid email or password." };
    }

    console.error("Login authentication error:", error);
    return { success: false, error: error?.message || "Login failed. Please try again." };
  }
}

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  studioName?: string;
}): Promise<ActionResult> {
  try {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    const existingUser = await User.findOne({ email: validated.data.email.toLowerCase().trim() });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(validated.data.password, 12);

    const user = await User.create({
      name: validated.data.name,
      email: validated.data.email.toLowerCase().trim(),
      passwordHash,
      role: "admin",
      studioName: validated.data.studioName || "Botadi Studio",
    });

    // Seed default service types for the new studio
    const defaultServices = [
      { name: "Camera (Photography)", rate: 15000, rateUnit: "per_event" as const, description: "Professional photography coverage" },
      { name: "Cinematography", rate: 20000, rateUnit: "per_event" as const, description: "Cinematic video coverage" },
      { name: "Videography", rate: 12000, rateUnit: "per_event" as const, description: "Standard video coverage" },
      { name: "Drone", rate: 8000, rateUnit: "per_event" as const, description: "Aerial drone photography and video" },
      { name: "Photo Editing", rate: 5000, rateUnit: "per_event" as const, description: "Professional photo editing and retouching" },
      { name: "Video Editing", rate: 10000, rateUnit: "per_event" as const, description: "Video post-production and editing" },
      { name: "Album", rate: 8000, rateUnit: "per_event" as const, description: "Premium photo album" },
    ];

    await ServiceType.insertMany(
      defaultServices.map((s) => ({ ...s, userId: user._id }))
    );

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function logoutUser(): Promise<ActionResult> {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch {
    return { success: true };
  }
}
