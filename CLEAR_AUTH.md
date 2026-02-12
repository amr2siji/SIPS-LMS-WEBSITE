# Clear Authentication Token

Your JWT token is invalid because the backend restarted with a new secret key.

## Quick Fix Options:

### Option 1: Browser Console (EASIEST)
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Run this command:
```javascript
localStorage.clear(); location.reload();
```
4. Log in again

### Option 2: Manual
1. Open browser Developer Tools (F12)
2. Go to Application tab
3. Under Storage → Local Storage → http://localhost:5173
4. Right-click → Clear
5. Refresh page and log in again

### Option 3: Logout Button
1. Click your profile/logout button in the UI
2. Log in again with your credentials

---

## Why This Happens:
- Backend restart = New JWT_SECRET generated
- Old tokens signed with old secret = Invalid
- New login = New token signed with current secret = Valid

## Prevent This:
Set a fixed JWT_SECRET in your application.properties:
```properties
jwt.secret=YourFixedSecretKeyHere1234567890AbCdEfGhIjKlMnOpQrStUvWxYz
```
