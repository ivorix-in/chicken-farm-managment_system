import { z } from "zod";

export const createFarmerBody = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  address: z.string().min(5).max(300),
  nic: z.string().max(30).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateFarmerBody = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().min(5).max(300).optional(),
  nic: z.string().max(30).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const listFarmersQuery = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  areaId: z.string().uuid().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
