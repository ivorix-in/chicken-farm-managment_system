import { z } from "zod";

export const createAreaBody = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30),
  description: z.string().max(500).optional(),
});

export const updateAreaBody = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(30).optional(),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const listAreasQuery = z.object({
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});
