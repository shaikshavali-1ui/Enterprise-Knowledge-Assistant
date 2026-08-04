/**
 * In-Memory OTP Store & Management Service
 */
class OTPService {
  constructor() {
    // Map of email.toLowerCase() -> { code: string, expiresAt: number, attempts: number }
    this.otpStore = new Map();
    // Default expiration: 10 minutes (600,000 ms)
    this.ttlMs = 10 * 60 * 1000;
    // Max failed attempts allowed per OTP
    this.maxAttempts = 3;
  }

  /**
   * Generate a 6-digit numeric OTP code for an email address
   */
  generateOTP(email) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Generate secure 6-digit numeric OTP (100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + this.ttlMs;

    this.otpStore.set(cleanEmail, {
      code,
      expiresAt,
      attempts: 0,
      createdAt: new Date().toISOString()
    });

    console.log(`[OTPService] Generated 6-digit OTP [${code}] for '${cleanEmail}' (Valid for 10 minutes).`);
    return code;
  }

  /**
   * Verify an OTP code for a given email address
   */
  verifyOTP(email, inputCode) {
    const cleanEmail = email.trim().toLowerCase();
    const record = this.otpStore.get(cleanEmail);

    if (!record) {
      return {
        valid: false,
        message: 'No OTP found for this email address. Please request a new OTP.'
      };
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      return {
        valid: false,
        message: 'OTP has expired (valid for 10 minutes). Please request a new OTP.'
      };
    }

    // Check max attempts
    if (record.attempts >= this.maxAttempts) {
      this.otpStore.delete(cleanEmail);
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    // Check code match
    if (record.code === inputCode.trim()) {
      // Consume OTP on successful verification
      this.otpStore.delete(cleanEmail);
      console.log(`[OTPService] Successfully verified OTP for '${cleanEmail}'.`);
      return {
        valid: true,
        message: 'Email ownership verified successfully.'
      };
    } else {
      record.attempts += 1;
      const remaining = this.maxAttempts - record.attempts;
      return {
        valid: false,
        message: `Invalid OTP code. ${remaining} attempt(s) remaining.`
      };
    }
  }

  /**
   * Clear an OTP record manually
   */
  clearOTP(email) {
    this.otpStore.delete(email.trim().toLowerCase());
  }
}

export const otpService = new OTPService();
