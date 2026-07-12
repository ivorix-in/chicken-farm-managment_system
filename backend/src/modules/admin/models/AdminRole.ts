import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IAdminRole {
  id: string;
  _id: string;
  name: string;
  code: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminRoleSchema = new Schema<IAdminRole>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    permissions: { type: [String], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(AdminRoleSchema);

export const AdminRole = model<IAdminRole>("AdminRole", AdminRoleSchema);
