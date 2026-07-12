import { Schema, model } from "mongoose";
import crypto from "crypto";
import { applyGlobalOptions } from "../../../core/db.js";

export type PrescriptionStatus = "PENDING" | "DISPENSED";

export interface IPrescriptionMedicine {
  medicineId: string;
  dosage: string;
  durationDays: number;
}

export interface IPrescription {
  id: string;
  _id: string;
  batchId: string;
  doctorId: string;
  medicines: IPrescriptionMedicine[];
  instructions?: string | null;
  prescribedAt: Date;
  status: PrescriptionStatus;
  dispensedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionMedicineSchema = new Schema<IPrescriptionMedicine>(
  {
    medicineId: { type: String, required: true, ref: "Medicine" },
    dosage: { type: String, required: true },
    durationDays: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    batchId: { type: String, required: true, ref: "Batch", index: true },
    doctorId: { type: String, required: true, ref: "AdminUser", index: true },
    medicines: { type: [PrescriptionMedicineSchema], required: true },
    instructions: { type: String, default: null },
    prescribedAt: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "DISPENSED"], required: true, default: "PENDING", index: true },
    dispensedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applyGlobalOptions(PrescriptionSchema);

export const Prescription = model<IPrescription>("Prescription", PrescriptionSchema);
