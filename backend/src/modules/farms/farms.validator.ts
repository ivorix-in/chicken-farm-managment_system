import { z } from "zod";

export const createFarmBody = z.object({
  name: z.string().min(2).max(100),
  farmerId: z.string().uuid(),
  supervisorId: z.string().uuid().optional(),
  areaId: z.string().uuid().optional(),
  address: z.string().min(5).max(300),
  capacity: z.number().int().min(1),
});

export const updateFarmBody = z.object({
  name: z.string().min(2).max(100).optional(),
  farmerId: z.string().uuid().optional(),
  supervisorId: z.string().uuid().nullable().optional(),
  areaId: z.string().uuid().nullable().optional(),
  address: z.string().min(5).max(300).optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
  isActive: z.boolean().optional(),
});

export const listFarmsQuery = z.object({
  farmerId: z.string().uuid().optional(),
  supervisorId: z.string().uuid().optional(),
  areaId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
  isActive: z.string().optional().transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
