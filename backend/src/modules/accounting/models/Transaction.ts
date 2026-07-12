import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionCategory =
  | "FEED_PURCHASE"
  | "CHICK_PURCHASE"
  | "MEDICINE_PURCHASE"
  | "SALARY"
  | "MAINTENANCE"
  | "TRANSPORT"
  | "BIRD_SALES"
  | "MANURE_SALES"
  | "OTHER";

export interface ITransaction {
  id: string;
  _id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: Date;
  referenceId?: string | null;
  description: string;
  batchId?: string | null;
  farmId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    type: { type: String, required: true, enum: ["INCOME", "EXPENSE"], index: true },
    category: {
      type: String,
      required: true,
      enum: [
        "FEED_PURCHASE",
        "CHICK_PURCHASE",
        "MEDICINE_PURCHASE",
        "SALARY",
        "MAINTENANCE",
        "TRANSPORT",
        "BIRD_SALES",
        "MANURE_SALES",
        "OTHER",
      ],
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now, index: true },
    referenceId: { type: String, default: null },
    description: { type: String, required: true },
    batchId: { type: String, default: null, index: true },
    farmId: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

applyGlobalOptions(TransactionSchema);

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
