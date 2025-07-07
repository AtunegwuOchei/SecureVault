// server/routes.ts
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // Assuming storage.ts exists and has necessary functions
import {
  configureSession,
  isAuthenticated,
  login,
  register,
  logout,
  getCurrentUser,
  biometricLogin
} from "./auth";
import {
  calculatePasswordStrength,
  generatePassword as generatePasswordUtil,
  isValidEmail,
  isStrongPassword,
  hashPassword,
} from "./utils";
import { emailService } from "./email";
import { passwordResetService } from "./password-reset";
import {
  insertPasswordSchema,
  updatePasswordSchema,
  loginUserSchema,
  insertUserSchema,
  passwordGeneratorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createTeamSchema,
  sharePasswordSchema,
  createSharedVaultSchema,
  emergencyAccessSchema,
  type PasswordGenerator,
} from "@shared/schema";

// Rate limiting store (simple in-memory for demo; replace with Redis or DB in production)
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000; // 15 mins block

interface AuthenticatedRequest extends Request {
  session: Request['session'] & {
    userId?: number;
  };
}

function handleServerError(res: Response, message = "Internal Server Error") {
  return res.status(500).json({ message });
}

// Rate limiter middleware for login route
async function loginRateLimiter(req: Request, res: Response, next: () => void) {
  const ip = (req.headers["x-forwarded-for"] || req.ip) as string;
  const now = Date.now();

  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: now };
  }

  const attemptInfo = loginAttempts[ip];

  // Reset count if last attempt was long ago
  if (now - attemptInfo.lastAttempt > BLOCK_TIME_MS) {
    attemptInfo.count = 0;
  }

  attemptInfo.lastAttempt = now;

  if (attemptInfo.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many login attempts. Please try again after 15 minutes.",
    });
  }

  // Proceed to login route handler
  res.locals.loginAttemptInfo = attemptInfo;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session & cookies
  configureSession(app);

  // ----- AUTH ROUTES -----
  app.post(
    "/api/auth/login",
    loginRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const result = loginUserSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        // Call login logic and check result properly
        await login(req, res);

        // If we get here, login was successful
        const attemptInfo = res.locals.loginAttemptInfo;
        if (attemptInfo) {
          attemptInfo.count = 0;
        }

      } catch (error) {
        console.error(
          "Login error:",
          error instanceof Error ? error.message : error
        );

        // Increment attempt count on failure
        const attemptInfo = res.locals.loginAttemptInfo;
        if (attemptInfo) {
          attemptInfo.count++;
        }

        return handleServerError(res, "An error occurred during login");
      }
    }
  );

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.errors[0].message,
        });
      }

      const { email, password } = result.data;

      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message: "Password is too weak. It must have uppercase, lowercase, numbers, symbols and be at least 8 characters long.",
        });
      }

      await register(req, res);
    } catch (error) {
      console.error(
        "Registration error:",
        error instanceof Error ? error.message : error
      );
      return handleServerError(res, "An error occurred during registration");
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      await logout(req, res);
    } catch (error) {
      console.error(
        "Logout error:",
        error instanceof Error ? error.message : error
      );
      return handleServerError(res, "Failed to logout");
    }
  });

  app.post("/api/auth/biometric", biometricLogin);

  app.post("/api/auth/biometric/setup", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { credentialId, publicKey } = req.body;
      await storage.storeBiometricCredential(req.session.userId!, credentialId, publicKey);
      res.json({ message: "Biometric credentials stored successfully" });
    } catch (error) {
      console.error("Error storing biometric credentials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      await getCurrentUser(req, res);
    } catch (error) {
      console.error(
        "Get current user error:",
        error instanceof Error ? error.message : error
      );
      return handleServerError(res, "Failed to get current user");
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const result = forgotPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.errors[0].message,
        });
      }

      const { email } = result.data;

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If that email is registered, we've sent a reset link" });
      }

      // Generate reset token
      const resetToken = await passwordResetService.createResetToken(user.id);

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

      // Send email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // In development, still allow the process to continue
        if (process.env.NODE_ENV !== "development") {
          return res.status(500).json({ message: "Failed to send reset email" });
        }
      }

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
        action: "password_reset_requested",
        details: "Password reset email sent",
        ipAddress: (req.headers["x-forwarded-for"] || req.ip) as string || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.json({ message: "If that email is registered, we've sent a reset link" });
    } catch (error) {
      console.error("Forgot password error:", error);
      return handleServerError(res, "An error occurred while processing your request");
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const result = resetPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.errors[0].message,
        });
      }

      const { token, password } = result.data;

      // Verify token
      const tokenData = await passwordResetService.verifyResetToken(token);
      if (!tokenData) {
        return res.status(400).json({ 
          message: "Invalid or expired reset token" 
        });
      }

      // Check password strength
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message: "Password is too weak. It must have uppercase, lowercase, numbers, symbols and be at least 8 characters long.",
        });
      }

      // Hash new password
      const { hash, salt } = await hashPassword(password);

      // Update user password
      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUserPassword(tokenData.userId, hash, salt);

      // Mark token as used
      await passwordResetService.consumeResetToken(token);

      // Log activity
      await storage.createActivityLog({
        userId: tokenData.userId,
        action: "password_reset_completed",
        details: "Password successfully reset",
        ipAddress: (req.headers["x-forwarded-for"] || req.ip) as string || "",
        userAgent: req.headers["user-agent"] || "",
      });

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      return handleServerError(res, "An error occurred while resetting your password");
    }
  });

  // ----- PASSWORD ROUTES -----
  app.get(
    "/api/passwords",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const passwords = await storage.getPasswordsByUserId(userId);
        res.json(passwords);
      } catch (error) {
        console.error("Get passwords error:", error);
        return handleServerError(res, "Failed to retrieve passwords");
      }
    }
  );

  app.get(
    "/api/passwords/:id",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const passwordId = parseInt(req.params.id);
        if (isNaN(passwordId) || passwordId <= 0) {
          return res.status(400).json({ message: "Invalid password ID" });
        }

        const password = await storage.getPasswordById(passwordId, userId);
        if (!password) {
          return res.status(404).json({ message: "Password not found" });
        }

        res.json(password);
      } catch (error) {
        console.error("Get password error:", error);
        return handleServerError(res, "Failed to retrieve password");
      }
    }
  );

  app.post(
    "/api/passwords",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = insertPasswordSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        // Calculate password strength and add it to the data
        const strength = calculatePasswordStrength(result.data.encryptedPassword);
        const passwordData = { ...result.data, strength };

        const newPassword = await storage.createPassword(passwordData, userId);

        // Log activity
        await storage.createActivityLog({
          userId,
          action: "create_password",
          details: `Created password for ${newPassword.title}`,
          ipAddress: (req.headers["x-forwarded-for"] || req.ip) as string || "",
          userAgent: req.headers["user-agent"] || "",
        });

        res.status(201).json(newPassword);
      } catch (error) {
        console.error("Create password error:", error);
        return handleServerError(res, "Failed to create password");
      }
    }
  );

  app.put(
    "/api/passwords/:id",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const passwordId = parseInt(req.params.id);
        if (isNaN(passwordId) || passwordId <= 0) {
          return res.status(400).json({ message: "Invalid password ID" });
        }

        const result = updatePasswordSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        // Calculate strength if password is being updated
        let updateData = result.data;
        if (result.data.encryptedPassword) {
          const strength = calculatePasswordStrength(result.data.encryptedPassword);
          updateData = { ...result.data, strength } as typeof result.data & { strength: number };
        }

        const updatedPassword = await storage.updatePassword(
          passwordId,
          userId,
          updateData
        );

        if (!updatedPassword) {
          return res.status(404).json({ message: "Password not found" });
        }

        // Log activity
        await storage.createActivityLog({
          userId,
          action: "update_password",
          details: `Updated password for ${updatedPassword.title}`,
          ipAddress: (req.headers["x-forwarded-for"] || req.ip) as string || "",
          userAgent: req.headers["user-agent"] || "",
        });

        res.json(updatedPassword);
      } catch (error) {
        console.error("Update password error:", error);
        return handleServerError(res, "Failed to update password");
      }
    }
  );

  app.delete(
    "/api/passwords/:id",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const passwordId = parseInt(req.params.id);
        if (isNaN(passwordId) || passwordId <= 0) {
          return res.status(400).json({ message: "Invalid password ID" });
        }

        const success = await storage.deletePassword(passwordId, userId);
        if (!success) {
          return res.status(404).json({ message: "Password not found" });
        }

        // Log activity
        await storage.createActivityLog({
          userId,
          action: "delete_password",
          details: `Deleted password with id ${passwordId}`,
          ipAddress: (req.headers["x-forwarded-for"] || req.ip) as string || "",
          userAgent: req.headers["user-agent"] || "",
        });

        res.json({ message: "Password deleted successfully" });
      } catch (error) {
        console.error("Delete password error:", error);
        return handleServerError(res, "Failed to delete password");
      }
    }
  );

  // ----- STATS ROUTES -----
  app.get(
    "/api/password-stats",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const stats = await storage.getPasswordStats(userId);
        res.json(stats);
      } catch (error) {
        console.error("Get password stats error:", error);
        return handleServerError(res, "Failed to retrieve password statistics");
      }
    }
  );

  // ----- SECURITY ALERTS ROUTES -----
    app.get("/api/security-alerts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const alerts = await storage.getSecurityAlertsByUserId(req.session.userId!);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching security alerts:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  // Enterprise Features Routes

  // Shared Vaults
  app.get("/api/shared-vaults", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const vaults = await storage.getSharedVaultsForUser(req.session.userId!);
      res.json(vaults);
    } catch (error) {
      console.error("Error fetching shared vaults:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  app.post("/api/shared-vaults", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = createSharedVaultSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        const vault = await storage.createSharedVault({
          ...result.data,
          ownerId: userId
        });

        res.status(201).json(vault);
    } catch (error) {
      console.error("Error creating shared vault:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  // Password Sharing
  app.get("/api/password-shares", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const sharedWithMe = await storage.getSharedPasswordsForUser(userId);
        const sharedByMe = await storage.getSharedPasswordsByOwner(userId);

        res.json({
          sharedWithMe,
          sharedByMe
        });
    } catch (error) {
      console.error("Error fetching password shares:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  app.post("/api/password-shares", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // Handle both old schema and email-based sharing
        const { passwordId, sharedWithUserEmail, sharedWithUserId, ...restData } = req.body;

        if (!passwordId || isNaN(parseInt(passwordId))) {
          return res.status(400).json({ message: "Valid password ID is required" });
        }

        let shareData = {
          passwordId: parseInt(passwordId),
          sharedByUserId: userId,
          ...restData,
          expiresAt: restData.expiresAt ? new Date(restData.expiresAt) : undefined
        };

        // If email is provided, try to find the user
        if (sharedWithUserEmail) {
          const targetUser = await storage.getUserByEmail(sharedWithUserEmail);
          if (targetUser) {
            shareData.sharedWithUserId = targetUser.id;
          } else {
            return res.status(404).json({ 
              message: "User with this email not found. They need to create an account first." 
            });
          }
        } else if (sharedWithUserId) {
          shareData.sharedWithUserId = sharedWithUserId;
        } else {
          return res.status(400).json({ 
            message: "Either sharedWithUserEmail or sharedWithUserId is required" 
          });
        }

        // Verify user owns the password
        const password = await storage.getPasswordById(shareData.passwordId, userId);
        if (!password) {
          return res.status(404).json({ message: "Password not found" });
        }

        const sharedPassword = await storage.sharePassword(shareData);

        res.status(201).json(sharedPassword);
    } catch (error) {
      console.error("Error creating password share:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  // Emergency Access
  app.get("/api/emergency-contacts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const emergencyContacts = await storage.getEmergencyAccessByGrantor(userId);
        res.json(emergencyContacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  app.post("/api/emergency-contacts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = emergencyAccessSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        const emergencyAccess = await storage.createEmergencyAccess({
          grantorId: userId,
          emergencyContactEmail: result.data.emergencyContactEmail,
          accessLevel: result.data.accessLevel,
          waitingPeriod: result.data.waitingPeriod
        });

        res.status(201).json(emergencyAccess);
    } catch (error) {
      console.error("Error creating emergency contact:", error);
      return handleServerError(res, "Internal server error");
    }
  });

  app.post(
    "/api/security-alerts/:id/resolve",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const alertId = parseInt(req.params.id);
        if (isNaN(alertId) || alertId <= 0) {
          return res.status(400).json({ message: "Invalid alert ID" });
        }

        const success = await storage.resolveSecurityAlert(alertId, userId);
        if (!success) {
          return res.status(404).json({ message: "Security alert not found" });
        }

        res.json({ message: "Alert resolved successfully" });
      } catch (error) {
        console.error("Resolve alert error:", error);
        return handleServerError(res, "Failed to resolve alert");
      }
    }
  );

  // ----- ACTIVITY LOGS -----
  app.get(
    "/api/activity-logs",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const logs = await storage.getActivityLogsByUserId(userId, 20);
        res.json(logs);
      } catch (error) {
        console.error("Get activity logs error:", error);
        return handleServerError(res, "Failed to retrieve activity logs");
      }
    }
  );

  // Add a health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

  // ----- BROWSER EXTENSION ENDPOINTS -----

  // Extension authentication endpoint (already exists, but note for future)
  app.post("/api/extension/auth", async (req: Request, res: Response) => {
    try {
      const { extensionId, userId } = req.body;

      // Verify user is authenticated
      if (!req.session.userId || req.session.userId !== parseInt(userId)) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Generate extension token (store this in your database in production)
      const extensionToken = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production, store this mapping: extensionToken -> userId
      // For now, we'll just return it

      res.json({ 
        extensionToken,
        apiEndpoint: `${req.protocol}://${req.get('host')}/api`
      });
    } catch (error) {
      console.error("Extension auth error:", error);
      return handleServerError(res, "Failed to authenticate extension");
    }
  });

  // Extension password access (for autofill)
  app.get("/api/extension/passwords", async (req: Request, res: Response) => {
    try {
      const extensionToken = req.headers['x-extension-token'] as string;
      const domain = req.query.domain as string;

      if (!extensionToken) {
        return res.status(401).json({ message: "Extension token required" });
      }

      // In production, verify extensionToken and get userId
      // For demo, we'll use session if available
      if (!req.session.userId) {
        return res.status(401).json({ message: "Session expired" });
      }

      const passwords = await storage.getPasswordsByUserId(req.session.userId);

      // Filter passwords by domain if provided
      const filteredPasswords = domain 
        ? passwords.filter(p => p.url?.includes(domain)) // Changed 'website' to 'url' based on schema.ts
        : passwords;

      // Return only necessary fields for extension
      const extensionPasswords = filteredPasswords.map(p => ({
        id: p.id,
        title: p.title,
        url: p.url, // Changed 'website' to 'url'
        username: p.username,
        encryptedPassword: p.encryptedPassword // Include encrypted password for client-side decryption
      }));

      res.json(extensionPasswords);
    } catch (error) {
      console.error("Extension get passwords error:", error);
      return handleServerError(res, "Failed to get passwords for extension");
    }
  });

  // NEW: Extension Sync Data Endpoint
  app.post( // Changed to POST to allow body for lastSyncTimestamp
    "/api/extension/sync-data",
    isAuthenticated, // Ensure only authenticated users can sync
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) {
          // This should ideally be caught by isAuthenticated, but as a safeguard
          return res.status(401).json({ message: "Unauthorized" });
        }

        const lastSyncTimestamp = req.body.lastSyncTimestamp ? new Date(req.body.lastSyncTimestamp as string) : undefined;

        // Fetch updated passwords
        const updatedPasswords = await storage.getUpdatedPasswordsByUserId(userId, lastSyncTimestamp);

        // Fetch updated settings (placeholder - assuming a settings model with updatedAt)
        const updatedUserSettings = await storage.getUpdatedUserSettingsByUserId(userId, lastSyncTimestamp);

        // Get current server time for the next sync
        const serverTime = new Date().toISOString();

        res.json({
          updatedPasswords: updatedPasswords.map(p => ({
            id: p.id,
            title: p.title,
            username: p.username,
            encryptedPassword: p.encryptedPassword,
            url: p.url,
            notes: p.notes,
            category: p.category,
            isFavorite: p.isFavorite,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            strength: p.strength,
          })),
          updatedUserSettings: updatedUserSettings, // Assuming settings are returned as-is
          serverTime: serverTime,
        });
      } catch (error) {
        console.error("Extension sync data error:", error);
        return handleServerError(res, "Failed to sync data with extension");
      }
    }
  );

  // ----- PASSWORD GENERATOR -----
  app.post(
    "/api/generate-password",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const result = passwordGeneratorSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = result.data;

        const password = generatePasswordUtil(
          length,
          includeUppercase,
          includeLowercase,
          includeNumbers,
          includeSymbols
        );

        const strength = calculatePasswordStrength(password);

        res.json({ password, strength });
      } catch (error) {
        console.error("Generate password error:", error);
        return handleServerError(res, "Failed to generate password");
      }
    }
  );

  // ----- TEAM MANAGEMENT ROUTES -----
  app.get(
    "/api/teams",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const teams = await storage.getTeamsByUserId(userId);
        res.json(teams);
      } catch (error) {
        console.error("Get teams error:", error);
        return handleServerError(res, "Failed to retrieve teams");
      }
    }
  );

  app.post(
    "/api/teams",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = createTeamSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        const team = await storage.createTeam({
          ...result.data,
          ownerId: userId
        });

        res.status(201).json(team);
      } catch (error) {
        console.error("Create team error:", error);
        return handleServerError(res, "Failed to create team");
      }
    }
  );

  app.get(
    "/api/teams/:id/members",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const teamId = parseInt(req.params.id);
        if (isNaN(teamId)) {
          return res.status(400).json({ message: "Invalid team ID" });
        }

        const members = await storage.getTeamMembers(teamId);
        res.json(members);
      } catch (error) {
        console.error("Get team members error:", error);
        return handleServerError(res, "Failed to retrieve team members");
      }
    }
  );

  // ----- PASSWORD SHARING ROUTES -----
  app.post(
    "/api/passwords/:id/share",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const passwordId = parseInt(req.params.id);
        if (isNaN(passwordId)) {
          return res.status(400).json({ message: "Invalid password ID" });
        }

        // Handle both old schema and email-based sharing
        const { sharedWithUserEmail, sharedWithUserId, ...restData } = req.body;

        let shareData = {
          passwordId,
          sharedByUserId: userId,
          ...restData,
          expiresAt: restData.expiresAt ? new Date(restData.expiresAt) : undefined
        };

        // If email is provided, try to find the user
        if (sharedWithUserEmail) {
          const targetUser = await storage.getUserByEmail(sharedWithUserEmail);
          if (targetUser) {
            shareData.sharedWithUserId = targetUser.id;
          } else {
            return res.status(404).json({ 
              message: "User with this email not found. They need to create an account first." 
            });
          }
        } else if (sharedWithUserId) {
          shareData.sharedWithUserId = sharedWithUserId;
        } else {
          return res.status(400).json({ 
            message: "Either sharedWithUserEmail or sharedWithUserId is required" 
          });
        }

        // Verify user owns the password
        const password = await storage.getPasswordById(passwordId, userId);
        if (!password) {
          return res.status(404).json({ message: "Password not found" });
        }

        const sharedPassword = await storage.sharePassword(shareData);

        res.status(201).json(sharedPassword);
      } catch (error) {
        console.error("Share password error:", error);
        return handleServerError(res, "Failed to share password");
      }
    }
  );

  app.get(
    "/api/shared-passwords",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const sharedWithMe = await storage.getSharedPasswordsForUser(userId);
        const sharedByMe = await storage.getSharedPasswordsByOwner(userId);

        res.json({
          sharedWithMe,
          sharedByMe
        });
      } catch (error) {
        console.error("Get shared passwords error:", error);
        return handleServerError(res, "Failed to retrieve shared passwords");
      }
    }
  );

  // ----- SHARED VAULT ROUTES -----
  app.get(
    "/api/shared-vaults",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const vaults = await storage.getSharedVaultsForUser(userId);
        res.json(vaults);
      } catch (error) {
        console.error("Get shared vaults error:", error);
        return handleServerError(res, "Failed to retrieve shared vaults");
      }
    }
  );

  app.post(
    "/api/shared-vaults",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = createSharedVaultSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        const vault = await storage.createSharedVault({
          ...result.data,
          ownerId: userId
        });

        res.status(201).json(vault);
      } catch (error) {
        console.error("Create shared vault error:", error);
        return handleServerError(res, "Failed to create shared vault");
      }
    }
  );

  app.get(
    "/api/shared-vaults/:id/passwords",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const vaultId = parseInt(req.params.id);
        if (isNaN(vaultId)) {
          return res.status(400).json({ message: "Invalid vault ID" });
        }

        const passwords = await storage.getVaultPasswords(vaultId, userId);
        res.json(passwords);
      } catch (error) {
        console.error("Get vault passwords error:", error);
        if (error.message === "Access denied to vault") {
          return res.status(403).json({ message: "Access denied to vault" });
        }
        return handleServerError(res, "Failed to retrieve vault passwords");
      }
    }
  );

  app.post(
    "/api/shared-vaults/:id/passwords",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const vaultId = parseInt(req.params.id);
        const { passwordId } = req.body;

        if (isNaN(vaultId) || !passwordId) {
          return res.status(400).json({ message: "Invalid vault or password ID" });
        }

        // Verify user owns the password
        const password = await storage.getPasswordById(passwordId, userId);
        if (!password) {
          return res.status(404).json({ message: "Password not found" });
        }

        const entry = await storage.addPasswordToVault(vaultId, passwordId, userId);
        res.status(201).json(entry);
      } catch (error) {
        console.error("Add password to vault error:", error);
        return handleServerError(res, "Failed to add password to vault");
      }
    }
  );

  // ----- EMERGENCY ACCESS ROUTES -----
  app.get(
    "/api/emergency-access",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const emergencyContacts = await storage.getEmergencyAccessByGrantor(userId);
        res.json(emergencyContacts);
      } catch (error) {
        console.error("Get emergency access error:", error);
        return handleServerError(res, "Failed to retrieve emergency access");
      }
    }
  );

  app.post(
    "/api/emergency-access",
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const result = emergencyAccessSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: result.error.errors[0].message,
          });
        }

        const emergencyAccess = await storage.createEmergencyAccess({
          grantorId: userId,
          emergencyContactEmail: result.data.emergencyContactEmail,
          accessLevel: result.data.accessLevel,
          waitingPeriod: result.data.waitingPeriod
        });

        res.status(201).json(emergencyAccess);
      } catch (error) {
        console.error("Create emergency access error:", error);
        return handleServerError(res, "Failed to create emergency access");
      }
    }
  );

  // Add CORS headers middleware if needed
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', error);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  });

  // Start HTTP server and return it for app.listen usage
  return createServer(app);
}