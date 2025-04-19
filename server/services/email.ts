/**
 * Email service for the e-Pharmacy application
 * Handles sending verification emails, password resets, etc.
 */

import { User } from "@shared/schema";
import crypto from "crypto";
import { getConfig } from "../config";

/**
 * Generates a verification token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a password reset token
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates an email verification link
 * @param token Verification token
 */
export function createVerificationLink(token: string): string {
  const config = getConfig();
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'https://e-pharmacy.replit.app'
    : `http://localhost:${config.app.port}`;
  
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Creates a password reset link
 * @param token Password reset token
 */
export function createPasswordResetLink(token: string): string {
  const config = getConfig();
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'https://e-pharmacy.replit.app'
    : `http://localhost:${config.app.port}`;
  
  return `${baseUrl}/reset-password?token=${token}`;
}

/**
 * Sends a verification email
 * @param user User to send verification email to
 * @param token Verification token
 */
export async function sendVerificationEmail(user: User, token: string): Promise<boolean> {
  // In a real application, you would use a mail service like Sendgrid, Mailgun, etc.
  // For this demo, we'll just log the email
  
  const verificationLink = createVerificationLink(token);
  
  console.log(`
    VERIFICATION EMAIL
    -----------------
    To: ${user.email}
    Subject: Verify your e-Pharmacy account
    
    Hello ${user.username},
    
    Please verify your e-Pharmacy account by clicking the link below:
    
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you did not create an account with us, please ignore this email.
    
    Thank you,
    e-Pharmacy Team
  `);
  
  // In development mode, we'll consider the email "sent" successfully
  return true;
}

/**
 * Sends a password reset email
 * @param user User to send password reset email to
 * @param token Password reset token
 */
export async function sendPasswordResetEmail(user: User, token: string): Promise<boolean> {
  // In a real application, you would use a mail service like Sendgrid, Mailgun, etc.
  // For this demo, we'll just log the email
  
  const resetLink = createPasswordResetLink(token);
  
  console.log(`
    PASSWORD RESET EMAIL
    -------------------
    To: ${user.email}
    Subject: Reset your e-Pharmacy password
    
    Hello ${user.username},
    
    We received a request to reset your e-Pharmacy password. Click the link below to reset your password:
    
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, please ignore this email.
    
    Thank you,
    e-Pharmacy Team
  `);
  
  // In development mode, we'll consider the email "sent" successfully
  return true;
}