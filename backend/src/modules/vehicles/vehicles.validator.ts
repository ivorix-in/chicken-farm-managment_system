import { z } from "zod";

export const createVehicleBody = z.object({
  vehicleNo: z.string().min(2).max(20),
  model: z.string().max(50).optional().nullable(),
  driverName: z.string().max(50).optional().nullable(),
});

export const updateVehicleBody = z.object({
  vehicleNo: z.string().min(2).max(20).optional(),
  model: z.string().max(50).optional().nullable(),
  driverName: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
});
