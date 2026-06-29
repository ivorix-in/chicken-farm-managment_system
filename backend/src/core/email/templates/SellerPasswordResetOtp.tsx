import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties } from "react";

export type SellerPasswordResetOtpProps = {
  appName: string;
  userName: string;
  otpCode: string;
  expiresInMinutes: number;
  appPublicUrl?: string;
};

export function SellerPasswordResetOtpEmail({
  appName,
  userName,
  otpCode,
  expiresInMinutes,
  appPublicUrl,
}: SellerPasswordResetOtpProps) {
  const previewText = `Your ${appName} seller password reset code is ${otpCode}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={hero}>
            <Heading style={heroTitle}>{appName}</Heading>
            <Text style={heroSubtitle}>Seller password reset</Text>
          </Section>

          <Section style={card}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={paragraph}>
              We received a request to reset the password for your seller account.
              Use the verification code below to continue. This code is confidential —
              never share it with anyone.
            </Text>

            <Section style={otpWrap}>
              <Text style={otpLabel}>Your verification code</Text>
              <Text style={otpCodeStyle}>{otpCode}</Text>
            </Section>

            <Text style={finePrint}>
              This code expires in{" "}
              <strong style={{ color: "#0f172a" }}>{expiresInMinutes} minutes</strong>.
              If you did not request a reset, you can safely ignore this email;
              your password will stay the same.
            </Text>

            {appPublicUrl ? (
              <>
                <Hr style={hr} />
                <Text style={paragraph}>
                  Prefer to open the app?{" "}
                  <Link href={appPublicUrl} style={link}>
                    Go to {appName} seller portal
                  </Link>
                </Text>
                <Section style={buttonSection}>
                  <Button href={appPublicUrl} style={button}>
                    Open seller portal
                  </Button>
                </Section>
              </>
            ) : null}

            <Hr style={hr} />
            <Text style={footerMuted}>
              Security tip: {appName} will never ask for this code by phone or
              chat. If something looks suspicious, contact support.
            </Text>
          </Section>

          <Text style={footerBrand}>
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: CSSProperties = {
  backgroundColor: "#f1f5f9",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: "48px 0",
};

const container: CSSProperties = {
  margin: "0 auto",
  padding: "0 24px",
  maxWidth: "560px",
};

const hero: CSSProperties = {
  textAlign: "center",
  marginBottom: "28px",
};

const heroTitle: CSSProperties = {
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  margin: "0 0 8px",
};

const heroSubtitle: CSSProperties = {
  color: "#64748b",
  fontSize: "15px",
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 600,
};

const card: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "40px 36px",
  boxShadow:
    "0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 40px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e2e8f0",
};

const greeting: CSSProperties = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: 600,
  margin: "0 0 16px",
};

const paragraph: CSSProperties = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const otpWrap: CSSProperties = {
  background: "linear-gradient(135deg, #f8fafc 0%, #fef9ee 100%)",
  borderRadius: "12px",
  border: "1px solid #e8d5a0",
  padding: "24px 20px",
  textAlign: "center",
  margin: "28px 0",
};

const otpLabel: CSSProperties = {
  color: "#b8860b",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  margin: "0 0 12px",
};

const otpCodeStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: "36px",
  fontWeight: 700,
  letterSpacing: "0.28em",
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  margin: 0,
};

const finePrint: CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const hr: CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "28px 0",
};

const link: CSSProperties = {
  color: "#c8960c",
  fontWeight: 600,
};

const buttonSection: CSSProperties = {
  textAlign: "center",
  marginTop: "12px",
};

const button: CSSProperties = {
  backgroundColor: "#0d1b3e",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 28px",
  boxShadow: "0 4px 14px rgba(13, 27, 62, 0.35)",
};

const footerMuted: CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
};

const footerBrand: CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center",
  marginTop: "32px",
};
