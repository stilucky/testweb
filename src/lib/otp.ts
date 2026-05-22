export type OTPPurpose = "verify" | "reset";

interface OTPEntry {
  code: string;
  expiresAt: number;
  purpose: OTPPurpose;
}

// In-memory store — works on single VPS instance
// For multi-instance: replace with Redis
const otpStore = new Map<string, OTPEntry>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, code: string, purpose: OTPPurpose): void {
  otpStore.set(email.toLowerCase(), {
    code,
    purpose,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
}

export function verifyOTP(email: string, code: string, purpose: OTPPurpose): boolean {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;
  if (entry.purpose !== purpose) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(email.toLowerCase()); // one-time use
  return true;
}

export function hasOTP(email: string): boolean {
  const entry = otpStore.get(email.toLowerCase());
  return !!entry && Date.now() < entry.expiresAt;
}
