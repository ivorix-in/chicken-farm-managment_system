import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type MedicineUnit = "ML" | "TABLET" | "KG" | "SACHET" | "VIAL";

export interface IMedicine {
  id: string;
  _id: string;
  name: string;
  manufacturer?: string | null;
  batchNo: string;
  expiryDate: Date;
  quantityUnits: number;
  unit: MedicineUnit;
  unitCost: number;
  lowStockThreshold: number;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, index: true },
    manufacturer: { type: String, default: null },
    batchNo: { type: String, required: true },
    expiryDate: { type: Date, required: true, index: true },
    quantityUnits: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, enum: ["ML", "TABLET", "KG", "SACHET", "VIAL"], required: true },
    unitCost: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, required: true, default: 10 },
    isActive: { type: Boolean, required: true, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(MedicineSchema);

export const Medicine = model<IMedicine>("Medicine", MedicineSchema);
