# API Response Mapping Fix - ReviewApplications.tsx

## 🔍 **Issue Identified**

The frontend was expecting different field names than what the API was returning, causing the NIC, email, mobile number, applied date, and last updated values to not display properly.

### **API Response Format vs Expected Frontend Format**

| Frontend Expected | API Response | Issue |
|-------------------|--------------|-------|
| `nic` | `nicNumber` | Field name mismatch |
| `email` | `emailAddress` | Field name mismatch |
| `phoneNumber` | `mobileNumber` | Field name mismatch |
| `studentName` | `fullName` | Field name mismatch |
| `createdAt: string` | `createdAt: [2026,1,6,8,13,45,201596000]` | Date format mismatch |
| `updatedAt: string` | `updatedAt: [2026,1,6,8,13,45,201596000]` | Date format mismatch |

## ✅ **Fixes Applied**

### 1. **Created API Response Mapping Functions**
```typescript
// Helper function to convert date array to ISO string
const convertDateArray = (dateArray: number[]): string => {
  if (!dateArray || dateArray.length < 3) return new Date().toISOString();
  
  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
  return date.toISOString();
};

// Helper function to map API response to our interface
const mapApiResponseToStudentApplication = (apiData: any): StudentApplication => ({
  id: apiData.id,
  applicationNumber: apiData.applicationNumber,
  studentName: apiData.fullName, // API field mapping
  email: apiData.emailAddress,   // API field mapping
  nic: apiData.nicNumber,        // API field mapping
  phoneNumber: apiData.mobileNumber, // API field mapping
  programName: apiData.programName,
  departmentName: apiData.departmentName,
  facultyName: apiData.facultyName,
  status: apiData.status,
  createdAt: convertDateArray(apiData.createdAt), // Date array conversion
  updatedAt: convertDateArray(apiData.updatedAt)  // Date array conversion
});
```

### 2. **Updated Service Methods**
- Modified `getApplications()` to use mapping function
- Modified `getApplicationById()` to use mapping function  
- Modified `getApplicationByNumber()` to use mapping function
- Fixed token retrieval to check both `jwt_token` and `token`

### 3. **Enhanced Error Handling**
- Added proper handling for both array and object responses from API
- Added detailed logging for debugging API responses
- Improved error messages for missing data

### 4. **Improved UI Display**
- Enhanced date formatting with proper locale options
- Added fallback values for missing data
- Improved null checking with proper fallbacks to selected application data

### 5. **Removed Debug Information**
- Cleaned up development-only debug information from the UI

## 🛠️ **Technical Details**

### **Date Array Conversion**
The API returns dates as arrays: `[2026, 1, 6, 8, 13, 45, 201596000]`
- Format: `[year, month, day, hour, minute, second, nanoseconds]`
- Month is 1-based in API but 0-based in JavaScript Date constructor
- Converted to ISO string format for consistent handling

### **Field Mapping**
```typescript
// API Response → Frontend Interface
{
  fullName → studentName,
  emailAddress → email,
  nicNumber → nic,
  mobileNumber → phoneNumber,
  nicDocumentPath → nicCopyPath,
  // ... other mappings
}
```

### **Response Structure Handling**
The API can return either:
1. Direct pagination response with `content` array
2. Wrapped response with `statusCode`, `message`, and `data`

Both formats are now properly handled.

## 🧪 **Testing Verification**

After these changes, the following fields should now display correctly:
- ✅ **NIC Number**: Shows the `nicNumber` from API
- ✅ **Email Address**: Shows the `emailAddress` from API  
- ✅ **Mobile Number**: Shows the `mobileNumber` from API
- ✅ **Applied Date**: Shows formatted `createdAt` date
- ✅ **Last Updated**: Shows formatted `updatedAt` date with time

## 📋 **Files Modified**

1. **`src/services/studentApplicationService.ts`**
   - Added API response mapping functions
   - Updated all service methods to use mappings
   - Fixed token retrieval logic

2. **`src/pages/admin/ReviewApplications.tsx`**
   - Improved null checking and fallback values
   - Enhanced date formatting
   - Removed debug information
   - Added better error handling for missing data

## ⚠️ **Important Notes**

- All date conversions now handle the API's array format correctly
- Fallback values ensure UI doesn't show empty fields
- Token retrieval now supports both storage key formats
- Response handling supports both API response formats (direct and wrapped)