import { z } from "zod";

export const createBatchBody = z.object({
  farmId: z.string().uuid(),
  batchNo: z.string().min(2).max(50),
  chickCount: z.number().int().min(1),
  placementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expectedClosureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(1000).optional(),
  chickPurchase: z
    .object({
      supplierId: z.string().uuid().nullable().optional(),
      pricePerChick: z.number().min(0),
      totalAmount: z.number().min(0),
      purchasedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      vendor: z.string().max(100).optional(),
      breed: z.string().max(50).optional(),
    })
    .optional(),
});

export const updateBatchBody = z.object({
  status: z.enum(["PROGRESS", "COMPLETED"]).optional(),
  notes: z.string().max(1000).nullable().optional(),
  expectedClosureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const listBatchesQuery = z.object({
  farmId: z.string().uuid().optional(),
  status: z.enum(["PROGRESS", "COMPLETED", "CLOSED"]).optional(),
  createdBy: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
