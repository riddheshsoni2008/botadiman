import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderService {
  serviceType?: mongoose.Types.ObjectId | null;
  name: string;
  quantity: number;
  rate: number;
  rateUnit: "per_event" | "per_day";
  total: number;
}

export interface IAssignedStaff {
  staff: mongoose.Types.ObjectId;
  name: string;
  role: string;
  serviceSlot?: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  eventType: "wedding" | "pre_wedding" | "engagement" | "birthday" | "corporate" | "other";
  customEventType?: string;
  eventDate: Date;
  eventEndDate?: Date;
  venue?: string;
  status: "estimate" | "confirmed" | "in_progress" | "completed" | "cancelled";
  services: IOrderService[];
  assignedStaff: IAssignedStaff[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  advancePayment: number;
  balanceAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderServiceSchema = new Schema<IOrderService>({
  serviceType: { type: Schema.Types.ObjectId, ref: "ServiceType", required: false },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  rateUnit: { type: String, enum: ["per_event", "per_day"], default: "per_event" },
  total: { type: Number, required: true, min: 0 },
});

const AssignedStaffSchema = new Schema<IAssignedStaff>({
  staff: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  serviceSlot: { type: String, default: "" },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    clientEmail: { type: String, default: "", trim: true },
    clientAddress: { type: String, default: "", trim: true },
    eventType: {
      type: String,
      enum: ["wedding", "pre_wedding", "engagement", "birthday", "corporate", "other"],
      required: true,
    },
    customEventType: { type: String, default: "", trim: true },
    eventDate: { type: Date, required: true },
    eventEndDate: { type: Date },
    venue: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["estimate", "confirmed", "in_progress", "completed", "cancelled"],
      default: "estimate",
    },
    services: [OrderServiceSchema],
    assignedStaff: [AssignedStaffSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    advancePayment: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, eventDate: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
