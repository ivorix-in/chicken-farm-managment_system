import { z } from "zod";

const itemSchema = z.object({
  boxNumber: z.number().int().min(1),
  emptyWeight: z.number().min(0.01),
  loadedWeight: z.number().min(0.01),
  chickenCount: z.number().int().min(1),
});

export const createCollectionReportBody = z.object({
  vehicleId: z.string().uuid(),
  farmId: z.string().uuid(),
  batchId: z.string().uuid(),
  collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  driverName: z.string().max(50).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export const updateCollectionReportBody = z.object({
  vehicleId: z.string().uuid().optional(),
  collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  driverName: z.string().max(50).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  items: z.array(itemSchema).min(1).optional(),
});

export const listCollectionReportsQuery = z.object({
  farmId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
