import { randomBytes, scrypt, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const algorithm = 'aes-256-gcm';
const keyLength = 32;
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;

/**
 * Encrypts a plaintext string using AES-256-GCM
 * @param plaintext The text to encrypt
 * @returns Object containing encrypted data and salt
 */
export async function encrypt(plaintext: string): Promise<{ encrypted: string, salt: string }> {
  try {
    // Generate random salt and IV
    const salt = randomBytes(saltLength);
    const iv = randomBytes(ivLength);
    
    // Derive key from password and salt
    const password = process.env.ENCRYPTION_PASSWORD || 'default-encryption-key-change-in-production';
    const key = (await scryptAsync(password, salt, keyLength)) as Buffer;
    
    // Create cipher and encrypt
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine IV, tag, and encrypted data
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
    
    return {
      encrypted: combined.toString('base64'),
      salt: salt.toString('base64')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts an encrypted string using AES-256-GCM
 * @param encryptedData The encrypted data (base64 encoded)
 * @param saltString The salt used for encryption (base64 encoded)
 * @returns The decrypted plaintext
 */
export async function decrypt(encryptedData: string, saltString: string): Promise<string> {
  try {
    // Parse the encrypted data
    const combined = Buffer.from(encryptedData, 'base64');
    const salt = Buffer.from(saltString, 'base64');
    
    // Extract IV, tag, and encrypted content
    const iv = combined.subarray(0, ivLength);
    const tag = combined.subarray(ivLength, ivLength + tagLength);
    const encrypted = combined.subarray(ivLength + tagLength);
    
    // Derive key from password and salt
    const password = process.env.ENCRYPTION_PASSWORD || 'default-encryption-key-change-in-production';
    const key = (await scryptAsync(password, salt, keyLength)) as Buffer;
    
    // Create decipher and decrypt
    const decipher = createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a secure random encryption password
 * @param length Length of the password (default: 32)
 * @returns Random password string
 */
export function generateEncryptionPassword(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

/**
 * Validates if a string is properly encrypted by this module
 * @param encryptedData The encrypted data to validate
 * @param salt The salt to validate
 * @returns Boolean indicating if the data appears to be valid
 */
export function isValidEncryptedData(encryptedData: string, salt: string): boolean {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    const saltBuffer = Buffer.from(salt, 'base64');
    
    // Check if lengths are reasonable
    return (
      combined.length > ivLength + tagLength &&
      saltBuffer.length === saltLength
    );
  } catch (error) {
    return false;
  }
}

/**
 * Creates a hash of a string for comparison purposes (not reversible)
 * @param input The string to hash
 * @returns Base64 encoded hash
 */
export function createHash(input: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(input).digest('base64');
}

/**
 * Safely compares two strings in constant time to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns Boolean indicating if strings are equal
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Test the encryption/decryption functions
export async function testEncryption(): Promise<boolean> {
  try {
    const testData = 'sk-test-api-key-12345';
    const { encrypted, salt } = await encrypt(testData);
    const decrypted = await decrypt(encrypted, salt);
    
    return testData === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}