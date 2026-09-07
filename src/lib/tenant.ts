import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function getTenantId(): Promise<mongoose.Types.ObjectId | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const role = (session.user as any).role;
  const ownerId = (session.user as any).ownerId;

  // Fast path: for admins/owners, tenantId is their own userId directly (no DB roundtrip needed!)
  if (role === "admin" || (!role && !ownerId)) {
    return new mongoose.Types.ObjectId(session.user.id);
  }

  // Fast path: for staff with ownerId already in session token
  if (role === "staff" && ownerId) {
    return new mongoose.Types.ObjectId(ownerId);
  }

  // Fallback for older sessions or edge cases:
  const userObjId = new mongoose.Types.ObjectId(session.user.id);
  await connectDB();

  const user = await User.findById(userObjId).select("ownerId role").lean();

  if (user && user.role === "staff") {
    if (user.ownerId) {
      const ownerExists = await User.exists({ _id: user.ownerId });
      if (ownerExists) {
        return user.ownerId as mongoose.Types.ObjectId;
      }
    }
    const firstAdmin = await User.findOne({ role: "admin" })
      .sort({ createdAt: 1 })
      .select("_id")
      .lean();
    if (firstAdmin) {
      return firstAdmin._id as mongoose.Types.ObjectId;
    }
  }

  return userObjId;
}
