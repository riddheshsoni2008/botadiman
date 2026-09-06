import mongoose, { Schema, Document, Model } from "mongoose";

export interface IServiceType extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  rate: number;
  rateUnit: "per_event" | "per_day";
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

const ServiceTypeSchema = new Schema<IServiceType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    rateUnit: { type: String, enum: ["per_event", "per_day"], default: "per_event" },
    description: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ServiceTypeSchema.index({ userId: 1, name: 1 });

export const ServiceType: Model<IServiceType> =
  mongoose.models.ServiceType || mongoose.model<IServiceType>("ServiceType", ServiceTypeSchema);
