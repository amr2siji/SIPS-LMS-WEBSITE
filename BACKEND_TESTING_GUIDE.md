# Backend Integration Testing Guide

## 🧪 Testing the Implementation

### 1. Start the Development Server
The server should be running at `http://localhost:5173/`

### 2. Test Encryption Service
Visit: `http://localhost:5173/test`

This page will help you:
- Test the encryption/decryption functionality
- Debug API communication issues
- View environment variables
- Test actual login API calls

### 3. Backend API Requirements

Your Spring Boot backend should:

#### Accept Encrypted Login Requests
```http
POST /api/auth/login
Content-Type: application/json

{
  "encryptedData": "base64-encoded-encrypted-json"
}
```

#### Decrypt the Request
The encrypted data contains:
```json
{
  "nic": "123456789V",
  "password": "admin123"
}
```

#### Return Encrypted Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": "base64-encoded-encrypted-response",
  "statusCode": 200,
  "timestamp": "2025-12-29T14:58:24.772Z"
}
```

The encrypted response data should contain:
```json
{
  "token": "jwt-token-here",
  "role": "ADMIN",
  "nic": "123456789V",
  "fullName": "Admin User",
  "expiresIn": 86400
}
```

### 4. Current Error Analysis

**Error:** `"Login failed: Encrypted data is required"`

**✅ Requirements Confirmed:**
1. **Secret Key**: Must be exactly `your-aes-256-secret-key-change-this`
2. **Request Structure**: Must send `{ encryptedData: "encrypted-base64-string" }`
3. **Content-Type**: Must be `application/json`
4. **CORS**: Backend must allow frontend origin

### 5. Debugging Steps

1. **Check encryption locally** - Use the test page to verify encryption works
2. **Verify API endpoint** - Ensure backend is running on `http://localhost:8080`
3. **Check network tab** - See what's being sent in the request
4. **Backend logs** - Check Spring Boot logs for incoming request details

### 6. Test Credentials

```
Admin: 123456789V / admin123
Instructor: 987654321V / instructor123  
Student: 555666777V / student123
```

### 7. Next Steps After Backend Fix

Once the backend is working:
1. Test login flow at `/login`
2. Test student management at `/admin/manage-students`
3. Verify authentication state persistence
4. Test role-based access control

### 8. Backend Encryption Implementation (Java)

Your Spring Boot service should implement similar AES-256-CBC encryption:

```java
// Pseudocode for backend encryption service
@Service
public class EncryptionService {
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String SECRET_KEY = "your-aes-256-secret-key-change-this";
    
    public String decrypt(String encryptedData) {
        // 1. Base64 decode the encryptedData
        // 2. Extract IV (first 16 bytes) and ciphertext
        // 3. Create AES key from SECRET_KEY hash (SHA-256, first 32 chars)
        // 4. Decrypt using AES-256-CBC
        // 5. Return JSON string
    }
    
    public String encrypt(Object data) {
        // 1. Convert object to JSON string
        // 2. Generate random IV
        // 3. Encrypt with AES-256-CBC
        // 4. Combine IV + ciphertext
        // 5. Base64 encode result
    }
}
```

Visit `/test` to start debugging the integration!