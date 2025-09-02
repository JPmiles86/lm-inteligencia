/**
 * Encryption Service - Backend Only
 * Handles API key encryption/decryption securely on the server
 */

import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;
  private saltLength = 32;
  private iterations = 100000;
  
  private masterKey: Buffer;

  constructor() {
    // Get encryption key from environment or generate one
    const envKey = process.env.ENCRYPTION_KEY;
    
    if (!envKey) {
      console.warn('⚠️ ENCRYPTION_KEY not found in environment variables');
      console.warn('Generating a temporary key for development...');
      // In production, this should throw an error
      this.masterKey = crypto.randomBytes(this.keyLength);
    } else {
      // Ensure the key is the right length
      this.masterKey = this.deriveKey(envKey);
    }
  }

  /**
   * Derive a key from a password
   */
  private deriveKey(password: string): Buffer {
    const salt = Buffer.from('static-salt-for-key-derivation', 'utf8');
    return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
  }

  /**
   * Encrypt an API key
   */
  encrypt(apiKey: string): string {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      
      // Encrypt the API key
      const encrypted = Buffer.concat([
        cipher.update(apiKey, 'utf8'),
        cipher.final()
      ]);
      
      // Get the auth tag
      const tag = (cipher as any).getAuthTag();
      
      // Combine IV + tag + encrypted data
      const combined = Buffer.concat([iv, tag, encrypted]);
      
      // Return base64 encoded
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  /**
   * Decrypt an API key
   */
  decrypt(encryptedKey: string): string {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedKey, 'base64');
      
      // Extract components
      const iv = combined.slice(0, this.ivLength);
      const tag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = combined.slice(this.ivLength + this.tagLength);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      (decipher as any).setAuthTag(tag);
      
      // Decrypt
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Validate an API key format (not decrypting, just checking format)
   */
  validateKeyFormat(provider: string, apiKey: string): boolean {
    const patterns: Record<string, RegExp> = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9]{40,}$/,
      google: /^AIza[a-zA-Z0-9]{35}$/,
      perplexity: /^pplx-[a-zA-Z0-9]{40,}$/,
    };

    const pattern = patterns[provider];
    if (!pattern) return true; // Unknown provider, skip validation
    
    return pattern.test(apiKey);
  }

  /**
   * Test if encryption is working
   */
  testEncryption(): boolean {
    try {
      const testKey = 'sk-test-1234567890';
      const encrypted = this.encrypt(testKey);
      const decrypted = this.decrypt(encrypted);
      return decrypted === testKey;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Test on startup
if (encryptionService.testEncryption()) {
  console.log('✅ Encryption service initialized successfully');
} else {
  console.error('❌ Encryption service test failed!');
}