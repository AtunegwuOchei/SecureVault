import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return 'Unknown';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export function maskPassword(password: string): string {
  return '•'.repeat(password.length);
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function calculatePasswordStrength(password: string): number {
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
}

export function getStrengthLabel(strength: number): {
  label: string;
  color: string;
} {
  if (strength >= 80) {
    return { label: 'Strong', color: 'bg-green-500' };
  } else if (strength >= 60) {
    return { label: 'Good', color: 'bg-blue-500' };
  } else if (strength >= 40) {
    return { label: 'Fair', color: 'bg-yellow-500' };
  } else if (strength >= 20) {
    return { label: 'Weak', color: 'bg-orange-500' };
  } else {
    return { label: 'Very Weak', color: 'bg-red-500' };
  }
}
