import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type FeedType = "STARTER" | "GROWER" | "FINISHER" | "PRE_STARTER";

export interface IFeedStock {
  id: string;
  _id: string;
  feedType: FeedType;
  quantityKg: number;
  unitCostPerKg: number;
  lowStockThresholdKg: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedStockSchema = new Schema<IFeedStock>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    feedType: { type: String, enum: ["STARTER", "GROWER", "FINISHER", "PRE_STARTER"], required: true, unique: true, index: true },
    quantityKg: { type: Number, required: true, default: 0, min: 0 },
    unitCostPerKg: { type: Number, required: true, default: 0, min: 0 },
    lowStockThresholdKg: { type: Number, required: true, default: 1000 },
  },
  { timestamps: true }
);

applyGlobalOptions(FeedStockSchema);

export const FeedStock = model<IFeedStock>("FeedStock", FeedStockSchema);
