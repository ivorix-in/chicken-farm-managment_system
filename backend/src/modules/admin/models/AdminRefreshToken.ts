import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IAdminRefreshToken {
  id: string;
  _id: string;
  tokenHash: string;
  adminUserId: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminRefreshTokenSchema = new Schema<IAdminRefreshToken>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    tokenHash: { type: String, required: true, unique: true, index: true },
    adminUserId: { type: String, required: true, ref: "AdminUser", index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(AdminRefreshTokenSchema);

AdminRefreshTokenSchema.virtual("adminUser", {
  ref: "AdminUser",
  localField: "adminUserId",
  foreignField: "_id",
  justOne: true,
});

export const AdminRefreshToken = model<IAdminRefreshToken>(
  "AdminRefreshToken",
  AdminRefreshTokenSchema
);
