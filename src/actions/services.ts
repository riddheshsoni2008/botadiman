"use server";

import { connectDB } from "@/lib/db";
import { ServiceType } from "@/models/ServiceType";
import { getTenantId } from "@/lib/tenant";
import { serviceTypeSchema } from "@/lib/validators/service";

type ActionResult<T = null> = { success: true; data?: T } | { success: false; error: string };

export async function getServiceTypes(): Promise<ActionResult<any[]>> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    const services = await ServiceType.find({ userId: tenantId })
      .sort({ createdAt: -1 })
      .lean();

    const serialized = services.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      rate: s.rate,
      rateUnit: s.rateUnit,
      description: s.description || "",
      isActive: s.isActive,
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error fetching service types:", error);
    return { success: false, error: "Failed to fetch service types" };
  }
}

export async function createServiceType(formData: any): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const validated = serviceTypeSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    await ServiceType.create({
      userId: tenantId,
      ...validated.data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating service type:", error);
    return { success: false, error: "Failed to create service type" };
  }
}

export async function updateServiceType(id: string, formData: any): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const validated = serviceTypeSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await connectDB();

    await ServiceType.findOneAndUpdate(
      { _id: id, userId: tenantId },
      validated.data
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating service type:", error);
    return { success: false, error: "Failed to update service type" };
  }
}

export async function deleteServiceType(id: string): Promise<ActionResult> {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await connectDB();

    await ServiceType.findOneAndDelete({ _id: id, userId: tenantId });

    return { success: true };
  } catch (error) {
    console.error("Error deleting service type:", error);
    return { success: false, error: "Failed to delete service type" };
  }
}
