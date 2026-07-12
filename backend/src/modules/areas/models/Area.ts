import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IArea {
  id: string;
  _id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AreaSchema = new Schema<IArea>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: null },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true }
);

applyGlobalOptions(AreaSchema);

export const Area = model<IArea>("Area", AreaSchema);
