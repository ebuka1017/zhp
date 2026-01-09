import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.urls.webDashboard}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
    text: `Please verify your email by visiting: ${verificationUrl}`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.urls.webDashboard}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  total: number
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order.</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <p>You can track your order in the app.</p>
    `,
  });
};
