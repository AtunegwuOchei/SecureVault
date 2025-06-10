import CryptoJS from "crypto-js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// AES-256 encryption for passwords
export const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Password hashing with bcrypt
export const hashPassword = async (
  password: string,
): Promise<{ hash: string; salt: string }> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Generate salt for encryption
export const generateSalt = (length: number = 16): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

// Password strength calculator (0-100)
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  const uniqueChars = new Set(password).size;
  score += Math.min(20, uniqueChars * 2);

  if (/(.)\1{2,}/.test(password)) score -= 10;
  if (/^(?:abc|123|qwerty|password|admin|welcome).*/i.test(password))
    score -= 20;

  return Math.max(0, Math.min(100, score));
};

// Password generator
export const generatePassword = (
  length: number = 16,
  includeUppercase: boolean = true,
  includeLowercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true,
): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?/";

  let chars = "";
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;

  if (chars.length === 0) chars = lowercase;

  let password = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  return password;
};

////////////////////////////////////////////////////
// ✅ NEW ADDITIONS BELOW
////////////////////////////////////////////////////

// ✅ Email format validator
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Password strength threshold validator
export const isStrongPassword = (
  password: string,
  minStrength: number = 60,
): boolean => {
  const strength = calculatePasswordStrength(password);
  return strength >= minStrength;
};

// ✅ Basic in-memory rate-limiting/account lockout
type LoginAttempts = {
  [email: string]: {
    attempts: number;
    lastAttempt: number;
    lockedUntil?: number;
  };
};

const loginAttempts: LoginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const isAccountLocked = (email: string): boolean => {
  const record = loginAttempts[email];
  if (!record) return false;

  const now = Date.now();
  return record.lockedUntil !== undefined && record.lockedUntil > now;
};

export const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const record = loginAttempts[email] ?? { attempts: 0, lastAttempt: now };

  if (success) {
    delete loginAttempts[email];
    return;
  }

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
  }

  loginAttempts[email] = record;
};
