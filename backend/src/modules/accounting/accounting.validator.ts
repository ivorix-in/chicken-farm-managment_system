import { z } from "zod";

export const createTransactionBody = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "FEED_PURCHASE",
    "CHICK_PURCHASE",
    "MEDICINE_PURCHASE",
    "SALARY",
    "MAINTENANCE",
    "TRANSPORT",
    "BIRD_SALES",
    "MANURE_SALES",
    "OTHER",
  ]),
  amount: z.number().min(0),
  date: z.string().datetime().optional(), // ISO string
  referenceId: z.string().optional().nullable(),
  description: z.string().min(1).max(500),
  batchId: z.string().uuid().optional().nullable(),
  farmId: z.string().uuid().optional().nullable(),
});

export const listTransactionsQuery = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  batchId: z.string().uuid().optional(),
  farmId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
