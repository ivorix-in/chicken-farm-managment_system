import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IVehicle {
  id: string;
  _id: string;
  vehicleNo: string;
  model?: string | null;
  driverName?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    vehicleNo: { type: String, required: true, unique: true, index: true },
    model: { type: String, default: null },
    driverName: { type: String, default: null },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true }
);

applyGlobalOptions(VehicleSchema);

export const Vehicle = model<IVehicle>("Vehicle", VehicleSchema);
