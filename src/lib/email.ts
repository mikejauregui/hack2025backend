/**
 * Email Service
 * Send emails using ZeptoMail and Liquid templates
 */

// @ts-ignore
import { SendMailClient } from "zeptomail";
import { Liquid } from "liquidjs";

const url = process.env.ZEPTOMAIL_URL || "https://api.zeptomail.com/";
const token = process.env.ZEPTOMAIL_TOKEN || "";

// Initialize ZeptoMail client
const client = new SendMailClient({ url, token });

// Initialize Liquid template engine
export const engine = new Liquid({
  root: "src/templates/",
  extname: ".liquid",
});

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  recipient: string,
  name: string,
  verificationToken: string
): Promise<any> {
  const baseUrl = process.env.BASS_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

  const content = await engine.renderFile("email-verification", {
    name,
    verificationLink,
    expiresIn: "24 hours",
  });

  const response = await client.sendMail({
    from: {
      address: "noreply@dbug.mx",
      name: "Face Payment System",
    },
    to: [
      {
        email_address: {
          address: recipient,
          name: name,
        },
      },
    ],
    subject: "Verify Your Email Address",
    htmlbody: content,
  });

  return response;
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  recipient: string,
  name: string
): Promise<any> {
  const content = await engine.renderFile("welcome", {
    name,
    dashboardUrl: `${process.env.BASS_URL}/app/dashboard`,
  });

  const response = await client.sendMail({
    from: {
      address: "noreply@dbug.mx",
      name: "Face Payment System",
    },
    to: [
      {
        email_address: {
          address: recipient,
          name: name,
        },
      },
    ],
    subject: "Welcome to Face Payment System!",
    htmlbody: content,
  });

  return response;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  recipient: string,
  name: string,
  resetToken: string
): Promise<any> {
  const baseUrl = process.env.BASS_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const content = await engine.renderFile("password-reset", {
    name,
    resetLink,
    expiresIn: "1 hour",
  });

  const response = await client.sendMail({
    from: {
      address: "noreply@dbug.mx",
      name: "Face Payment System",
    },
    to: [
      {
        email_address: {
          address: recipient,
          name: name,
        },
      },
    ],
    subject: "Reset Your Password",
    htmlbody: content,
  });

  return response;
}

/**
 * Send test email (for testing configuration)
 */
export async function sendTestEmail(recipient: string): Promise<any> {
  const response = await client.sendMail({
    from: {
      address: "noreply@dbug.mx",
      name: "Face Payment System",
    },
    to: [
      {
        email_address: {
          address: recipient,
          name: "Test User",
        },
      },
    ],
    subject: "Test Email from Face Payment System",
    htmlbody: "<h1>Test Email</h1><p>If you received this, your email configuration is working!</p>",
  });

  return response;
}
