// server/storage.ts
import { eq, and, desc, sql, gt } from "drizzle-orm";
import { db } from "./db";
import {
	users,
	passwords,
	securityAlerts,
	activityLogs,
	passwordResetTokens,
	teams,
	teamMembers,
	sharedPasswords,
	sharedVaults,
	sharedVaultMembers,
	sharedVaultPasswords,
	emergencyAccess,
	type User,
	type InsertUser,
	type Password,
	type InsertPassword,
	type UpdatePassword,
	type SecurityAlert,
	type ActivityLog,
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
	getUpdatedPasswordsByUserId(userId: number, lastSyncTimestamp?: Date): Promise<Password[]>; // Added for polling

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

	// Team methods
	createTeam(data: { name: string; description?: string; ownerId: number }): Promise<any>;
	getTeamsByUserId(userId: number): Promise<any>;
	getTeamMembers(teamId: number): Promise<any>;

	// Password sharing methods
	sharePassword(data: {
		passwordId: number;
		sharedByUserId: number;
		sharedWithUserId?: number;
		teamId?: number;
		permissions: string;
		expiresAt?: Date;
	}): Promise<any>;
	getSharedPasswordsForUser(userId: number): Promise<any>;
	getSharedPasswordsByOwner(userId: number): Promise<any>;

	// Shared vault methods
	createSharedVault(data: {
		name: string;
		description?: string;
		ownerId: number;
		teamId?: number;
		isPublic?: boolean;
	}): Promise<any>;
	getSharedVaultsForUser(userId: number): Promise<any>;
	getVaultPasswords(vaultId: number, userId: number): Promise<any>;
	addPasswordToVault(vaultId: number, passwordId: number, userId: number): Promise<any>;

	// Emergency access methods
	createEmergencyAccess(data: {
		grantorId: number;
		emergencyContactId: number;
		accessLevel: string;
		waitingPeriod: number;
	}): Promise<any>;
	getEmergencyAccessByGrantor(grantorId: number): Promise<any>;

	// Biometric credential storage methods
	storeBiometricCredential(userId: number, credentialId: string, publicKey: string): Promise<void>;
	getBiometricCredential(userId: number, credentialId: string): Promise<any>;

	// Enterprise Features Storage Methods (should align with above)
	getSharedVaults(userId: number): Promise<any[]>;
	createSharedVault(userId: number, vaultData: any): Promise<any>;
	getPasswordShares(userId: number): Promise<any[]>;
	createPasswordShare(userId: number, shareData: any): Promise<any>;
	getEmergencyContacts(userId: number): Promise<any[]>;
	createEmergencyContact(userId: number, contactData: any): Promise<any>;

	// New: For extension polling
	getUpdatedUserSettingsByUserId(userId: number, lastSyncTimestamp?: Date): Promise<User | undefined>;
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

	// NEW: Get updated passwords for polling
	async getUpdatedPasswordsByUserId(userId: number, lastSyncTimestamp?: Date): Promise<Password[]> {
		let query = db
			.select()
			.from(passwords)
			.where(eq(passwords.userId, userId))
			.$dynamic(); // Enable dynamic WHERE clause

		if (lastSyncTimestamp) {
			query = query.where(gt(passwords.updatedAt, lastSyncTimestamp));
		}

		// Always order to ensure consistent results, useful for debugging
		query = query.orderBy(desc(passwords.updatedAt));

		return query;
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

	async consumeResetToken(token: string): Promise<void> {
		await db
			.update(passwordResetTokens)
			.set({ used: true })
			.where(eq(passwordResetTokens.token, token));
	}

	// Team methods
	async createTeam(data: { name: string; description?: string; ownerId: number }) {
		const [team] = await db.insert(teams).values(data).returning();

		// Add owner as team member
		await db.insert(teamMembers).values({
			teamId: team.id,
			userId: data.ownerId,
			role: "owner"
		});

		return team;
	}

	async getTeamsByUserId(userId: number) {
		return await db
			.select({
				id: teams.id,
				name: teams.name,
				description: teams.description,
				ownerId: teams.ownerId,
				role: teamMembers.role,
				memberCount: sql<number>`count(${teamMembers.userId})`,
				createdAt: teams.createdAt
			})
			.from(teams)
			.innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
			.where(eq(teamMembers.userId, userId))
			.groupBy(teams.id, teamMembers.role);
	}

	async getTeamMembers(teamId: number) {
		return await db
			.select({
				id: teamMembers.id,
				userId: users.id,
				email: users.email,
				name: users.name,
				role: teamMembers.role,
				joinedAt: teamMembers.joinedAt
			})
			.from(teamMembers)
			.innerJoin(users, eq(teamMembers.userId, users.id))
			.where(eq(teamMembers.teamId, teamId));
	}

	// Password sharing methods
	async sharePassword(data: {
		passwordId: number;
		sharedByUserId: number;
		sharedWithUserId?: number;
		teamId?: number;
		permissions: string;
		expiresAt?: Date;
	}) {
		const [shared] = await db.insert(sharedPasswords).values(data).returning();
		return shared;
	}

	async getSharedPasswordsForUser(userId: number) {
		return await db
			.select({
				id: sharedPasswords.id,
				passwordId: passwords.id,
				title: passwords.title,
				username: passwords.username,
				url: passwords.url,
				category: passwords.category,
				strength: passwords.strength,
				permissions: sharedPasswords.permissions,
				sharedBy: users.name,
				sharedByEmail: users.email,
				expiresAt: sharedPasswords.expiresAt,
				createdAt: sharedPasswords.createdAt
			})
			.from(sharedPasswords)
			.innerJoin(passwords, eq(sharedPasswords.passwordId, passwords.id))
			.innerJoin(users, eq(sharedPasswords.sharedByUserId, users.id))
			.where(eq(sharedPasswords.sharedWithUserId, userId));
	}

	async getSharedPasswordsByOwner(userId: number) {
		return await db
			.select({
				id: sharedPasswords.id,
				passwordId: passwords.id,
				title: passwords.title,
				sharedWith: users.name,
				sharedWithEmail: users.email,
				permissions: sharedPasswords.permissions,
				expiresAt: sharedPasswords.expiresAt,
				createdAt: sharedPasswords.createdAt
			})
			.from(sharedPasswords)
			.innerJoin(passwords, eq(sharedPasswords.passwordId, passwords.id))
			.leftJoin(users, eq(sharedPasswords.sharedWithUserId, users.id))
			.where(eq(sharedPasswords.sharedByUserId, userId));
	}

	// Shared vault methods
	async createSharedVault(data: {
		name: string;
		description?: string;
		ownerId: number;
		teamId?: number;
		isPublic?: boolean;
	}) {
		const [vault] = await db.insert(sharedVaults).values(data).returning();

		// Add owner as vault member
		await db.insert(sharedVaultMembers).values({
			vaultId: vault.id,
			userId: data.ownerId,
			permissions: "admin",
			invitedByUserId: data.ownerId
		});

		return vault;
	}

	async getSharedVaultsForUser(userId: number) {
		return await db
			.select({
				id: sharedVaults.id,
				name: sharedVaults.name,
				description: sharedVaults.description,
				ownerId: sharedVaults.ownerId,
				isOwner: sql<boolean>`${sharedVaults.ownerId} = ${userId}`,
				permissions: sharedVaultMembers.permissions,
				passwordCount: sql<number>`count(${sharedVaultPasswords.passwordId})`,
				createdAt: sharedVaults.createdAt
			})
			.from(sharedVaults)
			.innerJoin(sharedVaultMembers, eq(sharedVaults.id, sharedVaultMembers.vaultId))
			.leftJoin(sharedVaultPasswords, eq(sharedVaults.id, sharedVaultPasswords.vaultId))
			.where(eq(sharedVaultMembers.userId, userId))
			.groupBy(sharedVaults.id, sharedVaultMembers.permissions);
	}

	async getVaultPasswords(vaultId: number, userId: number) {
		// Check if user has access to vault
		const access = await db
			.select()
			.from(sharedVaultMembers)
			.where(
				and(
					eq(sharedVaultMembers.vaultId, vaultId),
					eq(sharedVaultMembers.userId, userId)
				)
			)
			.limit(1);

		if (access.length === 0) {
			throw new Error("Access denied to vault");
		}

		return await db
			.select({
				id: passwords.id,
				title: passwords.title,
				username: passwords.username,
				encryptedPassword: passwords.encryptedPassword,
				url: passwords.url,
				notes: passwords.notes,
				category: passwords.category,
				strength: passwords.strength,
				addedBy: users.name,
				addedAt: sharedVaultPasswords.createdAt
			})
			.from(sharedVaultPasswords)
			.innerJoin(passwords, eq(sharedVaultPasswords.passwordId, passwords.id))
			.innerJoin(users, eq(sharedVaultPasswords.addedByUserId, users.id))
			.where(eq(sharedVaultPasswords.vaultId, vaultId));
	}

	async addPasswordToVault(vaultId: number, passwordId: number, userId: number) {
		const [entry] = await db
			.insert(sharedVaultPasswords)
			.values({
				vaultId,
				passwordId,
				addedByUserId: userId
			})
			.returning();
		return entry;
	}

	// Emergency access methods
	async createEmergencyAccess(data: {
		grantorId: number;
		emergencyContactEmail: string;
		accessLevel: string;
		waitingPeriod: number;
	}) {
		// Try to find the user by email first
		const emergencyContact = await this.getUserByEmail(data.emergencyContactEmail);

		if (emergencyContact) {
			// User exists, use their ID
			const [access] = await db.insert(emergencyAccess).values({
				grantorId: data.grantorId,
				emergencyContactId: emergencyContact.id,
				accessLevel: data.accessLevel,
				waitingPeriod: data.waitingPeriod
			}).returning();
			return access;
		} else {
			// For demo purposes, create a placeholder record
			// In production, you'd send an invitation email
			const [access] = await db.insert(emergencyAccess).values({
				grantorId: data.grantorId,
				emergencyContactId: -1, // Placeholder for non-existent user
				accessLevel: data.accessLevel,
				waitingPeriod: data.waitingPeriod
			}).returning();
			return { ...access, emergencyContactEmail: data.emergencyContactEmail };
		}
	}

	async getEmergencyAccessByGrantor(grantorId: number) {
		const results = await db
			.select({
				id: emergencyAccess.id,
				emergencyContactId: emergencyAccess.emergencyContactId,
				accessLevel: emergencyAccess.accessLevel,
				waitingPeriod: emergencyAccess.waitingPeriod,
				isActive: emergencyAccess.isActive,
				createdAt: emergencyAccess.createdAt
			})
			.from(emergencyAccess)
			.where(eq(emergencyAccess.grantorId, grantorId));

		// For each result, try to get the user info
		const enrichedResults = await Promise.all(
			results.map(async (result) => {
				if (result.emergencyContactId > 0) {
					const user = await this.getUser(result.emergencyContactId);
					return {
						...result,
						emergencyContactName: user?.name || "Unknown User",
						emergencyContactEmail: user?.email || "unknown@example.com"
					};
				} else {
					// This is a placeholder record for a non-existent user
					return {
						...result,
						emergencyContactName: "Pending User",
						emergencyContactEmail: "invite-pending@example.com"
					};
				}
			})
		);

		return enrichedResults;
	}

	async storeBiometricCredential(userId: number, credentialId: string, publicKey: string): Promise<void> {
		// For now, we'll store this in the user's metadata or create a simple table
		// In production, you'd want a proper biometric_credentials table
		await db
			.update(users)
			.set({ 
				metadata: JSON.stringify({ 
					biometricCredential: { id: credentialId, publicKey } 
				}) 
			})
			.where(eq(users.id, userId));
	}

	async getBiometricCredential(userId: number, credentialId: string): Promise<any> {
		const user = await this.getUser(userId);
		if (!user?.metadata) return null;

		try {
			const metadata = JSON.parse(user.metadata as string);
			const credential = metadata?.biometricCredential;
			return credential?.id === credentialId ? credential : null;
		} catch {
			return null;
		}
	}

	// NEW: Get updated user settings for polling
	async getUpdatedUserSettingsByUserId(userId: number, lastSyncTimestamp?: Date): Promise<User | undefined> {
		let query = db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.$dynamic(); // Enable dynamic WHERE clause

		if (lastSyncTimestamp) {
			// Assuming 'users' table has an 'updatedAt' column
			query = query.where(gt(users.updatedAt, lastSyncTimestamp));
		}

		const [user] = await query; // Get the user object itself if it was updated
		return user;
	}

	// Enterprise Features Storage Methods - Remove mock implementations
	// The real implementations are above in the main storage methods

	async getPasswordShares(userId: number): Promise<any[]> {
		// Mock implementation
		return [
			{
				id: 1,
				passwordTitle: "Company WiFi",
				sharedWith: "john@company.com",
				permissions: "view",
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				createdAt: new Date().toISOString(),
			}
		];
	}

	async createPasswordShare(userId: number, shareData: any): Promise<any> {
		// Mock implementation
		return {
			id: Math.floor(Math.random() * 1000),
			...shareData,
			sharedBy: userId,
			createdAt: new Date().toISOString(),
		};
	}

	async getEmergencyContacts(userId: number): Promise<any[]> {
		// Mock implementation
		return [
			{
				id: 1,
				name: "Jane Doe",
				email: "jane@family.com",
				waitingPeriod: 72,
				status: "active",
				createdAt: new Date().toISOString(),
			}
		];
	}

	async createEmergencyContact(userId: number, contactData: any): Promise<any> {
		// Mock implementation
		return {
			id: Math.floor(Math.random() * 1000),
			...contactData,
			userId,
			status: "pending",
			createdAt: new Date().toISOString(),
		};
	}
}

export const storage = new DatabaseStorage();