import { encryptionService } from './services/encryptionService';

// Test encryption functionality
console.log('🔐 Testing encryption service...');

const testResult = encryptionService.test();
console.log('✅ Encryption test result:', testResult);

// Test actual login data encryption
const testLoginData = {
    nic: '123456789V',
    password: 'admin123'
};

try {
    const encrypted = encryptionService.encrypt(testLoginData);
    console.log('🔒 Encrypted data:', encrypted);
    
    const decrypted = encryptionService.decrypt(encrypted);
    console.log('🔓 Decrypted data:', decrypted);
    
    console.log('🎯 Data matches:', JSON.stringify(testLoginData) === JSON.stringify(decrypted));
} catch (error) {
    console.error('❌ Encryption test error:', error);
}

export {};