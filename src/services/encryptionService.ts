import CryptoJS from 'crypto-js';

/**
 * AES-256-CBC Encryption Service
 * Handles encryption and decryption for secure communication with backend
 * Uses FIXED IV derived from secret key (matches backend implementation exactly)
 */
export class EncryptionService {
    private secretKey: string;

    constructor() {
        // Use environment variable or fallback to default key
        this.secretKey = import.meta.env.VITE_ENCRYPTION_SECRET_KEY || 'your-aes-256-secret-key-change-this';
    }

    /**
     * Generate AES key - matches backend generateKey() EXACTLY
     * Convert secret key to UTF-8 bytes, then SHA-256 hash, first 32 bytes (8 words)
     */
    private generateKey(): CryptoJS.lib.WordArray {
        const keyBytes = CryptoJS.enc.Utf8.parse(this.secretKey);
        const hash = CryptoJS.SHA256(keyBytes);
        return CryptoJS.lib.WordArray.create(hash.words.slice(0, 8)); // 8 words = 32 bytes
    }

    /**
     * Generate IV - matches backend generateIv() EXACTLY
     * Convert secret key to UTF-8 bytes, then SHA-256 hash, first 16 bytes (4 words) - FIXED IV
     */
    private generateIv(): CryptoJS.lib.WordArray {
        const ivBytes = CryptoJS.enc.Utf8.parse(this.secretKey);
        const hash = CryptoJS.SHA256(ivBytes);
        return CryptoJS.lib.WordArray.create(hash.words.slice(0, 4)); // 4 words = 16 bytes
    }

    /**
     * Encrypt data using AES-256-CBC with fixed IV
     * Matches backend encrypt() method EXACTLY - byte array format
     */
    encrypt(data: any): string {
        try {
            const key = this.generateKey();
            const iv = this.generateIv();
            
            // Encrypt the JSON string
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                key,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            const encryptedBytes = encrypted.ciphertext;
            
            // Convert IV to byte array (matches backend format EXACTLY)
            const ivArray = new Uint8Array(16);
            for (let i = 0; i < 4; i++) {
                const word = iv.words[i];
                ivArray[i * 4] = (word >>> 24) & 0xff;
                ivArray[i * 4 + 1] = (word >>> 16) & 0xff;
                ivArray[i * 4 + 2] = (word >>> 8) & 0xff;
                ivArray[i * 4 + 3] = word & 0xff;
            }
            
            // Convert encrypted data to byte array - FIXED calculation
            const encryptedWordLength = encryptedBytes.sigBytes;
            const encArray = new Uint8Array(encryptedWordLength);
            for (let i = 0; i < encryptedBytes.words.length; i++) {
                const word = encryptedBytes.words[i];
                const baseIndex = i * 4;
                if (baseIndex < encryptedWordLength) encArray[baseIndex] = (word >>> 24) & 0xff;
                if (baseIndex + 1 < encryptedWordLength) encArray[baseIndex + 1] = (word >>> 16) & 0xff;
                if (baseIndex + 2 < encryptedWordLength) encArray[baseIndex + 2] = (word >>> 8) & 0xff;
                if (baseIndex + 3 < encryptedWordLength) encArray[baseIndex + 3] = word & 0xff;
            }
            
            // Combine IV + encrypted data (matches backend System.arraycopy EXACTLY)
            const combined = new Uint8Array(ivArray.length + encArray.length);
            combined.set(ivArray, 0);           // Copy IV first at position 0
            combined.set(encArray, ivArray.length); // Copy encrypted data after IV
            
            // Convert to base64 (matches backend Base64.getEncoder().encodeToString())
            return btoa(String.fromCharCode.apply(null, Array.from(combined)));
            
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data: ' + (error as Error).message);
        }
    }

    /**
     * Decrypt data using AES-256-CBC
     * Matches backend decrypt() method EXACTLY - byte array format
     */
    decrypt(encryptedData: string): any {
        try {
            // Decode base64 (matches backend Base64.getDecoder().decode())
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            // Extract IV (first 16 bytes) and encrypted data (matches backend Arrays.copyOfRange)
            const ivBytes = combined.slice(0, 16);
            const encryptedBytes = combined.slice(16);
            
            // Convert IV bytes to WordArray
            const ivWords = [];
            for (let i = 0; i < 16; i += 4) {
                const word = (ivBytes[i] << 24) | (ivBytes[i + 1] << 16) | (ivBytes[i + 2] << 8) | ivBytes[i + 3];
                ivWords.push(word >>> 0); // Ensure unsigned 32-bit
            }
            const iv = CryptoJS.lib.WordArray.create(ivWords, 16);
            
            // Convert encrypted bytes to WordArray with proper length handling
            const encWords = [];
            for (let i = 0; i < encryptedBytes.length; i += 4) {
                let word = 0;
                if (i < encryptedBytes.length) word |= (encryptedBytes[i] << 24);
                if (i + 1 < encryptedBytes.length) word |= (encryptedBytes[i + 1] << 16);
                if (i + 2 < encryptedBytes.length) word |= (encryptedBytes[i + 2] << 8);
                if (i + 3 < encryptedBytes.length) word |= encryptedBytes[i + 3];
                encWords.push(word >>> 0); // Ensure unsigned 32-bit
            }
            const encrypted = CryptoJS.lib.WordArray.create(encWords, encryptedBytes.length);
            
            const key = this.generateKey();
            
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: encrypted } as CryptoJS.lib.CipherParams,
                key,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data: ' + (error as Error).message);
        }
    }

    /**
     * Test encryption/decryption functionality
     */
    test(): boolean {
        try {
            const testData = { message: 'Hello World', timestamp: Date.now() };
            const encrypted = this.encrypt(testData);
            const decrypted = this.decrypt(encrypted);
            
            return JSON.stringify(testData) === JSON.stringify(decrypted);
        } catch (error) {
            console.error('Encryption test failed:', error);
            return false;
        }
    }

    /**
     * Get encryption details for debugging
     */
    getDebugInfo(): {
        secretKey: string;
        keyHash: string;
        ivHash: string;
    } {
        const keyBytes = CryptoJS.enc.Utf8.parse(this.secretKey);
        const keyHash = CryptoJS.SHA256(keyBytes);
        const ivBytes = CryptoJS.enc.Utf8.parse(this.secretKey);
        const ivHash = CryptoJS.SHA256(ivBytes);
        
        return {
            secretKey: this.secretKey,
            keyHash: keyHash.toString().substring(0, 64), // First 32 bytes in hex
            ivHash: ivHash.toString().substring(0, 32), // First 16 bytes in hex
        };
    }
}

// Create singleton instance
export const encryptionService = new EncryptionService();