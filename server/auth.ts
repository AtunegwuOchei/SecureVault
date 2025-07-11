import { Request, Response, NextFunction } from "express";
import { comparePassword, hashPassword } from "./utils";
import { storage } from "./storage";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import MemoryStore from "memorystore";

// Extend the session interface to include our custom properties
declare module "express-session" {
	interface Session {
		userId?: number;
	}
}

// Determine store based on environment
const getSessionStore = () => {
	if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
		const PgStore = pgSession(session);
		return new PgStore({
			pool,
			tableName: "user_sessions",
		});
	} else {
		const MemoryStoreFactory = MemoryStore(session);
		return new MemoryStoreFactory({
			checkPeriod: 86400000, // Prune expired entries every 24h
		});
	}
};

// Session middleware
export const configureSession = (app: any) => {
	app.use(
		session({
			store: getSessionStore(),
			secret: process.env.SESSION_SECRET || "secure-vault-secret",
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: process.env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
			},
		}),
	);
};

// Authentication middleware
export const isAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (req.session && req.session.userId !== undefined) {
		return next();
	}

	return res.status(401).json({ message: "Unauthorized" });
};

// Login handler
export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;

		const user = await storage.getUserByUsername(username);
		if (!user) {
			return res.status(401).json({ message: "Invalid username or password" });
		}

		const isPasswordValid = await comparePassword(password, user.password_hash);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid username or password" });
		}

		await storage.updateUserLastLogin(user.id);

		await storage.createActivityLog({
			userId: user.id,
			action: "login",
			details: "User logged in successfully",
			ipAddress: req.ip || "",
			userAgent: req.headers["user-agent"] || "",
		});

		req.session.userId = user.id;

		const { password_hash: _, salt: __, ...safeUser } = user;

		return res.json({
			user: safeUser,
			message: "Login successful",
		});
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({ message: "An error occurred during login" });
	}
};

// Register handler
export const register = async (req: Request, res: Response) => {
	try {
		const { username, password, email, name, confirmPassword } = req.body;

		// Check if user already exists
		const existingUser = await storage.getUserByUsername(username);
		if (existingUser) {
			return res.status(400).json({ message: "Username already exists" });
		}

		const existingEmail = await storage.getUserByEmail(email);
		if (existingEmail) {
			return res.status(400).json({ message: "Email already exists" });
		}

		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const { hash, salt } = await hashPassword(password);

		const user = await storage.createUser({
			username,
			password: hash, // This will be stored as password_hash
			email,
			name,
			confirmPassword, // This won't be stored, just for validation
			masterKeyHash: hash, // For demo purposes, same as password hash
			salt,
		});

		await storage.createActivityLog({
			userId: user.id,
			action: "register",
			details: "User registered successfully",
			ipAddress: req.ip || "",
			userAgent: req.headers["user-agent"] || "",
		});

		req.session.userId = user.id;

		const { password_hash: _, salt: __, ...safeUser } = user;

		return res.status(201).json({
			user: safeUser,
			message: "Registration successful",
		});
	} catch (error) {
		console.error("Registration error:", error);
		return res
			.status(500)
			.json({ message: "An error occurred during registration" });
	}
};

// Logout handler
export const logout = (req: Request, res: Response) => {
	if (req.session) {
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).json({ message: "Logout failed" });
			}
			res.clearCookie("connect.sid");
			return res.json({ message: "Logged out successfully" });
		});
	} else {
		return res.json({ message: "No active session" });
	}
};

// Biometric authentication
export const biometricLogin = async (req: Request, res: Response) => {
	try {
		const { username, credentialId, assertion } = req.body;

		const user = await storage.getUserByUsername(username);
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// In a real implementation, you would verify the WebAuthn assertion
		// For this demo, we'll just check that the user exists and has biometric enabled
		const biometricCredential = await storage.getBiometricCredential(user.id, credentialId);
		if (!biometricCredential) {
			return res.status(401).json({ message: "Invalid biometric credentials" });
		}

		await storage.updateUserLastLogin(user.id);

		await storage.createActivityLog({
			userId: user.id,
			action: "biometric_login",
			details: "User logged in using biometric authentication",
			ipAddress: req.ip || "",
			userAgent: req.headers["user-agent"] || "",
		});

		req.session.userId = user.id;

		const { password_hash: _, salt: __, ...safeUser } = user;

		return res.json({
			user: safeUser,
			message: "Biometric login successful",
			token: "biometric-session-token", // In production, use proper JWT
		});
	} catch (error) {
		console.error("Biometric login error:", error);
		return res.status(500).json({ message: "An error occurred during biometric authentication" });
	}
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		if (!req.session.userId) {
			return res.status(401).json({ message: "Not authenticated" });
		}

		const user = await storage.getUser(req.session.userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const { password_hash: _, salt: __, ...safeUser } = user;

		return res.json({ user: safeUser });
	} catch (error) {
		console.error("Get current user error:", error);
		return res.status(500).json({ message: "An error occurred" });
	}
};
