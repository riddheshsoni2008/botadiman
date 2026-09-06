import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaff extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  role: "photographer" | "cinematographer" | "videographer" | "drone_operator" | "editor" | "assistant" | "other";
  specialization?: string;
  dailyRate?: number;
  isActive: boolean;
  createdAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    role: {
      type: String,
      enum: ["photographer", "cinematographer", "videographer", "drone_operator", "editor", "assistant", "other"],
      required: true,
    },
    specialization: { type: String, default: "", trim: true },
    dailyRate: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

StaffSchema.index({ userId: 1, name: 1 });

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
