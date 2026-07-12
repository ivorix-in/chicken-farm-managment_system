import { z } from "zod";

const feedTypes = ["STARTER", "GROWER", "FINISHER", "PRE_STARTER"] as const;
const txTypes = ["ISSUE", "RETURN", "RESTOCK"] as const;

export const setFeedStockBody = z.object({
  feedType: z.enum(feedTypes),
  quantityKg: z.number().min(0),
  unitCostPerKg: z.number().min(0),
  lowStockThresholdKg: z.number().min(0).default(1000),
});

export const createTransactionBody = z.object({
  batchId: z.string().uuid().optional(),
  feedStockId: z.string().uuid(),
  quantityKg: z.number().min(0.01),
  numberOfBags: z.number().int().min(0).default(0),
  type: z.enum(txTypes),
  category: z.enum(["GODOWN", "TMS_IN", "RETURN", "TRANSFER_OUT", "CONSUMPTION"]).optional(),
  notes: z.string().max(500).optional(),
});

export const listTransactionsQuery = z.object({
  batchId: z.string().uuid().optional(),
  feedStockId: z.string().uuid().optional(),
  type: z.enum(txTypes).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
