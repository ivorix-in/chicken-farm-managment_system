import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { createElement } from "react";
import type { Env } from "../env.js";
import {
  AdminPasswordResetOtpEmail,
  type AdminPasswordResetOtpProps,
} from "./templates/AdminPasswordResetOtp.js";
import {
  SellerPasswordResetOtpEmail,
  type SellerPasswordResetOtpProps,
} from "./templates/SellerPasswordResetOtp.js";
import {
  SellerRegistrationOtpEmail,
  type SellerRegistrationOtpProps,
} from "./templates/SellerRegistrationOtp.js";

function smtpConfigured(env: Env): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT != null && env.SMTP_FROM);
}

function createTransport(env: Env) {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === true,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
  });
}

export async function sendAdminPasswordResetOtpEmail(
  env: Env,
  props: AdminPasswordResetOtpProps & { to: string }
): Promise<void> {
  const { to, ...templateProps } = props;
  const subject = `${templateProps.appName} — password reset code`;
  const html = await render(createElement(AdminPasswordResetOtpEmail, templateProps));

  if (!smtpConfigured(env)) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "SMTP is not configured: set SMTP_HOST, SMTP_PORT, and SMTP_FROM to send password reset emails."
      );
    }
    console.warn(
      "[email:dev] Password reset OTP (SMTP not configured; would send to %s): %s",
      to,
      templateProps.otpCode
    );
    return;
  }

  const transport = createTransport(env);
  await transport.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

export async function sendSellerPasswordResetOtpEmail(
  env: Env,
  props: SellerPasswordResetOtpProps & { to: string }
): Promise<void> {
  const { to, ...templateProps } = props;
  const subject = `${templateProps.appName} — seller password reset code`;
  const html = await render(createElement(SellerPasswordResetOtpEmail, templateProps));

  if (!smtpConfigured(env)) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "SMTP is not configured: set SMTP_HOST, SMTP_PORT, and SMTP_FROM to send password reset emails."
      );
    }
    console.warn(
      "[email:dev] Seller password reset OTP (SMTP not configured; would send to %s): %s",
      to,
      templateProps.otpCode
    );
    return;
  }

  const transport = createTransport(env);
  await transport.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

export async function sendSellerRegistrationOtpEmail(
  env: Env,
  props: SellerRegistrationOtpProps & { to: string }
): Promise<void> {
  const { to, ...templateProps } = props;
  const subject = `${templateProps.appName} — verify your email`;
  const html = await render(createElement(SellerRegistrationOtpEmail, templateProps));

  if (!smtpConfigured(env)) {
    if (env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured.");
    }
    console.warn(
      "[email:dev] Seller registration OTP (SMTP not configured; would send to %s): %s",
      to,
      templateProps.otpCode
    );
    return;
  }

  const transport = createTransport(env);
  await transport.sendMail({ from: env.SMTP_FROM, to, subject, html });
}
