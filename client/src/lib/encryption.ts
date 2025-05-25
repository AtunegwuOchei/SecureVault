import CryptoJS from 'crypto-js';

export const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

export const generateSalt = (length: number = 16): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

export const hashMasterPassword = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

export const deriveKeyFromPassword = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

// Utility to create an encryption key from user's master password
export const createEncryptionKey = (masterPassword: string): string => {
  const salt = generateSalt();
  return deriveKeyFromPassword(masterPassword, salt);
};

// Generate a secure random string (useful for passwords)
export const generateSecureRandom = (length: number = 32): string => {
  return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
};
