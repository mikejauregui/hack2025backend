/**
 * Validation Utilities
 * Input validation and sanitization functions
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 * Minimum 8 characters
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  // Optional: Add more complexity requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("Password must contain at least one uppercase letter");
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate age (must be 18 or older)
 */
export function validateAge(dateOfBirth: Date | string): {
  valid: boolean;
  age: number;
  error?: string;
} {
  const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  // Check if valid date
  if (isNaN(birthDate.getTime())) {
    return {
      valid: false,
      age: 0,
      error: "Invalid date of birth",
    };
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Check if in future
  if (age < 0) {
    return {
      valid: false,
      age: 0,
      error: "Date of birth cannot be in the future",
    };
  }

  // Check minimum age
  if (age < 18) {
    return {
      valid: false,
      age,
      error: "You must be at least 18 years old to register",
    };
  }

  // Check maximum reasonable age (150 years)
  if (age > 150) {
    return {
      valid: false,
      age,
      error: "Please enter a valid date of birth",
    };
  }

  return {
    valid: true,
    age,
  };
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Check if between 10 and 15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate wallet URL (Interledger format)
 */
export function validateWalletUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== "https:") {
      return {
        valid: false,
        error: "Wallet URL must use HTTPS protocol",
      };
    }

    // Must have a host
    if (!parsed.host) {
      return {
        valid: false,
        error: "Invalid wallet URL format",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }
}

/**
 * Validate currency code (ISO 4217)
 */
export function validateCurrencyCode(code: string): boolean {
  // Common currency codes
  const validCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "INR",
    "MXN",
    "BRL",
  ];

  return validCurrencies.includes(code.toUpperCase());
}

/**
 * Validate amount (positive number with max 2 decimal places)
 */
export function validateAmount(amount: number | string): {
  valid: boolean;
  error?: string;
} {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return {
      valid: false,
      error: "Amount must be a valid number",
    };
  }

  if (num <= 0) {
    return {
      valid: false,
      error: "Amount must be greater than zero",
    };
  }

  if (num > 999999.99) {
    return {
      valid: false,
      error: "Amount cannot exceed 999,999.99",
    };
  }

  // Check decimal places
  const decimalPlaces = (num.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    return {
      valid: false,
      error: "Amount cannot have more than 2 decimal places",
    };
  }

  return { valid: true };
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .substring(0, 1000); // Limit length
}

/**
 * Validate wallet name
 */
export function validateWalletName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return {
      valid: false,
      error: "Wallet name is required",
    };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      error: "Wallet name must not exceed 100 characters",
    };
  }

  return { valid: true };
}

/**
 * Validate user name
 */
export function validateName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return {
      valid: false,
      error: "Name is required",
    };
  }

  if (trimmed.length > 255) {
    return {
      valid: false,
      error: "Name must not exceed 255 characters",
    };
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      valid: false,
      error: "Name must contain at least one letter",
    };
  }

  return { valid: true };
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    token += charset[randomIndex];
  }

  return token;
}
