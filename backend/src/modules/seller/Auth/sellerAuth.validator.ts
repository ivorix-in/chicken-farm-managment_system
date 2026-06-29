import { z } from "zod";

export const registerBody = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().min(1, "Email is required").email("Email must be valid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().min(7, "Phone number is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  sellerType: z.enum(["INDIVIDUAL", "BUSINESS"], {
    errorMap: () => ({ message: "Seller type must be INDIVIDUAL or BUSINESS" }),
  }),
});

export const verifyRegistrationOtpBody = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const resendRegistrationOtpBody = z.object({
  email: z.string().email(),
});

export const loginBody = z.object({
  email: z.string().min(1, "Email is required").email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

export const refreshBody = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const forgotPasswordBody = z.object({
  email: z.string().email(),
});

export const resetPasswordBody = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const verifyOtpBody = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

