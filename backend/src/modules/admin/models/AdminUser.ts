import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";
import { IAdminRole } from "./AdminRole.js";

export interface IAdminUser {
  id: string;
  _id: string;
  email: string;
  passwordHash: string;
  roleId: string;
  name: string;
  mobileNumber?: string | null;
  isActive: boolean;
  deletedAt?: Date | null;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  lastLoginAt?: Date | null;
  role?: IAdminRole;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    roleId: { type: String, required: true, ref: "AdminRole", index: true },
    name: { type: String, required: true },
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: { type: Boolean, required: true, default: true, index: true },
    deletedAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(AdminUserSchema);

// Virtual populate for role, if we want to query role directly
AdminUserSchema.virtual("role", {
  ref: "AdminRole",
  localField: "roleId",
  foreignField: "_id",
  justOne: true,
});

export const AdminUser = model<IAdminUser>("AdminUser", AdminUserSchema);
