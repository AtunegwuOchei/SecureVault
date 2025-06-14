
import crypto from "crypto";
import { storage } from "./storage";

interface PasswordResetToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

class PasswordResetService {
  // Generate a secure reset token
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a password reset token for a user
  async createResetToken(userId: number): Promise<string> {
    const token = this.generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Invalidate any existing tokens for this user
    await storage.invalidatePasswordResetTokens(userId);

    // Create new token
    await storage.createPasswordResetToken({
      userId,
      token,
      expiresAt,
      used: false
    });

    return token;
  }

  // Verify and consume a reset token
  async verifyResetToken(token: string): Promise<{ userId: number } | null> {
    const resetToken = await storage.getPasswordResetToken(token);
    
    if (!resetToken) {
      return null;
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return null;
    }

    // Check if token is already used
    if (resetToken.used) {
      return null;
    }

    return { userId: resetToken.userId };
  }

  // Mark token as used
  async consumeResetToken(token: string): Promise<boolean> {
    return await storage.markPasswordResetTokenAsUsed(token);
  }

  // Clean up expired tokens (can be run periodically)
  async cleanupExpiredTokens(): Promise<void> {
    await storage.deleteExpiredPasswordResetTokens();
  }
}

export const passwordResetService = new PasswordResetService();
