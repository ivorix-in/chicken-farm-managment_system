import { z } from "zod";

const sellerTypeApi = z.enum(["individual", "business"]);

export const createSellerBody = z.object({
  firstName: z.string().min(1, "First name is required").max(128),
  lastName: z.string().min(1, "Last name is required").max(128),
  email: z.string().email("Valid email is required").max(255),
  country: z.string().min(1, "Country is required").max(128),
  phoneCode: z
    .string()
    .min(1, "Phone code is required")
    .max(8)
    .regex(/^\+[0-9]{1,4}$/u, "Phone code must start with + and digits"),
  phoneNumber: z
    .string()
    .min(4, "Phone number is required")
    .max(20)
    .regex(/^[0-9]+$/u, "Phone number must contain digits only"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  sellerType: sellerTypeApi,
});

export const updateSellerBody = z
  .object({
    firstName: z.string().min(1).max(128).optional(),
    lastName: z.string().min(1).max(128).optional(),
    email: z.string().email().max(255).optional(),
    country: z.string().min(1).max(128).optional(),
    phoneCode: z
      .string()
      .min(1)
      .max(8)
      .regex(/^\+[0-9]{1,4}$/u)
      .optional(),
    phoneNumber: z
      .string()
      .min(4)
      .max(20)
      .regex(/^[0-9]+$/u)
      .optional(),
    password: z.string().min(8).max(128).optional(),
    sellerType: sellerTypeApi.optional(),
  })
  .refine(
    (o) =>
      o.firstName !== undefined ||
      o.lastName !== undefined ||
      o.email !== undefined ||
      o.country !== undefined ||
      o.phoneCode !== undefined ||
      o.phoneNumber !== undefined ||
      o.password !== undefined ||
      o.sellerType !== undefined,
    "At least one field is required"
  );

export const sellerIdParam = z.object({
  sellerId: z.string().uuid(),
});
