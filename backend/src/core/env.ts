import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(9000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  /** Separate secret for refresh tokens (required in production; see adminAuth.helper getJwtRefreshSecret). */
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, "JWT_REFRESH_SECRET must be at least 16 characters")
    .optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  ADMIN_ACCESS_COOKIE_NAME: z.string().default("admin_access_token"),
  ADMIN_REFRESH_COOKIE_NAME: z.string().default("admin_refresh_token"),
  /** Cookie maxAge (ms); align roughly with JWT access TTL. */
  ADMIN_ACCESS_COOKIE_MAX_AGE_MS: z.coerce
    .number()
    .default(7 * 24 * 60 * 60 * 1000),
  ADMIN_REFRESH_COOKIE_MAX_AGE_MS: z.coerce
    .number()
    .default(30 * 24 * 60 * 60 * 1000),
  /** Optional cookie Domain attribute (e.g. `.example.com` for subdomains). */
  ADMIN_COOKIE_DOMAIN: z.string().optional(),
  /** Branding in password-reset emails */
  APP_NAME: z.string().default("Chicken Farm Management"),
  /** Public URL of the admin app (optional; used in email footer links) */
  APP_PUBLIC_URL: z.string().optional(),
  PASSWORD_RESET_OTP_TTL_MINUTES: z.coerce.number().min(5).max(60).default(15),
  /** Max wrong OTP submissions per issued code; clears code after limit (forces new forgot). */
  ADMIN_PASSWORD_RESET_OTP_MAX_ATTEMPTS: z.coerce.number().min(3).max(20).default(5),
  /** Minimum time (ms) before forgot-password responds (mitigates timing / existence leaks). */
  ADMIN_PASSWORD_RESET_FORGOT_MIN_DELAY_MS: z.coerce.number().min(0).max(5000).default(400),
  /** Per-IP forgot-password requests within the window. */
  ADMIN_AUTH_FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .default(60 * 60 * 1000),
  ADMIN_AUTH_FORGOT_PASSWORD_RATE_LIMIT_MAX: z.coerce.number().default(5),
  /** Per-IP reset-password (OTP verify) requests within the window. */
  ADMIN_AUTH_RESET_PASSWORD_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .default(15 * 60 * 1000),
  ADMIN_AUTH_RESET_PASSWORD_RATE_LIMIT_MAX: z.coerce.number().default(30),
  /** Per-IP refresh-token requests within the window. */
  ADMIN_AUTH_REFRESH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .default(15 * 60 * 1000),
  ADMIN_AUTH_REFRESH_RATE_LIMIT_MAX: z.coerce.number().default(120),
  /** Public URL of the seller SPA (optional; used in seller password-reset emails). */
  SELLER_APP_PUBLIC_URL: z.string().optional(),
  /** Max wrong OTP submissions per issued seller code. */
  SELLER_PASSWORD_RESET_OTP_MAX_ATTEMPTS: z.coerce.number().min(3).max(20).default(5),
  /** Minimum time (ms) before seller forgot-password responds. */
  SELLER_PASSWORD_RESET_FORGOT_MIN_DELAY_MS: z.coerce.number().min(0).max(5000).default(400),
  /**
   * Set true when behind a reverse proxy so req.ip / rate-limit use X-Forwarded-For safely.
   * Use only with a correctly configured proxy.
   */
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  /** SMTP for transactional mail. In production, host/from are required to send reset emails. */
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v?.toLowerCase() === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}
