import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface ISellerAddress {
  id: string;
  _id: string;
  sellerId: string;
  addressType: "BUSINESS" | "WAREHOUSE" | "PICKUP" | "RETURN";
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SellerAddressSchema = new Schema<ISellerAddress>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    sellerId: { type: String, required: true, ref: "Seller", index: true },
    addressType: {
      type: String,
      enum: ["BUSINESS", "WAREHOUSE", "PICKUP", "RETURN"],
      required: true,
    },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: null },
    landmark: { type: String, default: null },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(SellerAddressSchema);

export const SellerAddress = model<ISellerAddress>(
  "SellerAddress",
  SellerAddressSchema
);
