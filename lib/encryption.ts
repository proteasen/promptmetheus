import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length < 32) {
    console.warn('ENCRYPTION_KEY not set or too short. Using default (INSECURE for production)')
    return 'default-insecure-key-change-me-in-production-min-32-chars'
  }
  return key
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512')
}

export function encrypt(text: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = deriveKey(getEncryptionKey(), salt)
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')])
    return result.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const buffer = Buffer.from(encryptedData, 'base64')
    
    const salt = buffer.subarray(0, SALT_LENGTH)
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    
    const key = deriveKey(getEncryptionKey(), salt)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Keep sync versions for compatibility
export function encryptSync(text: string): string {
  return encrypt(text)
}

export function decryptSync(encryptedData: string): string {
  return decrypt(encryptedData)
}
