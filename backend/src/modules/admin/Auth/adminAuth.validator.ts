import { z } from "zod";

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordBody = z.object({
  email: z.string().email(),
});

export const resetPasswordBody = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const refreshBody = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});
