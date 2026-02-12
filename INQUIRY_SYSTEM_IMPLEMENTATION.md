# Inquiry System Implementation

## Overview
A complete inquiry management system allowing public users to submit inquiries through a floating "Contact Us" button, and administrators to manage these inquiries through a dedicated admin page.

---

## Public Features

### Floating Contact Button
**Location**: All pages (via `FloatingInquireButton` component)

**Features**:
- Animated floating button in bottom-right corner
- Red gradient design with hover effects
- Opens modal form on click

### Inquiry Submission Form
**Modal Fields**:
- **Full Name** (required) - Text input
- **Email** (required) - Email input with validation
- **Phone Number** (required) - Format: `+94 XX XXX XXXX`
- **Program Selection** (required) - Cascading dropdown:
  1. Select Faculty
  2. Select Department (filtered by faculty)
  3. Select Program (filtered by department)
  - Program **name** is sent to API (not ID)
- **Message** (optional) - Textarea for additional details

**Validation**:
- Required field checks
- Email format validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Phone format validation (`/^\+94\s?\d{2}\s?\d{3}\s?\d{4}$/`)

**Submission**:
- Calls: `POST /api/public/inquiry/submit`
- No authentication required
- Shows success message on completion
- Auto-closes modal after 3 seconds

---

## Admin Features

### Review Inquiries Page
**Location**: `/admin/review-inquiries`

#### Statistics Dashboard
Five metric cards displaying:
1. **Total Inquiries** (Purple) - All time count
2. **Pending** (Yellow) - Awaiting response
3. **Contacted** (Blue) - Initial contact made
4. **Resolved** (Green) - Successfully completed
5. **Spam** (Red) - Marked as spam

**API**: `GET /api/admin/inquiries/statistics`

#### Search & Filter
- Search bar: Searches across name, email, phone, and program
- Status tabs: PENDING, CONTACTED, RESOLVED, SPAM
- Results update automatically

#### Inquiry Table
**Columns**:
- ID
- Name
- Contact (Email & Phone)
- Program
- Status (with color-coded badges)
- Date (Created date/time)
- Actions

**Actions per Inquiry**:
1. **View Details** (Eye icon)
   - Opens modal with full inquiry information
   - Shows: ID, Status, Name, Email, Phone, Program, Message, Dates
   - Displays admin notes if available
   - Shows contacted by and contacted at if applicable

2. **Update Status** (Filter icon)
   - Opens modal to change status
   - Status dropdown: PENDING, CONTACTED, RESOLVED, SPAM
   - Admin Notes field (optional)
   - Saves to: `PUT /api/admin/inquiries/{id}/status`

3. **Delete** (Trash icon)
   - Confirmation dialog
   - Permanently removes inquiry
   - Calls: `DELETE /api/admin/inquiries/{id}`

#### Pagination
- Shows page numbers
- Previous/Next buttons
- Configurable page size (default: 10)

---

## Backend API Endpoints

### Public Endpoints

#### Submit Inquiry
```
POST /api/public/inquiry/submit
```
**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+94 77 123 4567",
  "program": "Bachelor of Science in Computer Science",
  "message": "Optional message here"
}
```
**Authentication**: None required

---

### Admin Endpoints
All admin endpoints require JWT authentication via `Authorization: Bearer {token}`

#### Get Inquiries (Paginated)
```
GET /api/admin/inquiries?search={query}&status={status}&page={num}&size={num}
```
**Query Parameters**:
- `search` (optional) - Search term
- `status` (optional) - Filter by status
- `page` (optional, default: 0)
- `size` (optional, default: 10)

**Response**:
```json
{
  "statusCode": "000",
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+94 77 123 4567",
        "program": "Bachelor of Science in Computer Science",
        "message": "I'm interested in enrolling",
        "status": "PENDING",
        "contactedBy": null,
        "contactedAt": null,
        "adminNotes": null,
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "totalPages": 5,
    "totalElements": 45,
    "size": 10,
    "number": 0
  }
}
```

#### Get Inquiry by ID
```
GET /api/admin/inquiries/{id}
```

#### Update Inquiry Status
```
PUT /api/admin/inquiries/{id}/status
```
**Request Body**:
```json
{
  "status": "CONTACTED",
  "adminNotes": "Sent email with program details"
}
```

#### Get Statistics
```
GET /api/admin/inquiries/statistics
```
**Response**:
```json
{
  "statusCode": "000",
  "message": "Success",
  "data": {
    "totalInquiries": 150,
    "pendingInquiries": 25,
    "contactedInquiries": 50,
    "resolvedInquiries": 70,
    "spamInquiries": 5
  }
}
```

#### Delete Inquiry
```
DELETE /api/admin/inquiries/{id}
```

---

## File Structure

### New Files Created
```
src/
├── services/
│   └── inquiryService.ts          # API service for inquiry operations
└── pages/
    └── admin/
        └── ReviewInquiries.tsx    # Admin page for managing inquiries

Modified Files:
├── components/
│   └── FloatingInquireButton.tsx  # Updated to show modal with form
└── App.tsx                        # Added route for ReviewInquiries
```

---

## Data Models

### InquirySubmission
```typescript
{
  fullName: string;
  email: string;
  phoneNumber: string;
  program: string;
  message?: string;
}
```

### Inquiry (Full Object)
```typescript
{
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  program: string;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'SPAM';
  contactedBy?: string;
  contactedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### InquiryStatistics
```typescript
{
  totalInquiries: number;
  pendingInquiries: number;
  contactedInquiries: number;
  resolvedInquiries: number;
  spamInquiries: number;
}
```

---

## Status Workflow

1. **PENDING** - Initial submission state
   - New inquiry submitted by user
   - Awaiting admin review

2. **CONTACTED** - Admin has reached out
   - Initial contact made
   - Can add admin notes about contact

3. **RESOLVED** - Successfully handled
   - Inquiry addressed
   - Student enrolled or issue resolved

4. **SPAM** - Invalid/spam inquiry
   - Mark unwanted inquiries
   - Can be deleted later

---

## UI Components

### Status Badges
Each status has a unique color scheme:
- **PENDING**: Yellow background with yellow text
- **CONTACTED**: Blue background with blue text
- **RESOLVED**: Green background with green text
- **SPAM**: Red background with red text

### Modals
All modals feature:
- Gradient header (color varies by function)
- Smooth animations
- Close button
- Responsive design
- Maximum height with scrolling

### Loading States
- Spinner animation during API calls
- Disabled buttons during operations
- Skeleton loaders where applicable

---

## Testing Guide

### Public Form Testing
1. Navigate to any page
2. Click "Contact Us" button (bottom-right)
3. Fill in form fields
4. Select Faculty → Department → Program
5. Submit and verify success message

### Admin Testing
1. Login as admin
2. Navigate to `/admin/review-inquiries`
3. Verify statistics display correctly
4. Test search functionality
5. Switch between status tabs
6. View inquiry details
7. Update inquiry status with notes
8. Delete an inquiry

---

## Security Notes

- Public submission endpoint has no authentication (by design)
- All admin endpoints require JWT token
- Token retrieved from `localStorage` as `jwt_token`
- Failed authentication redirects to login

---

## Future Enhancements

Potential improvements:
- Email notifications when inquiry status changes
- Bulk actions (mark multiple as spam)
- Export inquiries to CSV
- Assign inquiries to specific admin users
- Response templates for common inquiries
- Auto-assign based on program selection

---

## Implementation Summary

✅ **Completed Features**:
1. Inquiry service with all CRUD operations
2. Floating "Contact Us" button with modal form
3. Cascading program dropdown (Faculty → Department → Program)
4. Form validation and error handling
5. Admin review page with statistics
6. Status tabs and filtering
7. Search functionality
8. View details modal
9. Update status modal with admin notes
10. Delete functionality
11. Pagination
12. Route integration

**Total Files Modified**: 2 (FloatingInquireButton.tsx, App.tsx)
**Total Files Created**: 2 (inquiryService.ts, ReviewInquiries.tsx)
