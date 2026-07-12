import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IFarmer {
  id: string;
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  nic?: string | null;
  notes?: string | null;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: null, sparse: true },
    address: { type: String, required: true },
    nic: { type: String, default: null },
    notes: { type: String, default: null },
    isActive: { type: Boolean, required: true, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(FarmerSchema);

export const Farmer = model<IFarmer>("Farmer", FarmerSchema);
