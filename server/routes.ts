import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { configureSession, isAuthenticated, login, register, logout, getCurrentUser } from "./auth";
import { calculatePasswordStrength, generatePassword } from "./utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  insertPasswordSchema,
  updatePasswordSchema,
  loginUserSchema,
  insertUserSchema,
  passwordGeneratorSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  configureSession(app);

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      
      await login(req, res);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      
      await register(req, res);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    logout(req, res);
  });

  app.get("/api/auth/me", async (req, res) => {
    await getCurrentUser(req, res);
  });

  // Password routes
  app.get("/api/passwords", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwords = await storage.getPasswordsByUserId(userId);
      res.json(passwords);
    } catch (error) {
      console.error("Get passwords error:", error);
      res.status(500).json({ message: "Failed to retrieve passwords" });
    }
  });

  app.get("/api/passwords/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwordId = parseInt(req.params.id);
      
      if (isNaN(passwordId)) {
        return res.status(400).json({ message: "Invalid password ID" });
      }
      
      const password = await storage.getPasswordById(passwordId, userId);
      
      if (!password) {
        return res.status(404).json({ message: "Password not found" });
      }
      
      res.json(password);
    } catch (error) {
      console.error("Get password error:", error);
      res.status(500).json({ message: "Failed to retrieve password" });
    }
  });

  app.post("/api/passwords", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const result = insertPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      
      // Calculate password strength
      const passwordStrength = calculatePasswordStrength(req.body.encryptedPassword);
      
      const newPassword = await storage.createPassword(
        { ...result.data },
        userId
      );
      
      // Log activity
      await storage.createActivityLog({
        userId,
        action: "create_password",
        details: `Created password for ${newPassword.title}`,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });
      
      res.status(201).json(newPassword);
    } catch (error) {
      console.error("Create password error:", error);
      res.status(500).json({ message: "Failed to create password" });
    }
  });

  app.put("/api/passwords/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwordId = parseInt(req.params.id);
      
      if (isNaN(passwordId)) {
        return res.status(400).json({ message: "Invalid password ID" });
      }
      
      const result = updatePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      
      const updatedPassword = await storage.updatePassword(
        passwordId,
        userId,
        result.data
      );
      
      if (!updatedPassword) {
        return res.status(404).json({ message: "Password not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        userId,
        action: "update_password",
        details: `Updated password for ${updatedPassword.title}`,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });
      
      res.json(updatedPassword);
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.delete("/api/passwords/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwordId = parseInt(req.params.id);
      
      if (isNaN(passwordId)) {
        return res.status(400).json({ message: "Invalid password ID" });
      }
      
      // Get the password before deleting for logging
      const password = await storage.getPasswordById(passwordId, userId);
      
      const deleted = await storage.deletePassword(passwordId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Password not found" });
      }
      
      // Log activity
      if (password) {
        await storage.createActivityLog({
          userId,
          action: "delete_password",
          details: `Deleted password for ${password.title}`,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        });
      }
      
      res.json({ message: "Password deleted successfully" });
    } catch (error) {
      console.error("Delete password error:", error);
      res.status(500).json({ message: "Failed to delete password" });
    }
  });

  // Security alert routes
  app.get("/api/security-alerts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const alerts = await storage.getSecurityAlertsByUserId(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Get security alerts error:", error);
      res.status(500).json({ message: "Failed to retrieve security alerts" });
    }
  });

  app.post("/api/security-alerts/:id/resolve", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      const resolved = await storage.resolveSecurityAlert(alertId, userId);
      
      if (!resolved) {
        return res.status(404).json({ message: "Security alert not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        userId,
        action: "resolve_alert",
        details: `Resolved security alert #${alertId}`,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });
      
      res.json({ message: "Security alert resolved successfully" });
    } catch (error) {
      console.error("Resolve security alert error:", error);
      res.status(500).json({ message: "Failed to resolve security alert" });
    }
  });

  // Activity log routes
  app.get("/api/activity-logs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const logs = await storage.getActivityLogsByUserId(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Get activity logs error:", error);
      res.status(500).json({ message: "Failed to retrieve activity logs" });
    }
  });

  // Password health/stats
  app.get("/api/password-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const stats = await storage.getPasswordStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Get password stats error:", error);
      res.status(500).json({ message: "Failed to retrieve password stats" });
    }
  });

  // Password generator
  app.post("/api/generate-password", isAuthenticated, async (req, res) => {
    try {
      const result = passwordGeneratorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }
      
      const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = result.data;
      
      const password = generatePassword(
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
      res.status(500).json({ message: "Failed to generate password" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
