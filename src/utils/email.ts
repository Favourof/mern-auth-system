import nodemailer from "nodemailer";
import { config } from "../config/config";

// Create email transporter

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: false,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
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

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  const message = {
    from: config.emailFrom,
    to: email,
    subject: "Password Reset Request",
    html: `
      <h1>You requested a password reset</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(message);

    // if (config.nodeEnv === "development") {
    //   console.log("Password reset email sent!");
    //   console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    // }
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Email could not be sent");
  }
};

/**
 * Send welcome email (bonus feature)
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
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
    const transporter = createTransporter();
    await transporter.sendMail(message);

    // if (config.nodeEnv === "development") {
    //   console.log("Welcome email sent to:", email);
    // }
  } catch (error) {
    console.error("Welcome email error:", error);
    // Don't throw - welcome email failure shouldn't break registration
  }
};
