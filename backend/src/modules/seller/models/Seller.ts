import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export interface IIndividualProfile {
  storeName?: string | null;
  bio?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
}

export interface IBusinessProfile {
  businessName?: string | null;
  companyLogoUrl?: string | null;
  companyDescription?: string | null;
  tradeLicenseUrl?: string | null;
}

export interface ISeller {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
  sellerType: "BUSINESS" | "INDIVIDUAL";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  isActive: boolean;
  lastLoginAt?: Date | null;
  individualProfile?: IIndividualProfile | null;
  businessProfile?: IBusinessProfile | null;
  createdAt: Date;
  updatedAt: Date;
}

const IndividualProfileSchema = new Schema<IIndividualProfile>(
  {
    storeName: { type: String, default: null },
    bio: { type: String, default: null },
    city: { type: String, default: null },
    avatarUrl: { type: String, default: null },
  },
  { _id: false, timestamps: true }
);

const BusinessProfileSchema = new Schema<IBusinessProfile>(
  {
    businessName: { type: String, default: null },
    companyLogoUrl: { type: String, default: null },
    companyDescription: { type: String, default: null },
    tradeLicenseUrl: { type: String, default: null },
  },
  { _id: false, timestamps: true }
);

const SellerSchema = new Schema<ISeller>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true, index: true },
    country: { type: String, required: true },
    sellerType: {
      type: String,
      enum: ["BUSINESS", "INDIVIDUAL"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED"],
      required: true,
      default: "PENDING",
      index: true,
    },
    isActive: { type: Boolean, required: true, default: false },
    lastLoginAt: { type: Date, default: null },
    individualProfile: { type: IndividualProfileSchema, default: null },
    businessProfile: { type: BusinessProfileSchema, default: null },
  },
  {
    timestamps: true,
  }
);

applyGlobalOptions(SellerSchema);

export const Seller = model<ISeller>("Seller", SellerSchema);
