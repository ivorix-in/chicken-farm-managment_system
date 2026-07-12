import { z } from "zod";

export const createVisitBody = z.object({
  batchId: z.string().uuid(),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mortalityToday: z.number().int().min(0),
  cullsToday: z.number().int().min(0).default(0),
  weakBirdsToday: z.number().int().min(0).default(0),
  ownUseToday: z.number().int().min(0).default(0),
  approxWeightKg: z.number().min(0),
  feedUsedKg: z.number().min(0),
  feedBagsUsed: z.number().int().min(0).default(0),
  remarks: z.string().max(1000).optional(),
  notifyDoctor: z.boolean().optional(),
});

export const listVisitsQuery = z.object({
  batchId: z.string().uuid().optional(),
  supervisorId: z.string().uuid().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
