import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IAdminPasswordResetOtp {
  id: string;
  _id: string;
  userId: string;
  otpHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdminPasswordResetOtpSchema = new Schema<IAdminPasswordResetOtp>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    userId: { type: String, required: true, ref: "AdminUser", index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    attempts: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(AdminPasswordResetOtpSchema);

AdminPasswordResetOtpSchema.virtual("user", {
  ref: "AdminUser",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

export const AdminPasswordResetOtp = model<IAdminPasswordResetOtp>(
  "AdminPasswordResetOtp",
  AdminPasswordResetOtpSchema
);
