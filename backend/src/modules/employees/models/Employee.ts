import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type EmployeeDepartment = "SUPERVISOR" | "DOCTOR" | "ACCOUNTANT" | "MANAGER" | "STAFF";

export interface IEmployee {
  id: string;
  _id: string;
  adminUserId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  department: EmployeeDepartment;
  salary: number;
  joiningDate: Date;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    adminUserId: { type: String, default: null, ref: "AdminUser", index: true },
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    department: {
      type: String,
      enum: ["SUPERVISOR", "DOCTOR", "ACCOUNTANT", "MANAGER", "STAFF"],
      required: true,
      index: true,
    },
    salary: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(EmployeeSchema);

export const Employee = model<IEmployee>("Employee", EmployeeSchema);
