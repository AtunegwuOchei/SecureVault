import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  userId: integer("user_id").notNull().references(() => users.id),
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
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'breach', 'weak', 'reused'
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  passwordId: integer("password_id").references(() => passwords.id),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'login', etc.
  details: text("details"),
  ipAddress: text("ip_address").notNull().default(''),
  userAgent: text("user_agent").notNull().default(''),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, lastLogin: true })
  .extend({
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export const insertPasswordSchema = createInsertSchema(passwords).omit({
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true,
  strength: true
});

export const updatePasswordSchema = insertPasswordSchema.partial();

export const passwordGeneratorSchema = z.object({
  length: z.number().min(8).max(128).default(16),
  includeUppercase: z.boolean().default(true),
  includeLowercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSymbols: z.boolean().default(true),
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
