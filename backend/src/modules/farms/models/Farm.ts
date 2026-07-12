import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type FarmStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface IFarm {
  id: string;
  _id: string;
  name: string;
  farmerId: string;
  supervisorId?: string | null;
  areaId?: string | null;
  address: string;
  capacity: number;
  currentBatchId?: string | null;
  status: FarmStatus;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, ref: "Farmer", index: true },
    supervisorId: { type: String, default: null, ref: "AdminUser", index: true },
    areaId: { type: String, default: null, ref: "Area", index: true },
    address: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    currentBatchId: { type: String, default: null, ref: "Batch" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PENDING"],
      required: true,
      default: "PENDING",
      index: true,
    },
    isActive: { type: Boolean, required: true, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(FarmSchema);

export const Farm = model<IFarm>("Farm", FarmSchema);
