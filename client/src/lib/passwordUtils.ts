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

export const getStrengthColor = (strength: number): string => {
  if (strength >= 80) return 'bg-green-500';
  if (strength >= 60) return 'bg-blue-500';
  if (strength >= 40) return 'bg-yellow-500';
  if (strength >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getStrengthLabel = (strength: number): string => {
  if (strength >= 80) return 'Strong';
  if (strength >= 60) return 'Good';
  if (strength >= 40) return 'Fair';
  if (strength >= 20) return 'Weak';
  return 'Very Weak';
};

export const generatePassphrase = (
  wordCount: number = 4,
  separator: string = '-'
): string => {
  // Common English words (simplified for example)
  const wordList = [
    'apple', 'banana', 'orange', 'grape', 'kiwi', 'melon',
    'house', 'table', 'chair', 'window', 'door', 'floor',
    'happy', 'brave', 'quick', 'smart', 'kind', 'wise',
    'river', 'ocean', 'mountain', 'forest', 'desert', 'valley',
    'sun', 'moon', 'star', 'planet', 'galaxy', 'comet'
  ];
  
  let passphrase = '';
  const randomValues = new Uint32Array(wordCount);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < wordCount; i++) {
    if (i > 0) passphrase += separator;
    passphrase += wordList[randomValues[i] % wordList.length];
  }
  
  return passphrase;
};

export const checkPasswordBreaches = async (password: string): Promise<boolean> => {
  try {
    // This would be replaced with a real API call to check breaches
    // For demo purposes, we'll just simulate a check
    return false;
  } catch (error) {
    console.error('Error checking password breaches:', error);
    return false;
  }
};

export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', 'qwerty', 'admin', 'welcome',
    'password123', 'abc123', 'letmein', '123456789', '12345'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};
