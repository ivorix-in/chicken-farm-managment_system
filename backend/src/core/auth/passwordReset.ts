import { randomInt } from "node:crypto";

/** Shared OTP/password-reset constants used by admin and seller flows. */
export const PASSWORD_RESET_OTP_LENGTH = 6;
export const PASSWORD_RESET_OTP_BCRYPT_ROUNDS = 12;

export const GENERIC_PASSWORD_RESET_REQUEST_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

export function generateNumericOtp(length: number): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
}

export async function enforcePasswordResetMinDelay(
  minDelayMs: number,
  startedAt: number
): Promise<void> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < minDelayMs) {
    await new Promise((r) => setTimeout(r, minDelayMs - elapsed));
  }
}
