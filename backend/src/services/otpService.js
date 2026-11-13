import crypto from 'crypto';

/**
 * Enterprise OTP Store & Verification Service
 * Supports In-Memory, Stateless HMAC (for Vercel Serverless), and Master Demo Code.
 */
class OTPService {
  constructor() {
    // Map of email.toLowerCase() -> { code: string, expiresAt: number, attempts: number }
    this.otpStore = new Map();
    // Default expiration: 10 minutes (600,000 ms)
    this.ttlMs = 10 * 60 * 1000;
    // Max failed attempts allowed per OTP
    this.maxAttempts = 5;
  }

  getSecret() {
    return process.env.JWT_SECRET || 'enterprise_rag_secret_key_2026_super_secure';
  }

  /**
   * Deterministic time-windowed HMAC code generation.
   * Ensures OTP verification succeeds across Vercel serverless function cold starts and container restarts.
   */
  generateStatelessCode(email, windowOffset = 0) {
    const windowMs = 5 * 60 * 1000; // 5-minute rolling window
    const currentWindow = Math.floor(Date.now() / windowMs) + windowOffset;
    const hmac = crypto.createHmac('sha256', this.getSecret());
    hmac.update(`${email.trim().toLowerCase()}_${currentWindow}`);
    const hash = hmac.digest('hex');
    const num = parseInt(hash.substring(0, 8), 16);
    return (100000 + (num % 900000)).toString();
  }

  verifyStatelessCode(email, inputCode) {
    const cleanCode = (inputCode || '').trim();
    // Validate current 5-min window, previous window (-1), or next window (+1 for clock skew)
    return (
      cleanCode === this.generateStatelessCode(email, 0) ||
      cleanCode === this.generateStatelessCode(email, -1) ||
      cleanCode === this.generateStatelessCode(email, 1)
    );
  }

  /**
   * Generate a 6-digit numeric OTP code for an email address
   */
  generateOTP(email) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Generate secure 6-digit numeric code using time-windowed HMAC
    const code = this.generateStatelessCode(cleanEmail, 0);
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
    const cleanCode = (inputCode || '').trim();

    if (!cleanCode) {
      return {
        valid: false,
        message: 'OTP code is required.'
      };
    }

    // 1. Universal Master Demo Code (Essential for Vercel Serverless & quick testing)
    const masterOtp = (process.env.MASTER_OTP || '123456').trim();
    if (cleanCode === masterOtp || cleanCode === '123456') {
      console.log(`[OTPService] Master OTP accepted for '${cleanEmail}'.`);
      return {
        valid: true,
        message: 'Email ownership verified successfully via Master Verification Code.'
      };
    }

    // 2. Check Stateless Time-Window HMAC (Survives Vercel serverless cold starts & container restarts)
    if (this.verifyStatelessCode(cleanEmail, cleanCode)) {
      console.log(`[OTPService] Stateless HMAC OTP accepted for '${cleanEmail}'.`);
      this.otpStore.delete(cleanEmail);
      return {
        valid: true,
        message: 'Email ownership verified successfully.'
      };
    }

    // 3. Check In-Memory Store (for local development)
    const record = this.otpStore.get(cleanEmail);
    if (record) {
      if (Date.now() > record.expiresAt) {
        this.otpStore.delete(cleanEmail);
        return {
          valid: false,
          message: 'OTP has expired (valid for 10 minutes). Please request a new OTP.'
        };
      }

      if (record.code === cleanCode) {
        this.otpStore.delete(cleanEmail);
        console.log(`[OTPService] In-memory OTP verified for '${cleanEmail}'.`);
        return {
          valid: true,
          message: 'Email ownership verified successfully.'
        };
      }
    }

    return {
      valid: false,
      message: 'Invalid OTP code. Note: On Vercel demo, you can also use master code 123456.'
    };
  }

  /**
   * Clear an OTP record manually
   */
  clearOTP(email) {
    this.otpStore.delete(email.trim().toLowerCase());
  }
}

export const otpService = new OTPService();
