import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpenseItem {
  _id: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  note?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalAmount: number;
  items: IExpenseItem[];
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseItemSchema = new Schema<IExpenseItem>(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "", trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    totalAmount: { type: Number, required: true, default: 0, min: 0 },
    items: { type: [ExpenseItemSchema], default: [] },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.index({ userId: 1, date: 1 });

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
