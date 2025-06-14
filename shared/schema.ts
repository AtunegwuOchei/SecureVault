import {
	pgTable,
	text,
	serial,
	integer,
	timestamp,
	boolean,
	jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	username: text("username").notNull().unique(),
	password_hash: text("password_hash").notNull(),
	email: text("email").notNull().unique(),
	name: text("name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	lastLogin: timestamp("last_login"),
	isPremium: boolean("is_premium").default(false),
	masterKeyHash: text("master_key_hash").notNull(),
	salt: text("salt").notNull(),
});

export const passwords = pgTable("passwords", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	title: text("title").notNull(),
	username: text("username"),
	encryptedPassword: text("encrypted_password").notNull(),
	url: text("url"),
	notes: text("notes"),
	category: text("category"),
	isFavorite: boolean("is_favorite").default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	strength: integer("strength").default(0),
});

export const securityAlerts = pgTable("security_alerts", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	type: text("type").notNull(), // 'breach', 'weak', 'reused'
	description: text("description").notNull(),
	metadata: jsonb("metadata"),
	isResolved: boolean("is_resolved").default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	passwordId: integer("password_id").references(() => passwords.id),
});

export const activityLogs = pgTable("activity_logs", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	action: text("action").notNull(), // 'create', 'update', 'delete', 'login', etc.
	details: text("details"),
	ipAddress: text("ip_address").notNull().default(""),
	userAgent: text("user_agent").notNull().default(""),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	used: boolean("used").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validations
export const insertUserSchema = z
	.object({
		username: z.string().min(3, "Username must be at least 3 characters").max(50),
		email: z.string().email("Invalid email format"),
		name: z.string().optional(),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(8, "Please confirm your password"),
		masterKeyHash: z.string(),
		salt: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const loginUserSchema = z.object({
	username: z.string().min(3, "Username is required"),
	password: z.string().min(8, "Password is required"),
});

export const insertPasswordSchema = z.object({
	title: z.string().min(1, "Title is required").max(100),
	username: z.string().optional(),
	encryptedPassword: z.string().min(1, "Password is required"),
	url: z.string().url().optional().or(z.literal("")),
	notes: z.string().optional(),
	category: z.string().optional(),
	isFavorite: z.boolean().optional().default(false),
});

export const updatePasswordSchema = insertPasswordSchema.partial();

export const passwordGeneratorSchema = z.object({
	length: z.number().min(8).max(128).default(16),
	includeUppercase: z.boolean().default(true),
	includeLowercase: z.boolean().default(true),
	includeNumbers: z.boolean().default(true),
	includeSymbols: z.boolean().default(true),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1, "Reset token is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Password = typeof passwords.$inferSelect;
export type InsertPassword = z.infer<typeof insertPasswordSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;

export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type PasswordGenerator = z.infer<typeof passwordGeneratorSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
