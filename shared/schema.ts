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

export const teams = pgTable("teams", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	ownerId: integer("owner_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
	id: serial("id").primaryKey(),
	teamId: integer("team_id")
		.notNull()
		.references(() => teams.id),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	role: text("role").notNull().default("member"), // 'owner', 'admin', 'member', 'viewer'
	joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const sharedPasswords = pgTable("shared_passwords", {
	id: serial("id").primaryKey(),
	passwordId: integer("password_id")
		.notNull()
		.references(() => passwords.id),
	sharedByUserId: integer("shared_by_user_id")
		.notNull()
		.references(() => users.id),
	sharedWithUserId: integer("shared_with_user_id")
		.references(() => users.id),
	teamId: integer("team_id")
		.references(() => teams.id),
	permissions: text("permissions").notNull().default("view"), // 'view', 'edit', 'admin'
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedVaults = pgTable("shared_vaults", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	ownerId: integer("owner_id")
		.notNull()
		.references(() => users.id),
	teamId: integer("team_id")
		.references(() => teams.id),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sharedVaultPasswords = pgTable("shared_vault_passwords", {
	id: serial("id").primaryKey(),
	vaultId: integer("vault_id")
		.notNull()
		.references(() => sharedVaults.id),
	passwordId: integer("password_id")
		.notNull()
		.references(() => passwords.id),
	addedByUserId: integer("added_by_user_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedVaultMembers = pgTable("shared_vault_members", {
	id: serial("id").primaryKey(),
	vaultId: integer("vault_id")
		.notNull()
		.references(() => sharedVaults.id),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	permissions: text("permissions").notNull().default("view"), // 'view', 'edit', 'admin'
	invitedByUserId: integer("invited_by_user_id")
		.notNull()
		.references(() => users.id),
	joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const emergencyAccess = pgTable("emergency_access", {
	id: serial("id").primaryKey(),
	grantorId: integer("grantor_id")
		.notNull()
		.references(() => users.id),
	emergencyContactId: integer("emergency_contact_id")
		.notNull()
		.references(() => users.id),
	accessLevel: text("access_level").notNull().default("view"), // 'view', 'takeover'
	waitingPeriod: integer("waiting_period").default(7), // days
	isActive: boolean("is_active").default(true),
	lastActivated: timestamp("last_activated"),
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
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  description: z.string().optional()
});

export const sharePasswordSchema = z.object({
	passwordId: z.number().min(1),
	sharedWithUserId: z.number().min(1).optional(),
	teamId: z.number().min(1).optional(),
	permissions: z.enum(["view", "edit", "admin"]).default("view"),
	expiresAt: z.string().optional(),
}).refine((data) => data.sharedWithUserId || data.teamId, {
	message: "Must share with either a user or team",
});

export const createSharedVaultSchema = z.object({
  name: z.string().min(1, "Vault name is required").max(100),
  description: z.string().optional(),
  teamId: z.number().min(1).optional(),
  isPublic: z.boolean().default(false),
});

export const inviteToVaultSchema = z.object({
	vaultId: z.number().min(1),
	userEmail: z.string().email("Invalid email format"),
	permissions: z.enum(["view", "edit", "admin"]).default("view"),
});

export const emergencyAccessSchema = z.object({
	emergencyContactEmail: z.string().email("Invalid email format"),
	accessLevel: z.enum(["view", "takeover"]).default("view"),
	waitingPeriod: z.number().min(1).max(30).default(7),
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

export type Team = typeof teams.$inferSelect;
export type CreateTeam = z.infer<typeof createTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type SharedPassword = typeof sharedPasswords.$inferSelect;
export type SharePassword = z.infer<typeof sharePasswordSchema>;
export type SharedVault = typeof sharedVaults.$inferSelect;
export type CreateSharedVault = z.infer<typeof createSharedVaultSchema>;
export type InviteToVault = z.infer<typeof inviteToVaultSchema>;
export type EmergencyAccess = typeof emergencyAccess.$inferSelect;
export type CreateEmergencyAccess = z.infer<typeof emergencyAccessSchema>;