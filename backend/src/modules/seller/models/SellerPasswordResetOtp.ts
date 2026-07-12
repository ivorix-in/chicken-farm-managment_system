import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface ISellerPasswordResetOtp {
  id: string;
  _id: string;
  sellerId: string;
  otpHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const SellerPasswordResetOtpSchema = new Schema<ISellerPasswordResetOtp>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    sellerId: { type: String, required: true, ref: "Seller", index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    attempts: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(SellerPasswordResetOtpSchema);

SellerPasswordResetOtpSchema.virtual("seller", {
  ref: "Seller",
  localField: "sellerId",
  foreignField: "_id",
  justOne: true,
});

export const SellerPasswordResetOtp = model<ISellerPasswordResetOtp>(
  "SellerPasswordResetOtp",
  SellerPasswordResetOtpSchema
);
