import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IDailyVisit {
  id: string;
  _id: string;
  batchId: string;
  supervisorId: string;
  visitDate: Date;
  mortalityToday: number;
  mortalityTotal: number;
  cullsToday: number;
  weakBirdsToday: number;
  ownUseToday: number;
  birdCount: number;
  approxWeightKg: number;
  feedUsedKg: number;
  feedBagsUsed: number;
  remarks?: string | null;
  notifyDoctor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DailyVisitSchema = new Schema<IDailyVisit>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    batchId: { type: String, required: true, ref: "Batch", index: true },
    supervisorId: { type: String, required: true, ref: "AdminUser", index: true },
    visitDate: { type: Date, required: true, index: true },
    mortalityToday: { type: Number, required: true, min: 0 },
    mortalityTotal: { type: Number, required: true, min: 0 },
    cullsToday: { type: Number, required: true, default: 0, min: 0 },
    weakBirdsToday: { type: Number, required: true, default: 0, min: 0 },
    ownUseToday: { type: Number, required: true, default: 0, min: 0 },
    birdCount: { type: Number, required: true, min: 0 },
    approxWeightKg: { type: Number, required: true, min: 0 },
    feedUsedKg: { type: Number, required: true, min: 0 },
    feedBagsUsed: { type: Number, required: true, default: 0, min: 0 },
    remarks: { type: String, default: null },
    notifyDoctor: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

DailyVisitSchema.index({ batchId: 1, visitDate: 1 }, { unique: true });

applyGlobalOptions(DailyVisitSchema);

export const DailyVisit = model<IDailyVisit>("DailyVisit", DailyVisitSchema);
