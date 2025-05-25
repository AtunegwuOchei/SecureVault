import { Request, Response, NextFunction } from 'express';
import { comparePassword, hashPassword } from './utils';
import { storage } from './storage';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { pool } from './db';
import MemoryStore from 'memorystore';

// Extend the session interface to include our custom properties
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Determine store based on environment
const getSessionStore = () => {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // Use PostgreSQL in production
    const PgStore = pgSession(session);
    return new PgStore({
      pool,
      tableName: 'user_sessions',
    });
  } else {
    // Use memory store in development (with memory leak fix)
    const MemoryStoreFactory = MemoryStore(session);
    return new MemoryStoreFactory({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }
};

// Session middleware
export const configureSession = (app: any) => {
  app.use(
    session({
      store: getSessionStore(),
      secret: process.env.SESSION_SECRET || 'secure-vault-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
};

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId !== undefined) {
    return next();
  }
  
  res.status(401).json({ message: 'Unauthorized' });
};

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Update last login
    await storage.updateUserLastLogin(user.id);
    
    // Log activity
    await storage.createActivityLog({
      userId: user.id,
      action: 'login',
      details: 'User logged in successfully',
      ipAddress: String(req.ip || ''),
      userAgent: String(req.headers['user-agent'] || ''),
    });
    
    // Set session
    req.session.userId = user.id;
    
    // Don't return sensitive data
    const { password: _, masterKeyHash: __, salt: ___, ...safeUser } = user;
    
    res.json({ 
      user: safeUser,
      message: 'Login successful' 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

// Register handler
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, name, confirmPassword } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByUsername(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    // Hash password
    const { hash, salt } = await hashPassword(password);
    
    // Create user
    const user = await storage.createUser({
      username,
      password: hash,
      email,
      name,
      masterKeyHash: hash, // Using same hash for simplicity
      salt,
      confirmPassword,
    });
    
    // Log activity
    await storage.createActivityLog({
      userId: user.id,
      action: 'register',
      details: 'User registered successfully',
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });
    
    // Set session
    req.session.userId = user.id;
    
    // Don't return sensitive data
    const { password: _, masterKeyHash: __, salt: ___, ...safeUser } = user;
    
    res.status(201).json({ 
      user: safeUser,
      message: 'Registration successful' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

// Logout handler
export const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.json({ message: 'No active session' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return sensitive data
    const { password: _, masterKeyHash: __, salt: ___, ...safeUser } = user;
    
    res.json({ user: safeUser });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};
