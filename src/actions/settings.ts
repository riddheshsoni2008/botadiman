"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getTenantId } from "@/lib/tenant";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

export async function getStudioSettings(): Promise<ActionResult<any>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const user = await User.findById(tenantId)
      .select("studioName phone address email name")
      .lean();

    if (!user) return { success: false, error: "User not found" };

    return {
      success: true,
      data: {
        studioName: user.studioName || "Botadi Studio",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email,
        ownerName: user.name,
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function updateStudioSettings(formData: {
  studioName: string;
  phone: string;
  address: string;
}): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    await User.findByIdAndUpdate(tenantId, {
      studioName: formData.studioName,
      phone: formData.phone,
      address: formData.address,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
