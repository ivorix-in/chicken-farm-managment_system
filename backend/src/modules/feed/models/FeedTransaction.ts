import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type FeedTransactionType = "ISSUE" | "RETURN" | "RESTOCK";

export interface IFeedTransaction {
  id: string;
  _id: string;
  batchId?: string | null;
  feedStockId: string;
  quantityKg: number;
  type: FeedTransactionType;
  issuedBy: string;
  issuedAt: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const FeedTransactionSchema = new Schema<IFeedTransaction>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    batchId: { type: String, default: null, ref: "Batch", index: true },
    feedStockId: { type: String, required: true, ref: "FeedStock", index: true },
    quantityKg: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["ISSUE", "RETURN", "RESTOCK"], required: true, index: true },
    issuedBy: { type: String, required: true, ref: "AdminUser" },
    issuedAt: { type: Date, required: true },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(FeedTransactionSchema);

export const FeedTransaction = model<IFeedTransaction>("FeedTransaction", FeedTransactionSchema);
