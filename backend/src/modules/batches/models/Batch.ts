import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type BatchStatus = "PROGRESS" | "COMPLETED" | "CLOSED";

export interface IChickPurchase {
  supplierId?: string | null;
  pricePerChick: number;
  totalAmount: number;
  purchasedAt: Date;
  vendor?: string | null;
  breed?: string | null;
}

export interface IBatch {
  id: string;
  _id: string;
  batchNo: string;
  farmId: string;
  chickCount: number;
  currentBirdCount: number;
  totalMortality: number;
  totalCulls: number;
  totalWeakBirds: number;
  totalOwnUse: number;
  soldBirds: number;
  totalKgsSold: number;
  placementDate: Date;
  expectedClosureDate?: Date | null;
  status: BatchStatus;
  closedAt?: Date | null;
  notes?: string | null;
  managerRemarks?: string | null;
  createdBy: string;
  chickPurchase?: IChickPurchase | null;
  createdAt: Date;
  updatedAt: Date;
}

const ChickPurchaseSchema = new Schema<IChickPurchase>(
  {
    supplierId: { type: String, default: null },
    pricePerChick: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    purchasedAt: { type: Date, required: true },
    vendor: { type: String, default: null },
    breed: { type: String, default: null },
  },
  { _id: false }
);

const BatchSchema = new Schema<IBatch>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    batchNo: { type: String, required: true, index: true },
    farmId: { type: String, required: true, ref: "Farm", index: true },
    chickCount: { type: Number, required: true, min: 1 },
    currentBirdCount: { type: Number, required: true, min: 0 },
    totalMortality: { type: Number, required: true, default: 0 },
    totalCulls: { type: Number, required: true, default: 0 },
    totalWeakBirds: { type: Number, required: true, default: 0 },
    totalOwnUse: { type: Number, required: true, default: 0 },
    soldBirds: { type: Number, required: true, default: 0 },
    totalKgsSold: { type: Number, required: true, default: 0 },
    placementDate: { type: Date, required: true },
    expectedClosureDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["PROGRESS", "COMPLETED", "CLOSED"],
      required: true,
      default: "PROGRESS",
      index: true,
    },
    closedAt: { type: Date, default: null },
    notes: { type: String, default: null },
    managerRemarks: { type: String, default: null },
    createdBy: { type: String, required: true, ref: "AdminUser" },
    chickPurchase: { type: ChickPurchaseSchema, default: null },
  },
  { timestamps: true }
);

BatchSchema.index({ farmId: 1, status: 1 });

applyGlobalOptions(BatchSchema);

export const Batch = model<IBatch>("Batch", BatchSchema);
