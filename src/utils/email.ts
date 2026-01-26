import nodemailer from "nodemailer";
import { config } from "../config/config";

// Create email transporter

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.emailHost,
    port: 587,
    secure: false,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10_000,
  });
};
const transporter = createTransporter();

transporter.verify((error, success) => {
  if (success) {
    console.log("noilmailer is active");
  } else {
    console.log(error);
  }
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
): Promise<void> => {
  // Frontend will handle this URL and show password reset form
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  const message = {
    from: config.emailFrom,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p style="color: #666; font-size: 16px;">
          You requested to reset your password. Click the button below to set a new password:
        </p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2196F3; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          Or copy this link: <br/>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <p style="color: #999; font-size: 12px;">
          If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `,
  };

  try {
    // const transporter = createTransporter();
    const info = await transporter.sendMail(message);

    if (config.nodeEnv === "development") {
      console.log("✅ Password reset email sent!");
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("🔗 Reset link:", resetUrl);
    }
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Email could not be sent");
  }
};

/**
 * Send email verification
 */
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
): Promise<void> => {
  console.log(config.emailPort);

  // Frontend will handle this URL and extract the token
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;

  const message = {
    from: config.emailFrom,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome! Verify Your Email</h1>
        <p style="color: #666; font-size: 16px;">
          Thank you for registering! Please verify your email address to activate your account.
        </p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          Or copy this link: <br/>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    // const transporter = createTransporter();
    const info = await transporter.sendMail(message);

    if (config.nodeEnv === "development") {
      console.log("✅ Verification email sent!");
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("🔗 Verification link:", verificationUrl);
    }
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Email could not be sent");
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  email: string,
  verificationToken: string,
): Promise<void> => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;

  const message = {
    from: config.emailFrom,
    to: email,
    subject: "Verify Your Email - Resent",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Email Verification Reminder</h1>
        <p style="color: #666; font-size: 16px;">
          You requested to resend the verification email. Click below to verify your account:
        </p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
  };

  try {
    // const transporter = createTransporter();
    const info = await transporter.sendMail(message);

    if (config.nodeEnv === "development") {
      console.log("✅ Verification email resent!");
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("❌ Email resend error:", error);
    throw new Error("Email could not be sent");
  }
};

/**
 * Send welcome email (bonus feature)
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
): Promise<void> => {
  const message = {
    from: config.emailFrom,
    to: email,
    subject: "Welcome to Our App!",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering. We're excited to have you on board!</p>
      <p>Get started by exploring our features.</p>
    `,
  };

  try {
    // const transporter = createTransporter();
    await transporter.sendMail(message);

    // if (config.nodeEnv === "development") {
    //   console.log("Welcome email sent to:", email);
    // }
  } catch (error) {
    console.error("Welcome email error:", error);
    // Don't throw - welcome email failure shouldn't break registration
  }
};
