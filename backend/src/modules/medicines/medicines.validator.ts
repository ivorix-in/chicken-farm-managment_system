import { z } from "zod";

const units = ["ML", "TABLET", "KG", "SACHET", "VIAL"] as const;
const statuses = ["PENDING", "DISPENSED"] as const;

export const createMedicineBody = z.object({
  name: z.string().min(2).max(150),
  manufacturer: z.string().max(100).optional(),
  batchNo: z.string().min(1).max(50),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantityUnits: z.number().min(0),
  unit: z.enum(units),
  unitCost: z.number().min(0),
  lowStockThreshold: z.number().min(0).optional(),
});

export const updateMedicineBody = z.object({
  name: z.string().min(2).max(150).optional(),
  manufacturer: z.string().max(100).nullable().optional(),
  batchNo: z.string().min(1).max(50).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  quantityUnits: z.number().min(0).optional(),
  unit: z.enum(units).optional(),
  unitCost: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const listMedicinesQuery = z.object({
  isActive: z.string().optional().transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createPrescriptionBody = z.object({
  batchId: z.string().uuid(),
  medicines: z.array(
    z.object({
      medicineId: z.string().uuid(),
      dosage: z.string().min(1).max(200),
      durationDays: z.number().int().min(1),
    })
  ).min(1),
  instructions: z.string().max(1000).optional(),
});

export const listPrescriptionsQuery = z.object({
  batchId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  status: z.enum(statuses).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
