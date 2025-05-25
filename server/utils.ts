import CryptoJS from 'crypto-js';
import bcrypt from 'bcrypt';

// AES-256 encryption for passwords
export const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Password hashing with bcrypt
export const hashPassword = async (password: string): Promise<{ hash: string, salt: string }> => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate salt for encryption
export const generateSalt = (length: number = 16): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

// Password strength calculator (0-100)
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  // Start with a base score
  let score = 0;
  
  // Add points for length
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Add points for complexity
  if (/[a-z]/.test(password)) score += 10; // lowercase
  if (/[A-Z]/.test(password)) score += 10; // uppercase
  if (/[0-9]/.test(password)) score += 10; // numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 10; // symbols
  
  // Variety of characters
  const uniqueChars = new Set(password).size;
  score += Math.min(20, uniqueChars * 2);
  
  // Penalize patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // repeated characters
  if (/^(?:abc|123|qwerty|password|admin|welcome).*/i.test(password)) score -= 20; // common patterns
  
  return Math.max(0, Math.min(100, score));
};

// Password generator
export const generatePassword = (
  length: number = 16,
  includeUppercase: boolean = true,
  includeLowercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?/';
  
  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;
  
  if (chars.length === 0) {
    // Default to lowercase if nothing selected
    chars = lowercase;
  }
  
  let password = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }
  
  return password;
};
