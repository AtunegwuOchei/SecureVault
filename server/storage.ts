import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  passwords,
  securityAlerts,
  activityLogs,
  passwordResetTokens,
  type User,
  type InsertUser,
  type Password,
  type InsertPassword,
  type UpdatePassword,
  type SecurityAlert,
  type ActivityLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  updateUserPremiumStatus(id: number, isPremium: boolean): Promise<void>;
  updateUserPassword(id: number, passwordHash: string, salt: string): Promise<void>;

  // Password methods
  getPasswordsByUserId(userId: number): Promise<Password[]>;
  getPasswordById(id: number, userId: number): Promise<Password | undefined>;
  createPassword(password: InsertPassword & { strength?: number }, userId: number): Promise<Password>;
  updatePassword(id: number, userId: number, password: UpdatePassword & { strength?: number }): Promise<Password | undefined>;
  deletePassword(id: number, userId: number): Promise<boolean>;

  // Security Alert methods
  getSecurityAlertsByUserId(userId: number): Promise<SecurityAlert[]>;
  createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>): Promise<SecurityAlert>;
  resolveSecurityAlert(id: number, userId: number): Promise<boolean>;

  // Activity Log methods
  getActivityLogsByUserId(userId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog>;

    // Password reset tokens
	createPasswordResetToken(tokenData: {
		userId: number;
		token: string;
		expiresAt: Date;
		used: boolean;
	}): Promise<any>;
	getPasswordResetToken(token: string): Promise<any>;
	markPasswordResetTokenAsUsed(token: string): Promise<boolean>;
	invalidatePasswordResetTokens(userId: number): Promise<void>;
	deleteExpiredPasswordResetTokens(): Promise<void>;


  // Password health methods
  getPasswordStats(userId: number): Promise<{
    total: number;
    strong: number;
    weak: number;
    reused: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password_hash: insertUser.password, // This should be hashed in auth.ts
        email: insertUser.email,
        name: insertUser.name,
        masterKeyHash: insertUser.masterKeyHash,
        salt: insertUser.salt,
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isPremium })
      .where(eq(users.id, id));
  }

  async updateUserPassword(userId: number, passwordHash: string, salt: string): Promise<void> {
		await db
			.update(users)
			.set({ 
				password_hash: passwordHash,
				salt: salt 
			})
			.where(eq(users.id, userId));
	}

  // Password methods
  async getPasswordsByUserId(userId: number): Promise<Password[]> {
    return db
      .select()
      .from(passwords)
      .where(eq(passwords.userId, userId))
      .orderBy(desc(passwords.updatedAt));
  }

  async getPasswordById(id: number, userId: number): Promise<Password | undefined> {
    const [password] = await db
      .select()
      .from(passwords)
      .where(and(eq(passwords.id, id), eq(passwords.userId, userId)));
    return password;
  }

  async createPassword(password: InsertPassword & { strength?: number }, userId: number): Promise<Password> {
    const [newPassword] = await db
      .insert(passwords)
      .values({
        ...password,
        userId,
        strength: password.strength || 0,
        isFavorite: password.isFavorite || false,
      })
      .returning();
    return newPassword;
  }

  async updatePassword(id: number, userId: number, password: UpdatePassword & { strength?: number }): Promise<Password | undefined> {
    const [updatedPassword] = await db
      .update(passwords)
      .set({ ...password, updatedAt: new Date() })
      .where(and(eq(passwords.id, id), eq(passwords.userId, userId)))
      .returning();
    return updatedPassword;
  }

  async deletePassword(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(passwords)
      .where(and(eq(passwords.id, id), eq(passwords.userId, userId)))
      .returning({ id: passwords.id });
    return result.length > 0;
  }

  // Security Alert methods
  async getSecurityAlertsByUserId(userId: number): Promise<SecurityAlert[]> {
    return db
      .select()
      .from(securityAlerts)
      .where(eq(securityAlerts.userId, userId))
      .orderBy(desc(securityAlerts.createdAt));
  }

  async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>): Promise<SecurityAlert> {
    const [newAlert] = await db
      .insert(securityAlerts)
      .values({
        ...alert,
        createdAt: new Date(),
      })
      .returning();
    return newAlert;
  }

  async resolveSecurityAlert(id: number, userId: number): Promise<boolean> {
    const result = await db
      .update(securityAlerts)
      .set({ isResolved: true })
      .where(and(eq(securityAlerts.id, id), eq(securityAlerts.userId, userId)))
      .returning({ id: securityAlerts.id });
    return result.length > 0;
  }

  // Activity Log methods
  async getActivityLogsByUserId(userId: number, limit: number = 10): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async createActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values({
        ...log,
        createdAt: new Date(),
      })
      .returning();
    return newLog;
  }

  // Password reset tokens
  async createPasswordResetToken(tokenData: {
    userId: number;
    token: string;
    expiresAt: Date;
    used: boolean;
  }) {
    const [newToken] = await db
      .insert(passwordResetTokens)
      .values(tokenData)
      .returning();
    return newToken;
  }

  async getPasswordResetToken(token: string) {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<boolean> {
    const result = await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
    return result.length > 0;
  }

  async invalidatePasswordResetTokens(userId: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.userId, userId));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} < NOW()`);
  }

  // Password health methods
  async getPasswordStats(userId: number): Promise<{
    total: number;
    strong: number;
    weak: number;
    reused: number;
  }> {
    const allPasswords = await this.getPasswordsByUserId(userId);

    const total = allPasswords.length;
    const strong = allPasswords.filter(p => (p.strength || 0) >= 80).length;
    const weak = allPasswords.filter(p => (p.strength || 0) < 50).length;

    // Find reused passwords (same encrypted value appears multiple times)
    const passwordMap = new Map<string, number>();
    allPasswords.forEach(p => {
      const count = passwordMap.get(p.encryptedPassword) || 0;
      passwordMap.set(p.encryptedPassword, count + 1);
    });

    const reused = Array.from(passwordMap.values()).filter(count => count > 1).length;

    return { total, strong, weak, reused };
  }
}

export const storage = new DatabaseStorage();