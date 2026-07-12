import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type CollectionReportStatus = "DRAFT" | "SUBMITTED";

export interface ICollectionReportItem {
  boxNumber: number;
  emptyWeight: number;
  loadedWeight: number;
  chickenWeight?: number; // calculated as loadedWeight - emptyWeight
  chickenCount: number;
}

export interface ICollectionReport {
  id: string;
  _id: string;
  vehicleId: string;
  farmId: string;
  batchId: string;
  collectionDate: Date;
  driverName?: string | null;
  remarks?: string | null;
  status: CollectionReportStatus;
  totalBoxes: number;
  totalChickens: number;
  totalEmptyWeight: number;
  totalLoadedWeight: number;
  totalChickenWeight: number;
  averageChickenWeight: number;
  createdBy: string;
  items: ICollectionReportItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionReportItemSchema = new Schema<ICollectionReportItem>(
  {
    boxNumber: { type: Number, required: true },
    emptyWeight: { type: Number, required: true, min: 0.01 },
    loadedWeight: { type: Number, required: true, min: 0.01 },
    chickenWeight: { type: Number, required: true, min: 0 },
    chickenCount: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const CollectionReportSchema = new Schema<ICollectionReport>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    vehicleId: { type: String, required: true, ref: "Vehicle", index: true },
    farmId: { type: String, required: true, ref: "Farm", index: true },
    batchId: { type: String, required: true, ref: "Batch", index: true },
    collectionDate: { type: Date, required: true, index: true },
    driverName: { type: String, default: null },
    remarks: { type: String, default: null },
    status: { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT", required: true, index: true },
    totalBoxes: { type: Number, required: true, default: 0 },
    totalChickens: { type: Number, required: true, default: 0 },
    totalEmptyWeight: { type: Number, required: true, default: 0 },
    totalLoadedWeight: { type: Number, required: true, default: 0 },
    totalChickenWeight: { type: Number, required: true, default: 0 },
    averageChickenWeight: { type: Number, required: true, default: 0 },
    createdBy: { type: String, required: true, ref: "AdminUser" },
    items: { type: [CollectionReportItemSchema], required: true },
  },
  { timestamps: true }
);

applyGlobalOptions(CollectionReportSchema);

export const CollectionReport = model<ICollectionReport>("CollectionReport", CollectionReportSchema);
