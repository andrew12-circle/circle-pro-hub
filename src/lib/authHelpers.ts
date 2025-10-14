/**
 * Auth helper utilities
 * Pure functions for auth validation and formatting
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  const validation = validatePassword(password);
  
  if (password.length < 8) return "weak";
  if (validation.errors.length > 1) return "weak";
  if (validation.errors.length === 1) return "medium";
  
  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "strong";
  
  return "medium";
}

export function formatAuthError(error: any): string {
  const message = error?.message || String(error);

  // Map common Supabase auth errors to user-friendly messages
  if (message.includes("Invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }

  if (message.includes("Email not confirmed")) {
    return "Please check your email to confirm your account.";
  }

  if (message.includes("User already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (message.includes("Password should be at least")) {
    return "Password must be at least 8 characters long.";
  }

  // Return original message if no mapping found
  return message;
}
