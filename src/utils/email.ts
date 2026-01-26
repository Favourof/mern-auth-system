import { Resend } from "resend";
import { config } from "../config/config";

const resend = new Resend(config.resendApiKey);

/**
 * Shared email wrapper
 */
const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await resend.emails.send({
      from: config.emailFrom,
      to,
      subject,
      html,
    });

    if (config.nodeEnv === "development") {
      console.log(`✅ Email sent: ${subject} → ${to}`);
    }
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Email could not be sent");
  }
};

/**
 * Base email layout (keeps your HTML but improves structure)
 */
const baseTemplate = (content: string) => `
  <div style="background-color:#f4f6f8;padding:40px 0;">
    <div style="font-family:Arial,sans-serif;
                max-width:600px;
                margin:0 auto;
                background:#ffffff;
                padding:30px;
                border-radius:8px;
                box-shadow:0 2px 8px rgba(0,0,0,0.05);">

      ${content}

      <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />

      <p style="font-size:12px;color:#999;text-align:center;">
        © ${new Date().getFullYear()} Your App. All rights reserved.
      </p>
    </div>
  </div>
`;

// sendPasswordResetEmail
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  const html = baseTemplate(`
    <h1 style="color:#333;">Password Reset Request</h1>

    <p style="color:#666;font-size:16px;line-height:1.6;">
      You requested to reset your password. Click the button below to set a new password.
    </p>

    <div style="text-align:center;margin:35px 0;">
      <a href="${resetUrl}"
         style="background:#2196F3;
                color:#ffffff;
                padding:14px 36px;
                text-decoration:none;
                border-radius:6px;
                font-size:16px;
                display:inline-block;">
        Reset Password
      </a>
    </div>

    <p style="color:#999;font-size:14px;">
      Or copy this link:
      <br />
      <a href="${resetUrl}" style="color:#2196F3;">${resetUrl}</a>
    </p>

    <p style="color:#999;font-size:14px;">
      This link will expire in <strong>1 hour</strong>.
    </p>

    <p style="color:#999;font-size:12px;">
      If you did not request this, you can safely ignore this email.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
  });
};

// sendVerificationEmail
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
): Promise<void> => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;

  const html = baseTemplate(`
    <h1 style="color:#333;">Welcome! Verify Your Email</h1>

    <p style="color:#666;font-size:16px;line-height:1.6;">
      Thank you for registering. Please verify your email address to activate your account.
    </p>

    <div style="text-align:center;margin:35px 0;">
      <a href="${verificationUrl}"
         style="background:#4CAF50;
                color:#ffffff;
                padding:14px 36px;
                text-decoration:none;
                border-radius:6px;
                font-size:16px;
                display:inline-block;">
        Verify Email
      </a>
    </div>

    <p style="color:#999;font-size:14px;">
      Or copy this link:
      <br />
      <a href="${verificationUrl}" style="color:#4CAF50;">${verificationUrl}</a>
    </p>

    <p style="color:#999;font-size:14px;">
      This link will expire in <strong>24 hours</strong>.
    </p>

    <p style="color:#999;font-size:12px;">
      If you didn’t create an account, you can ignore this email.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
  });
};

// resendVerificationEmail
export const resendVerificationEmail = async (
  email: string,
  verificationToken: string,
): Promise<void> => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;

  const html = baseTemplate(`
    <h1 style="color:#333;">Email Verification Reminder</h1>

    <p style="color:#666;font-size:16px;line-height:1.6;">
      You requested a new verification email. Click below to verify your account.
    </p>

    <div style="text-align:center;margin:35px 0;">
      <a href="${verificationUrl}"
         style="background:#4CAF50;
                color:#ffffff;
                padding:14px 36px;
                text-decoration:none;
                border-radius:6px;
                font-size:16px;
                display:inline-block;">
        Verify Email
      </a>
    </div>

    <p style="color:#999;font-size:14px;">
      This link will expire in <strong>24 hours</strong>.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: "Verify Your Email – Reminder",
    html,
  });
};

// sendWelcomeEmail
export const sendWelcomeEmail = async (
  email: string,
  name: string,
): Promise<void> => {
  const html = baseTemplate(`
    <h1 style="color:#333;">Welcome, ${name}!</h1>

    <p style="color:#666;font-size:16px;line-height:1.6;">
      Thank you for registering. We’re excited to have you on board.
    </p>

    <p style="color:#666;font-size:16px;">
      Get started by exploring our features.
    </p>
  `);

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Our App!",
      html,
    });
  } catch {
    // Welcome email should never block registration
  }
};
