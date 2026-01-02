# Spring Boot LMS Backend - API Development Guide

## Table of Contents
1. [Standardized Response Format](#standardized-response-format)
2. [Response Structure Classes](#response-structure-classes)
3. [Status Codes](#status-codes)
4. [Complete API Endpoints Documentation](#complete-api-endpoints-documentation)
5. [Implementation Examples](#implementation-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Database Schema](#database-schema)

---

## 1. Standardized Response Format

All API responses must follow this standardized format:

```json
{
  "statusCode": "string",
  "message": "string",
  "data": <T>,
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | String | HTTP status code as string (e.g., "200", "400", "500") |
| `message` | String | Human-readable message describing the response |
| `data` | Generic (T) | Response payload (can be object, array, or null) |
| `timestamp` | String (ISO 8601) | Server timestamp in ISO format |

---

## 2. Response Structure Classes

### 2.1 ApiResponse Class (Java)

```java
package com.sips.lms.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    private String statusCode;
    private String message;
    private T data;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime timestamp;
    
    // Static factory methods for common responses
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .statusCode("200")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .statusCode("201")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String statusCode, String message, T data) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.<T>builder()
                .statusCode("400")
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> notFound(String message) {
        return ApiResponse.<T>builder()
                .statusCode("404")
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> unauthorized(String message) {
        return ApiResponse.<T>builder()
                .statusCode("401")
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static <T> ApiResponse<T> internalError(String message) {
        return ApiResponse.<T>builder()
                .statusCode("500")
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

### 2.2 Paginated Response

```java
package com.sips.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {
    private List<T> items;
    private PaginationMetadata pagination;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PaginationMetadata {
    private Integer currentPage;
    private Integer pageSize;
    private Integer totalPages;
    private Long totalItems;
    private Boolean hasNextPage;
    private Boolean hasPreviousPage;
}
```

---

## 3. Status Codes

### 3.1 Success Codes (2xx)

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST creating new resource |
| 202 | Accepted | Request accepted for processing |
| 204 | No Content | Successful request with no response body |

### 3.2 Client Error Codes (4xx)

| Code | Description | Usage |
|------|-------------|-------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation error |

### 3.3 Server Error Codes (5xx)

| Code | Description | Usage |
|------|-------------|-------|
| 500 | Internal Server Error | Unexpected server error |
| 501 | Not Implemented | Feature not implemented |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## 4. Complete API Endpoints Documentation

### Overview of LMS Modules

The SIPS LMS system has the following major modules:

1. **Authentication & Authorization** - User login, registration, role-based access
2. **Programs & Courses Management** - Academic programs and course catalog
3. **Student Management** - Student enrollment, profiles, documents
4. **Modules & Enrollments** - Course modules and student registrations
5. **Lecture Materials** - Course content and learning resources
6. **Assignments** - Assignment creation, submission, and grading
7. **Exams** - Exam scheduling and management
8. **Marks Management** - Grade entry, calculation, and reporting
9. **Payments** - Fee payment processing and verification
10. **Applications & Inquiries** - Admissions and student inquiries
11. **Reports & Analytics** - Dashboard statistics and reports
12. **Notifications** - System alerts and messages

---

### 4.1 Authentication API

#### Base URL
```
/api/v1/auth
```

##### 4.1.1 User Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Login successful",
  "data": {
    "userId": "uuid-here",
    "email": "student@example.com",
    "fullName": "John Doe",
    "role": "student",
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "expiresIn": 3600
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.1.2 User Registration

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newstudent@example.com",
  "password": "SecurePass123!",
  "fullName": "Jane Smith",
  "phone": "+94771234567",
  "programId": "uuid-program-id",
  "address": "123 Main Street, Colombo"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "userId": "uuid-here",
    "email": "newstudent@example.com",
    "fullName": "Jane Smith",
    "role": "student",
    "isVerified": false
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.1.3 Refresh Token

**Request:**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token-here"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Token refreshed successfully",
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 3600
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.2 Programs API

#### Base URL
```
/api/v1/programs
```

##### 4.2.1 Get All Programs

**Request:**
```http
GET /api/v1/programs
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Programs retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "programCode": "BSC-CS",
      "programName": "Bachelor of Science in Computer Science",
      "description": "Comprehensive computer science degree program",
      "duration": 4,
      "durationUnit": "years",
      "level": "undergraduate",
      "departmentId": "uuid-dept-1",
      "departmentName": "School of Computing",
      "facultyId": "uuid-faculty-1",
      "facultyName": "Faculty of Science & Technology",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.2.2 Get Program by ID

**Request:**
```http
GET /api/v1/programs/{id}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Program retrieved successfully",
  "data": {
    "id": "uuid-1",
    "programCode": "BSC-CS",
    "programName": "Bachelor of Science in Computer Science",
    "description": "Comprehensive computer science degree program",
    "duration": 4,
    "durationUnit": "years",
    "level": "undergraduate",
    "departmentId": "uuid-dept-1",
    "departmentName": "School of Computing",
    "facultyId": "uuid-faculty-1",
    "facultyName": "Faculty of Science & Technology",
    "curriculum": "Full curriculum details...",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.3 Courses API

#### Base URL
```
/api/v1/courses
```

##### 4.3.1 Get All Courses

**Request:**
```http
GET /api/v1/courses
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Courses retrieved successfully",
  "data": [
    {
      "id": "uuid-course-1",
      "courseCode": "CS101",
      "courseName": "Introduction to Computer Science",
      "description": "Fundamental concepts of computer science",
      "credits": 3,
      "programId": "uuid-program-1",
      "programName": "Computer Science",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.4 Students API

#### Base URL
```
/api/v1/students
```

##### 4.4.1 Get All Students

**Request:**
```http
GET /api/v1/students?page=1&size=10
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Students retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid-student-1",
        "studentId": "STU2025001",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+94771234567",
        "programId": "uuid-program-1",
        "programName": "Computer Science",
        "intakeId": "uuid-intake-1",
        "intakeName": "January 2025",
        "enrollmentDate": "2025-01-15T00:00:00.000Z",
        "status": "active",
        "paymentStatus": "paid",
        "isActive": true,
        "updatedAt": "2025-12-19T03:15:22.714Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.4.2 Get Student by ID

**Request:**
```http
GET /api/v1/students/{id}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Student retrieved successfully",
  "data": {
    "id": "uuid-student-1",
    "studentId": "STU2025001",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+94771234567",
    "address": "123 Main Street, Colombo",
    "programId": "uuid-program-1",
    "programName": "Computer Science",
    "intakeId": "uuid-intake-1",
    "intakeName": "January 2025",
    "enrollmentDate": "2025-01-15T00:00:00.000Z",
    "status": "active",
    "paymentStatus": "paid",
    "guardianName": "Jane Doe",
    "guardianPhone": "+94771234568",
    "isActive": true,
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.4.3 Create Student

**Request:**
```http
POST /api/v1/students
Content-Type: application/json

{
  "studentId": "STU2025002",
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+94771234569",
  "address": "456 Park Avenue, Kandy",
  "programId": "uuid-program-1",
  "intakeId": "uuid-intake-1",
  "enrollmentDate": "2025-01-20",
  "guardianName": "John Smith",
  "guardianPhone": "+94771234570"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Student created successfully",
  "data": {
    "id": "uuid-student-2",
    "studentId": "STU2025002",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+94771234569",
    "programId": "uuid-program-1",
    "intakeId": "uuid-intake-1",
    "status": "active",
    "paymentStatus": "pending",
    "createdAt": "2025-12-19T03:15:22.714Z",
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.5 Modules API

#### Base URL
```
/api/v1/modules
```

##### 4.5.1 Get All Modules

**Request:**
```http
GET /api/v1/modules?programId=uuid-program-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Modules retrieved successfully",
  "data": [
    {
      "id": "uuid-module-1",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "creditScore": 3,
      "programId": "uuid-program-1",
      "programName": "Computer Science",
      "departmentId": "uuid-dept-1",
      "departmentName": "School of Computing",
      "intakeId": "uuid-intake-1",
      "intakeName": "January 2025",
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.5.2 Get Student Modules

**Request:**
```http
GET /api/v1/modules/student/{studentId}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Student modules retrieved successfully",
  "data": [
    {
      "id": "uuid-module-1",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "creditScore": 3,
      "enrollmentStatus": "active",
      "lectureMaterialsCount": 15,
      "assignmentsCount": 3,
      "completedAssignments": 2,
      "upcomingAssignments": 1
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.6 Lecture Materials API

#### Base URL
```
/api/v1/lecture-materials
```

##### 4.6.1 Get Lecture Materials by Module

**Request:**
```http
GET /api/v1/lecture-materials?moduleId=uuid-module-1&intakeId=uuid-intake-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Lecture materials retrieved successfully",
  "data": [
    {
      "id": "uuid-material-1",
      "title": "Week 1: Introduction to Python",
      "description": "Getting started with Python programming",
      "fileUrl": "https://storage.example.com/materials/week1-intro.pdf",
      "fileName": "week1-intro.pdf",
      "fileType": "application/pdf",
      "fileSize": 2048576,
      "weekNumber": 1,
      "moduleId": "uuid-module-1",
      "moduleName": "Introduction to Programming",
      "uploadedBy": "uuid-lecturer-1",
      "uploaderName": "Dr. Smith",
      "uploadedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.6.2 Upload Lecture Material

**Request:**
```http
POST /api/v1/lecture-materials
Content-Type: multipart/form-data

{
  "moduleId": "uuid-module-1",
  "intakeId": "uuid-intake-1",
  "title": "Week 2: Control Structures",
  "description": "If statements, loops, and functions",
  "weekNumber": 2,
  "file": <binary-file-data>
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Lecture material uploaded successfully",
  "data": {
    "id": "uuid-material-2",
    "title": "Week 2: Control Structures",
    "fileUrl": "https://storage.example.com/materials/week2-control.pdf",
    "fileName": "week2-control.pdf",
    "fileType": "application/pdf",
    "fileSize": 1536789,
    "weekNumber": 2,
    "uploadedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.7 Assignments API

#### Base URL
```
/api/v1/assignments
```

##### 4.7.1 Get All Assignments

**Request:**
```http
GET /api/v1/assignments?moduleId=uuid-module-1&intakeId=uuid-intake-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Assignments retrieved successfully",
  "data": [
    {
      "id": "uuid-assignment-1",
      "title": "Python Basics Assignment",
      "description": "Complete exercises on variables, data types, and operators",
      "dueDate": "2025-12-30T23:59:59.000Z",
      "maxMarks": 100,
      "moduleId": "uuid-module-1",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "intakeId": "uuid-intake-1",
      "intakeName": "January 2025",
      "isPublished": true,
      "assignmentFileUrl": "https://storage.example.com/assignments/assignment1.pdf",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.7.2 Create Assignment

**Request:**
```http
POST /api/v1/assignments
Content-Type: multipart/form-data

{
  "moduleId": "uuid-module-1",
  "intakeId": "uuid-intake-1",
  "title": "Final Project",
  "description": "Develop a complete Python application",
  "dueDate": "2026-01-31T23:59:59.000Z",
  "maxMarks": 150,
  "isPublished": true,
  "file": <binary-file-data>
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Assignment created successfully",
  "data": {
    "id": "uuid-assignment-2",
    "title": "Final Project",
    "dueDate": "2026-01-31T23:59:59.000Z",
    "maxMarks": 150,
    "isPublished": true,
    "createdAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.7.3 Get Student Assignment Submissions

**Request:**
```http
GET /api/v1/assignments/{assignmentId}/submissions
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Assignment submissions retrieved successfully",
  "data": [
    {
      "id": "uuid-submission-1",
      "assignmentId": "uuid-assignment-1",
      "studentId": "uuid-student-1",
      "studentName": "John Doe",
      "studentEmail": "john.doe@example.com",
      "submissionFileUrl": "https://storage.example.com/submissions/sub1.zip",
      "fileName": "assignment1_johndoe.zip",
      "marksObtained": 85,
      "status": "graded",
      "feedback": "Excellent work! Well structured code.",
      "submittedAt": "2025-12-28T15:30:00.000Z",
      "gradedAt": "2025-12-29T10:00:00.000Z",
      "gradedBy": "uuid-lecturer-1"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.7.4 Submit Assignment (Student)

**Request:**
```http
POST /api/v1/assignments/{assignmentId}/submit
Content-Type: multipart/form-data

{
  "comments": "My submission for Assignment 1",
  "file": <binary-file-data>
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Assignment submitted successfully",
  "data": {
    "id": "uuid-submission-2",
    "assignmentId": "uuid-assignment-1",
    "fileName": "assignment1_submission.zip",
    "fileSize": 5242880,
    "submittedAt": "2025-12-19T03:15:22.714Z",
    "status": "submitted"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.7.5 Grade Assignment Submission

**Request:**
```http
PUT /api/v1/assignments/submissions/{submissionId}/grade
Content-Type: application/json

{
  "marksObtained": 92,
  "feedback": "Great work! Minor improvements needed in error handling."
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Assignment graded successfully",
  "data": {
    "id": "uuid-submission-2",
    "marksObtained": 92,
    "status": "graded",
    "feedback": "Great work! Minor improvements needed in error handling.",
    "gradedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.8 Exams API

#### Base URL
```
/api/v1/exams
```

##### 4.8.1 Get All Exams

**Request:**
```http
GET /api/v1/exams?moduleId=uuid-module-1&intakeId=uuid-intake-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Exams retrieved successfully",
  "data": [
    {
      "id": "uuid-exam-1",
      "examName": "Mid-Term Exam",
      "examType": "mid-term",
      "examDate": "2025-12-15",
      "startTime": "09:00:00",
      "endTime": "12:00:00",
      "duration": 180,
      "location": "Hall A, Main Building",
      "maxMarks": 100,
      "instructions": "Closed book exam. Calculators allowed.",
      "moduleId": "uuid-module-1",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "intakeId": "uuid-intake-1",
      "intakeName": "January 2025",
      "isPublished": true,
      "createdAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.8.2 Get Student Exam Schedule

**Request:**
```http
GET /api/v1/exams/student/{studentId}/schedule
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Exam schedule retrieved successfully",
  "data": [
    {
      "id": "uuid-exam-1",
      "examName": "Mid-Term Exam",
      "examType": "mid-term",
      "examDate": "2025-12-15",
      "startTime": "09:00:00",
      "endTime": "12:00:00",
      "location": "Hall A, Main Building",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "programName": "Computer Science",
      "departmentName": "School of Computing",
      "creditScore": 3,
      "instructions": "Closed book exam. Calculators allowed."
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.8.3 Create Exam

**Request:**
```http
POST /api/v1/exams
Content-Type: application/json

{
  "moduleId": "uuid-module-1",
  "intakeId": "uuid-intake-1",
  "examName": "Final Exam",
  "examType": "final",
  "examDate": "2026-01-20",
  "startTime": "14:00:00",
  "endTime": "17:00:00",
  "duration": 180,
  "location": "Hall B, Exam Center",
  "maxMarks": 100,
  "instructions": "Open book. All materials allowed.",
  "isPublished": true
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Exam created successfully",
  "data": {
    "id": "uuid-exam-2",
    "examName": "Final Exam",
    "examDate": "2026-01-20",
    "startTime": "14:00:00",
    "endTime": "17:00:00",
    "location": "Hall B, Exam Center",
    "createdAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.9 Marks Management API

#### Base URL
```
/api/v1/marks
```

##### 4.9.1 Get Assignment Submissions for Grading

**Request:**
```http
GET /api/v1/marks/assignments?status=pending&moduleId=uuid-module-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Assignment submissions retrieved successfully",
  "data": [
    {
      "id": "uuid-submission-3",
      "assignmentId": "uuid-assignment-1",
      "assignmentTitle": "Python Basics Assignment",
      "maxMarks": 100,
      "studentId": "uuid-student-3",
      "studentName": "Alice Johnson",
      "studentEmail": "alice@example.com",
      "marksObtained": null,
      "status": "pending",
      "submittedAt": "2025-12-28T18:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.9.2 Get Exam Submissions for Grading

**Request:**
```http
GET /api/v1/marks/exams?status=pending&examId=uuid-exam-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Exam submissions retrieved successfully",
  "data": [
    {
      "id": "uuid-exam-sub-1",
      "examId": "uuid-exam-1",
      "examName": "Mid-Term Exam",
      "maxMarks": 100,
      "studentId": "uuid-student-4",
      "studentName": "Bob Williams",
      "studentEmail": "bob@example.com",
      "score": null,
      "status": "pending",
      "createdAt": "2025-12-15T12:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.9.3 Enter Exam Marks

**Request:**
```http
PUT /api/v1/marks/exams/{examSubmissionId}
Content-Type: application/json

{
  "score": 85,
  "feedback": "Good performance overall"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Exam marks entered successfully",
  "data": {
    "id": "uuid-exam-sub-1",
    "score": 85,
    "status": "graded",
    "gradedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.9.4 Get Overall Scores by Module

**Request:**
```http
GET /api/v1/marks/overall?moduleId=uuid-module-1&intakeId=uuid-intake-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Overall scores retrieved successfully",
  "data": [
    {
      "id": "uuid-score-1",
      "studentId": "uuid-student-1",
      "studentName": "John Doe",
      "studentEmail": "john.doe@example.com",
      "moduleId": "uuid-module-1",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "assignmentScore": 88.5,
      "examScore": 85.0,
      "overallScore": 86.5,
      "grade": "A",
      "isFinalized": true
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.9.5 Calculate and Finalize Grades

**Request:**
```http
POST /api/v1/marks/calculate
Content-Type: application/json

{
  "moduleId": "uuid-module-1",
  "intakeId": "uuid-intake-1",
  "assignmentsWeight": 40,
  "examsWeight": 60
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Grades calculated and finalized successfully",
  "data": {
    "moduleId": "uuid-module-1",
    "studentsGraded": 25,
    "averageScore": 78.5,
    "gradeDistribution": {
      "A+": 5,
      "A": 8,
      "A-": 6,
      "B+": 4,
      "B": 2
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.9.6 Get Student Results

**Request:**
```http
GET /api/v1/marks/student/{studentId}/results
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Student results retrieved successfully",
  "data": [
    {
      "moduleId": "uuid-module-1",
      "moduleCode": "CS101",
      "moduleName": "Introduction to Programming",
      "creditScore": 3,
      "programName": "Computer Science",
      "departmentName": "School of Computing",
      "facultyName": "Faculty of Science & Technology",
      "totalMarks": 100,
      "obtainedMarks": 86.5,
      "percentage": 86.5,
      "grade": "A",
      "gpa": 4.0
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.10 Payments API

#### Base URL
```
/api/v1/payments
```

##### 4.10.1 Get All Payments

**Request:**
```http
GET /api/v1/payments?status=pending&page=1&size=10
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Payments retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid-payment-1",
        "studentId": "uuid-student-1",
        "studentName": "John Doe",
        "studentEmail": "john.doe@example.com",
        "programName": "Computer Science",
        "intakeName": "January 2025",
        "amount": 50000.00,
        "paymentDate": "2025-12-18",
        "paymentSlipUrl": "https://storage.example.com/payment-slips/slip1.jpg",
        "status": "pending",
        "createdAt": "2025-12-18T10:00:00.000Z",
        "updatedAt": "2025-12-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 3,
      "totalItems": 25,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.10.2 Submit Payment (Student)

**Request:**
```http
POST /api/v1/payments
Content-Type: multipart/form-data

{
  "amount": 50000.00,
  "paymentDate": "2025-12-19",
  "file": <binary-payment-slip>
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Payment submitted successfully. Awaiting verification.",
  "data": {
    "id": "uuid-payment-2",
    "amount": 50000.00,
    "paymentDate": "2025-12-19",
    "paymentSlipUrl": "https://storage.example.com/payment-slips/slip2.jpg",
    "status": "pending",
    "createdAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.10.3 Verify Payment (Admin)

**Request:**
```http
PUT /api/v1/payments/{id}/verify
Content-Type: application/json

{
  "status": "verified",
  "notes": "Payment verified. Bank deposit confirmed."
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Payment verified successfully",
  "data": {
    "id": "uuid-payment-1",
    "status": "verified",
    "verifiedBy": "uuid-admin-1",
    "verifiedAt": "2025-12-19T03:15:22.714Z",
    "notes": "Payment verified. Bank deposit confirmed."
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.10.4 Reject Payment (Admin)

**Request:**
```http
PUT /api/v1/payments/{id}/reject
Content-Type: application/json

{
  "status": "rejected",
  "notes": "Invalid payment slip. Please resubmit."
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Payment rejected",
  "data": {
    "id": "uuid-payment-1",
    "status": "rejected",
    "verifiedBy": "uuid-admin-1",
    "verifiedAt": "2025-12-19T03:15:22.714Z",
    "notes": "Invalid payment slip. Please resubmit."
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.10.5 Get Student Payment History

**Request:**
```http
GET /api/v1/payments/student/{studentId}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Payment history retrieved successfully",
  "data": [
    {
      "id": "uuid-payment-1",
      "amount": 50000.00,
      "paymentDate": "2025-12-18",
      "status": "verified",
      "verifiedAt": "2025-12-19T02:00:00.000Z",
      "notes": "Payment verified. Bank deposit confirmed."
    },
    {
      "id": "uuid-payment-2",
      "amount": 50000.00,
      "paymentDate": "2025-11-18",
      "status": "verified",
      "verifiedAt": "2025-11-19T02:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.11 Applications & Inquiries API

#### Base URL
```
/api/v1/applications
```

##### 4.11.1 Get All Applications

**Request:**
```http
GET /api/v1/applications?status=pending
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Applications retrieved successfully",
  "data": [
    {
      "id": "uuid-app-1",
      "name": "Sarah Connor",
      "email": "sarah@example.com",
      "phone": "+94771234571",
      "programId": "uuid-program-1",
      "programName": "Computer Science",
      "status": "pending",
      "notes": null,
      "createdAt": "2025-12-18T14:30:00.000Z",
      "updatedAt": "2025-12-18T14:30:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.11.2 Submit Application (Public)

**Request:**
```http
POST /api/v1/applications
Content-Type: application/json

{
  "name": "Mike Johnson",
  "email": "mike@example.com",
  "phone": "+94771234572",
  "programId": "uuid-program-1",
  "message": "I am interested in enrolling in the Computer Science program."
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Application submitted successfully. We will contact you soon.",
  "data": {
    "id": "uuid-app-2",
    "name": "Mike Johnson",
    "email": "mike@example.com",
    "status": "pending",
    "createdAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.11.3 Update Application Status (Admin)

**Request:**
```http
PUT /api/v1/applications/{id}
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Called applicant. Scheduled interview for next week."
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Application updated successfully",
  "data": {
    "id": "uuid-app-1",
    "status": "contacted",
    "notes": "Called applicant. Scheduled interview for next week.",
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.11.4 Get All Inquiries

**Request:**
```http
GET /api/v1/inquiries?status=unread
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Inquiries retrieved successfully",
  "data": [
    {
      "id": "uuid-inquiry-1",
      "name": "David Lee",
      "email": "david@example.com",
      "phone": "+94771234573",
      "subject": "Course Information",
      "message": "Could you provide more details about the AI specialization?",
      "status": "unread",
      "createdAt": "2025-12-19T01:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.11.5 Submit Inquiry (Public)

**Request:**
```http
POST /api/v1/inquiries
Content-Type: application/json

{
  "name": "Emma Watson",
  "email": "emma@example.com",
  "phone": "+94771234574",
  "subject": "Admission Requirements",
  "message": "What are the requirements for international students?"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Inquiry submitted successfully. We will respond soon.",
  "data": {
    "id": "uuid-inquiry-2",
    "name": "Emma Watson",
    "email": "emma@example.com",
    "status": "unread",
    "createdAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.12 Reports & Analytics API

#### Base URL
```
/api/v1/reports
```

##### 4.12.1 Get Dashboard Statistics

**Request:**
```http
GET /api/v1/reports/dashboard
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "students": {
      "total": 250,
      "active": 230,
      "inactive": 20,
      "newThisMonth": 15
    },
    "payments": {
      "pending": 35,
      "verified": 215,
      "rejected": 5,
      "totalRevenue": 12500000.00
    },
    "courses": {
      "total": 45,
      "active": 40,
      "inactive": 5
    },
    "applications": {
      "pending": 12,
      "contacted": 8,
      "enrolled": 45,
      "rejected": 3
    },
    "assignments": {
      "total": 120,
      "submitted": 2850,
      "graded": 2700,
      "pending": 150
    },
    "exams": {
      "upcoming": 5,
      "completed": 25,
      "inProgress": 2
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.12.2 Get Enrollment Report

**Request:**
```http
GET /api/v1/reports/enrollment?programId=uuid-program-1&year=2025
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Enrollment report retrieved successfully",
  "data": {
    "programName": "Computer Science",
    "year": 2025,
    "totalEnrollments": 85,
    "byIntake": [
      {
        "intakeName": "January 2025",
        "enrollments": 45
      },
      {
        "intakeName": "July 2025",
        "enrollments": 40
      }
    ],
    "byStatus": {
      "active": 80,
      "dropout": 3,
      "graduated": 2
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.12.3 Get Performance Report

**Request:**
```http
GET /api/v1/reports/performance?moduleId=uuid-module-1&intakeId=uuid-intake-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Performance report retrieved successfully",
  "data": {
    "moduleCode": "CS101",
    "moduleName": "Introduction to Programming",
    "intakeName": "January 2025",
    "totalStudents": 45,
    "averageScore": 78.5,
    "highestScore": 95.0,
    "lowestScore": 52.0,
    "passRate": 91.1,
    "gradeDistribution": {
      "A+": 5,
      "A": 12,
      "A-": 10,
      "B+": 8,
      "B": 6,
      "C+": 2,
      "C": 1,
      "F": 1
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.13 Notifications API

#### Base URL
```
/api/v1/notifications
```

##### 4.13.1 Get User Notifications

**Request:**
```http
GET /api/v1/notifications?userId=uuid-user-1&isRead=false
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "uuid-notif-1",
      "userId": "uuid-user-1",
      "type": "assignment",
      "title": "New Assignment Posted",
      "message": "A new assignment has been posted for CS101",
      "link": "/student/modules/uuid-module-1",
      "isRead": false,
      "createdAt": "2025-12-19T02:00:00.000Z"
    },
    {
      "id": "uuid-notif-2",
      "userId": "uuid-user-1",
      "type": "payment",
      "title": "Payment Verified",
      "message": "Your payment of Rs. 50,000 has been verified",
      "link": "/student/payments",
      "isRead": false,
      "createdAt": "2025-12-19T01:30:00.000Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.13.2 Mark Notification as Read

**Request:**
```http
PUT /api/v1/notifications/{id}/read
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Notification marked as read",
  "data": {
    "id": "uuid-notif-1",
    "isRead": true,
    "readAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.13.3 Mark All Notifications as Read

**Request:**
```http
PUT /api/v1/notifications/mark-all-read?userId=uuid-user-1
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "All notifications marked as read",
  "data": {
    "userId": "uuid-user-1",
    "notificationsMarked": 5
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

### 4.14 Social Media Links API

#### Base URL
```
/api/v1/social-media
```

#### Endpoints

##### 4.1.1 Get All Social Media Links

**Request:**
```http
GET /api/v1/social-media
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Social media links retrieved successfully",
  "data": [
    {
      "id": 1,
      "platform": "Facebook",
      "url": "https://facebook.com/sips",
      "icon": "facebook",
      "displayOrder": 1,
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    },
    {
      "id": 2,
      "platform": "Twitter",
      "url": "https://twitter.com/sips",
      "icon": "twitter",
      "displayOrder": 2,
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    },
    {
      "id": 3,
      "platform": "LinkedIn",
      "url": "https://linkedin.com/company/sips",
      "icon": "linkedin",
      "displayOrder": 3,
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    },
    {
      "id": 4,
      "platform": "Instagram",
      "url": "https://instagram.com/sips",
      "icon": "instagram",
      "displayOrder": 4,
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.1.2 Get Social Media Link by ID

**Request:**
```http
GET /api/v1/social-media/{id}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Social media link retrieved successfully",
  "data": {
    "id": 1,
    "platform": "Facebook",
    "url": "https://facebook.com/sips",
    "icon": "facebook",
    "displayOrder": 1,
    "isActive": true,
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": "404",
  "message": "Social media link not found",
  "data": null,
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.1.3 Create Social Media Link

**Request:**
```http
POST /api/v1/social-media
Content-Type: application/json

{
  "platform": "YouTube",
  "url": "https://youtube.com/@sips",
  "icon": "youtube",
  "displayOrder": 5,
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Social media link created successfully",
  "data": {
    "id": 5,
    "platform": "YouTube",
    "url": "https://youtube.com/@sips",
    "icon": "youtube",
    "displayOrder": 5,
    "isActive": true,
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "statusCode": "400",
  "message": "Invalid request parameters",
  "data": {
    "errors": [
      {
        "field": "url",
        "message": "URL must be a valid URL format"
      },
      {
        "field": "platform",
        "message": "Platform name is required"
      }
    ]
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.1.4 Update Social Media Link

**Request:**
```http
PUT /api/v1/social-media/{id}
Content-Type: application/json

{
  "platform": "Facebook",
  "url": "https://facebook.com/sips-updated",
  "icon": "facebook",
  "displayOrder": 1,
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Social media link updated successfully",
  "data": {
    "id": 1,
    "platform": "Facebook",
    "url": "https://facebook.com/sips-updated",
    "icon": "facebook",
    "displayOrder": 1,
    "isActive": true,
    "updatedAt": "2025-12-19T03:20:00.000Z"
  },
  "timestamp": "2025-12-19T03:20:00.000Z"
}
```

##### 4.1.5 Delete Social Media Link

**Request:**
```http
DELETE /api/v1/social-media/{id}
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Social media link deleted successfully",
  "data": null,
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.1.6 Get Active Social Media Links

**Request:**
```http
GET /api/v1/social-media/active
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Active social media links retrieved successfully",
  "data": [
    {
      "id": 1,
      "platform": "Facebook",
      "url": "https://facebook.com/sips",
      "icon": "facebook",
      "displayOrder": 1,
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

### 4.2 Courses API

#### Base URL
```
/api/v1/courses
```

##### 4.2.1 Get All Courses

**Request:**
```http
GET /api/v1/courses
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Courses retrieved successfully",
  "data": [
    {
      "id": 1,
      "courseCode": "CS101",
      "courseName": "Introduction to Computer Science",
      "description": "Fundamental concepts of computer science",
      "credits": 3,
      "isActive": true,
      "programId": 1,
      "programName": "Computer Science",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

##### 4.2.2 Get Paginated Courses

**Request:**
```http
GET /api/v1/courses/paginated?page=1&size=10&search=computer
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `size` (optional, default: 10): Items per page
- `search` (optional): Search term

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Courses retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "courseCode": "CS101",
        "courseName": "Introduction to Computer Science",
        "description": "Fundamental concepts of computer science",
        "credits": 3,
        "isActive": true,
        "programId": 1,
        "programName": "Computer Science",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-12-19T03:15:22.714Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

### 4.3 Students API

#### Base URL
```
/api/v1/students
```

##### 4.3.1 Get All Students

**Request:**
```http
GET /api/v1/students
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Students retrieved successfully",
  "data": [
    {
      "id": 1,
      "studentId": "STU2025001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "programId": 1,
      "programName": "Computer Science",
      "enrollmentDate": "2025-01-15T00:00:00.000Z",
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

### 4.4 Programs API

#### Base URL
```
/api/v1/programs
```

##### 4.4.1 Get All Programs

**Request:**
```http
GET /api/v1/programs
```

**Response:** `200 OK`
```json
{
  "statusCode": "200",
  "message": "Programs retrieved successfully",
  "data": [
    {
      "id": 1,
      "programCode": "CS",
      "programName": "Computer Science",
      "description": "Bachelor of Science in Computer Science",
      "duration": 4,
      "durationUnit": "years",
      "departmentId": 1,
      "departmentName": "School of Computing",
      "isActive": true,
      "updatedAt": "2025-12-19T03:15:22.714Z"
    }
  ],
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

### 4.5 Enrollments API

#### Base URL
```
/api/v1/enrollments
```

##### 4.5.1 Enroll Student in Course

**Request:**
```http
POST /api/v1/enrollments
Content-Type: application/json

{
  "studentId": 1,
  "courseId": 1,
  "academicYear": "2025",
  "semester": "Spring"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": "201",
  "message": "Student enrolled successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "studentName": "John Doe",
    "courseId": 1,
    "courseName": "Introduction to Computer Science",
    "academicYear": "2025",
    "semester": "Spring",
    "enrollmentDate": "2025-12-19T03:15:22.714Z",
    "status": "ACTIVE",
    "updatedAt": "2025-12-19T03:15:22.714Z"
  },
  "timestamp": "2025-12-19T03:15:22.714Z"
}
```

---

## 5. Implementation Examples

### 5.1 Entity Class - SocialMediaLink

```java
package com.sips.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_media_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialMediaLink {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String platform;
    
    @Column(nullable = false, length = 255)
    private String url;
    
    @Column(nullable = false, length = 50)
    private String icon;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

### 5.2 DTO - SocialMediaLinkDTO

```java
package com.sips.lms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialMediaLinkDTO {
    
    private Long id;
    
    @NotBlank(message = "Platform is required")
    private String platform;
    
    @NotBlank(message = "URL is required")
    @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://")
    private String url;
    
    @NotBlank(message = "Icon is required")
    private String icon;
    
    @NotNull(message = "Display order is required")
    private Integer displayOrder;
    
    private Boolean isActive;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime updatedAt;
}
```

### 5.3 Repository

```java
package com.sips.lms.repository;

import com.sips.lms.entity.SocialMediaLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialMediaLinkRepository extends JpaRepository<SocialMediaLink, Long> {
    
    List<SocialMediaLink> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    List<SocialMediaLink> findAllByOrderByDisplayOrderAsc();
    
    boolean existsByPlatform(String platform);
}
```

### 5.4 Service

```java
package com.sips.lms.service;

import com.sips.lms.dto.SocialMediaLinkDTO;
import com.sips.lms.entity.SocialMediaLink;
import com.sips.lms.exception.ResourceNotFoundException;
import com.sips.lms.repository.SocialMediaLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialMediaLinkService {
    
    private final SocialMediaLinkRepository repository;
    
    public List<SocialMediaLinkDTO> getAllLinks() {
        return repository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<SocialMediaLinkDTO> getActiveLinks() {
        return repository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public SocialMediaLinkDTO getLinkById(Long id) {
        SocialMediaLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Social media link not found with id: " + id));
        return convertToDTO(link);
    }
    
    @Transactional
    public SocialMediaLinkDTO createLink(SocialMediaLinkDTO dto) {
        SocialMediaLink link = SocialMediaLink.builder()
                .platform(dto.getPlatform())
                .url(dto.getUrl())
                .icon(dto.getIcon())
                .displayOrder(dto.getDisplayOrder())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        
        SocialMediaLink savedLink = repository.save(link);
        return convertToDTO(savedLink);
    }
    
    @Transactional
    public SocialMediaLinkDTO updateLink(Long id, SocialMediaLinkDTO dto) {
        SocialMediaLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Social media link not found with id: " + id));
        
        link.setPlatform(dto.getPlatform());
        link.setUrl(dto.getUrl());
        link.setIcon(dto.getIcon());
        link.setDisplayOrder(dto.getDisplayOrder());
        link.setIsActive(dto.getIsActive());
        
        SocialMediaLink updatedLink = repository.save(link);
        return convertToDTO(updatedLink);
    }
    
    @Transactional
    public void deleteLink(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Social media link not found with id: " + id);
        }
        repository.deleteById(id);
    }
    
    private SocialMediaLinkDTO convertToDTO(SocialMediaLink entity) {
        return SocialMediaLinkDTO.builder()
                .id(entity.getId())
                .platform(entity.getPlatform())
                .url(entity.getUrl())
                .icon(entity.getIcon())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
```

### 5.5 Controller

```java
package com.sips.lms.controller;

import com.sips.lms.dto.SocialMediaLinkDTO;
import com.sips.lms.dto.response.ApiResponse;
import com.sips.lms.service.SocialMediaLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/social-media")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SocialMediaLinkController {
    
    private final SocialMediaLinkService service;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<SocialMediaLinkDTO>>> getAllLinks() {
        List<SocialMediaLinkDTO> links = service.getAllLinks();
        ApiResponse<List<SocialMediaLinkDTO>> response = ApiResponse.success(
                links,
                "Social media links retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SocialMediaLinkDTO>>> getActiveLinks() {
        List<SocialMediaLinkDTO> links = service.getActiveLinks();
        ApiResponse<List<SocialMediaLinkDTO>> response = ApiResponse.success(
                links,
                "Active social media links retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SocialMediaLinkDTO>> getLinkById(@PathVariable Long id) {
        SocialMediaLinkDTO link = service.getLinkById(id);
        ApiResponse<SocialMediaLinkDTO> response = ApiResponse.success(
                link,
                "Social media link retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<SocialMediaLinkDTO>> createLink(
            @Valid @RequestBody SocialMediaLinkDTO dto) {
        SocialMediaLinkDTO createdLink = service.createLink(dto);
        ApiResponse<SocialMediaLinkDTO> response = ApiResponse.created(
                createdLink,
                "Social media link created successfully"
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SocialMediaLinkDTO>> updateLink(
            @PathVariable Long id,
            @Valid @RequestBody SocialMediaLinkDTO dto) {
        SocialMediaLinkDTO updatedLink = service.updateLink(id, dto);
        ApiResponse<SocialMediaLinkDTO> response = ApiResponse.success(
                updatedLink,
                "Social media link updated successfully"
        );
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLink(@PathVariable Long id) {
        service.deleteLink(id);
        ApiResponse<Void> response = ApiResponse.success(
                null,
                "Social media link deleted successfully"
        );
        return ResponseEntity.ok(response);
    }
}
```

---

## 6. Error Handling

### 6.1 Custom Exceptions

```java
package com.sips.lms.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

```java
package com.sips.lms.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
```

```java
package com.sips.lms.exception;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
```

### 6.2 Global Exception Handler

```java
package com.sips.lms.exception;

import com.sips.lms.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse<Void> response = ApiResponse.notFound(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        ApiResponse<Void> response = ApiResponse.badRequest(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
        ApiResponse<Void> response = ApiResponse.error("409", ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        List<Map<String, String>> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> {
                    Map<String, String> errorMap = new HashMap<>();
                    errorMap.put("field", error.getField());
                    errorMap.put("message", error.getDefaultMessage());
                    return errorMap;
                })
                .collect(Collectors.toList());
        
        Map<String, Object> errorData = new HashMap<>();
        errorData.put("errors", errors);
        
        ApiResponse<Map<String, Object>> response = ApiResponse.error(
                "400",
                "Validation failed",
                errorData
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        ex.printStackTrace();
        ApiResponse<Void> response = ApiResponse.internalError(
                "An unexpected error occurred: " + ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

---

## 7. Best Practices

### 7.1 Project Structure

```
src/main/java/com/sips/lms/
├── config/                  # Configuration classes
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── SwaggerConfig.java
├── controller/              # REST controllers
│   ├── SocialMediaLinkController.java
│   ├── CourseController.java
│   └── StudentController.java
├── dto/                     # Data Transfer Objects
│   ├── request/
│   ├── response/
│   │   └── ApiResponse.java
│   └── SocialMediaLinkDTO.java
├── entity/                  # JPA entities
│   ├── SocialMediaLink.java
│   ├── Course.java
│   └── Student.java
├── repository/              # Spring Data repositories
│   ├── SocialMediaLinkRepository.java
│   ├── CourseRepository.java
│   └── StudentRepository.java
├── service/                 # Business logic
│   ├── SocialMediaLinkService.java
│   ├── CourseService.java
│   └── StudentService.java
├── exception/               # Custom exceptions
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── BadRequestException.java
└── LmsApplication.java      # Main application
```

### 7.2 Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Spring Boot Starter Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 7.3 Application Properties

```properties
# Application Name
spring.application.name=SIPS-LMS-Backend

# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/sips_lms
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Jackson Configuration
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=UTC

# CORS Configuration
cors.allowed-origins=http://localhost:5173,http://localhost:3000

# Logging
logging.level.com.sips.lms=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

### 7.4 Testing Examples

```java
package com.sips.lms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sips.lms.dto.SocialMediaLinkDTO;
import com.sips.lms.service.SocialMediaLinkService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SocialMediaLinkController.class)
class SocialMediaLinkControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private SocialMediaLinkService service;
    
    @Test
    void getAllLinks_ShouldReturnListOfLinks() throws Exception {
        // Arrange
        List<SocialMediaLinkDTO> links = Arrays.asList(
                SocialMediaLinkDTO.builder()
                        .id(1L)
                        .platform("Facebook")
                        .url("https://facebook.com/sips")
                        .icon("facebook")
                        .displayOrder(1)
                        .isActive(true)
                        .build()
        );
        
        when(service.getAllLinks()).thenReturn(links);
        
        // Act & Assert
        mockMvc.perform(get("/api/v1/social-media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value("200"))
                .andExpect(jsonPath("$.message").value("Social media links retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].platform").value("Facebook"));
    }
    
    @Test
    void createLink_ShouldReturnCreatedLink() throws Exception {
        // Arrange
        SocialMediaLinkDTO inputDTO = SocialMediaLinkDTO.builder()
                .platform("Twitter")
                .url("https://twitter.com/sips")
                .icon("twitter")
                .displayOrder(2)
                .isActive(true)
                .build();
        
        SocialMediaLinkDTO createdDTO = SocialMediaLinkDTO.builder()
                .id(2L)
                .platform("Twitter")
                .url("https://twitter.com/sips")
                .icon("twitter")
                .displayOrder(2)
                .isActive(true)
                .build();
        
        when(service.createLink(any())).thenReturn(createdDTO);
        
        // Act & Assert
        mockMvc.perform(post("/api/v1/social-media")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value("201"))
                .andExpect(jsonPath("$.message").value("Social media link created successfully"))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.platform").value("Twitter"));
    }
}
```

### 7.5 API Documentation with Swagger

Add Swagger dependency:

```xml
<!-- Swagger/OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

Access Swagger UI at: `http://localhost:8080/api/swagger-ui.html`

---

## 8. Database Schema

### 8.1 Core Tables

```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student', -- 'admin', 'instructor', 'student'
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculties
CREATE TABLE faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES faculties(id),
    department_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id),
    program_code TEXT UNIQUE NOT NULL,
    program_name TEXT NOT NULL,
    description TEXT,
    duration INTEGER,
    duration_unit TEXT, -- 'years', 'months'
    level TEXT, -- 'undergraduate', 'postgraduate', 'diploma'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intakes
CREATE TABLE intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_name TEXT NOT NULL, -- 'January 2025', 'July 2025'
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES profiles(id),
    student_id TEXT UNIQUE NOT NULL,
    address TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    enrollment_date DATE,
    status TEXT DEFAULT 'active', -- 'active', 'dropout', 'graduated', 'suspended'
    payment_status TEXT DEFAULT 'pending', -- 'paid', 'pending', 'partial'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Programs (Many-to-Many)
CREATE TABLE student_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    program_id UUID REFERENCES programs(id),
    intake_id UUID REFERENCES intakes(id),
    enrollment_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_code TEXT NOT NULL,
    module_name TEXT NOT NULL,
    credit_score INTEGER,
    program_id UUID REFERENCES programs(id),
    department_id UUID REFERENCES departments(id),
    intake_id UUID REFERENCES intakes(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lecture Materials
CREATE TABLE lecture_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id),
    intake_id UUID REFERENCES intakes(id),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size BIGINT,
    week_number INTEGER,
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id),
    intake_id UUID REFERENCES intakes(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    max_marks INTEGER DEFAULT 100,
    is_published BOOLEAN DEFAULT false,
    assignment_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id),
    student_id UUID REFERENCES profiles(id),
    submission_file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    marks_obtained DECIMAL(5,2),
    status TEXT DEFAULT 'submitted', -- 'submitted', 'graded', 'late'
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES profiles(id)
);

-- Exams
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id),
    intake_id UUID REFERENCES intakes(id),
    exam_name TEXT NOT NULL,
    exam_type TEXT, -- 'mid-term', 'final', 'quiz'
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    duration INTEGER, -- minutes
    location TEXT,
    max_marks INTEGER DEFAULT 100,
    instructions TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Submissions
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id),
    student_id UUID REFERENCES profiles(id),
    score DECIMAL(5,2),
    status TEXT DEFAULT 'pending', -- 'pending', 'graded'
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES profiles(id)
);

-- Overall Scores
CREATE TABLE overall_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id),
    module_id UUID REFERENCES modules(id),
    assignment_score DECIMAL(5,2),
    exam_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    grade TEXT, -- 'A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'F'
    is_finalized BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score Weights
CREATE TABLE score_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id),
    intake_id UUID REFERENCES intakes(id),
    assignments_weight INTEGER DEFAULT 40, -- percentage
    exams_weight INTEGER DEFAULT 60, -- percentage
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    payment_slip_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    notes TEXT,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    program_id UUID REFERENCES programs(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'enrolled', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'responded'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    type TEXT NOT NULL, -- 'assignment', 'exam', 'payment', 'grade', 'announcement'
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    document_type TEXT NOT NULL, -- 'ID_CARD', 'BIRTH_CERTIFICATE', etc.
    document_url TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Links
CREATE TABLE social_media_links (
    id BIGSERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_assignments_module ON assignments(module_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_exam_submissions_student ON exam_submissions(student_id);
CREATE INDEX idx_overall_scores_student ON overall_scores(student_id);
CREATE INDEX idx_overall_scores_module ON overall_scores(module_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

## Summary

This comprehensive guide provides a complete reference for developing the Spring Boot backend for the **SIPS Learning Management System** with standardized API responses. The guide covers all major functional modules of the LMS platform.

### Key Features:
- ✅ **Standardized Response Format** - Consistent API responses with statusCode, message, data, and timestamp
- ✅ **Comprehensive API Coverage** - 14 major API modules covering all LMS functionalities
- ✅ **Authentication & Authorization** - JWT-based authentication with role-based access control
- ✅ **Student Management** - Complete student lifecycle from enrollment to graduation
- ✅ **Academic Management** - Programs, courses, modules, and intakes
- ✅ **Content Delivery** - Lecture materials with file upload support
- ✅ **Assessment System** - Assignments and exams with submission tracking
- ✅ **Grading System** - Comprehensive marks management with automatic grade calculation
- ✅ **Payment Processing** - Payment submission and verification workflow
- ✅ **Application Management** - Admissions and inquiry handling
- ✅ **Analytics & Reporting** - Dashboard statistics and performance reports
- ✅ **Notifications** - Real-time user notifications
- ✅ **Error Handling** - Global exception handling with detailed error responses
- ✅ **Validation** - Input validation with descriptive error messages
- ✅ **Pagination** - Efficient data pagination for large datasets
- ✅ **File Management** - Support for document and media uploads
- ✅ **RESTful Design** - Industry-standard REST API patterns

### API Modules Overview:

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Authentication** | `/api/v1/auth/*` | Login, registration, token refresh |
| **Programs** | `/api/v1/programs/*` | Academic program management |
| **Courses** | `/api/v1/courses/*` | Course catalog management |
| **Students** | `/api/v1/students/*` | Student profile and enrollment |
| **Modules** | `/api/v1/modules/*` | Course modules and student assignments |
| **Lecture Materials** | `/api/v1/lecture-materials/*` | Educational content distribution |
| **Assignments** | `/api/v1/assignments/*` | Assignment creation and submission |
| **Exams** | `/api/v1/exams/*` | Exam scheduling and management |
| **Marks Management** | `/api/v1/marks/*` | Grade entry and calculation |
| **Payments** | `/api/v1/payments/*` | Fee payment processing |
| **Applications** | `/api/v1/applications/*` | Admission applications |
| **Reports** | `/api/v1/reports/*` | Analytics and statistics |
| **Notifications** | `/api/v1/notifications/*` | User notifications |
| **Social Media** | `/api/v1/social-media/*` | Website social links |

### Database Schema:
- **25+ Tables** covering all LMS entities
- **UUID Primary Keys** for security and scalability
- **Proper Foreign Keys** maintaining referential integrity
- **Performance Indexes** for optimized queries
- **Timestamp Tracking** for audit trails
- **Status Fields** for workflow management
- **Soft Deletes** with `is_active` flags

### Technology Stack Recommendations:

```xml
<!-- Core Spring Boot -->
- Spring Boot 3.x
- Spring Data JPA
- Spring Security + JWT
- Spring Validation

<!-- Database -->
- PostgreSQL 14+
- Flyway/Liquibase for migrations

<!-- File Storage -->
- AWS S3 or MinIO
- Local file system (development)

<!-- Documentation -->
- SpringDoc OpenAPI 3 (Swagger)

<!-- Testing -->
- JUnit 5
- Mockito
- Spring Boot Test
```

### Implementation Phases:

#### Phase 1: Core Setup (Week 1-2)
- [ ] Project structure and dependencies
- [ ] Database schema creation
- [ ] Authentication & authorization
- [ ] Base entities and repositories
- [ ] Global exception handling
- [ ] API response standardization

#### Phase 2: Student & Academic Management (Week 3-4)
- [ ] Programs and courses API
- [ ] Student management API
- [ ] Modules and enrollments
- [ ] Department and faculty hierarchy
- [ ] Intake management

#### Phase 3: Content & Assessment (Week 5-6)
- [ ] Lecture materials upload/download
- [ ] Assignment creation and submission
- [ ] Exam scheduling
- [ ] File storage integration
- [ ] Submission tracking

#### Phase 4: Grading & Payments (Week 7-8)
- [ ] Assignment grading system
- [ ] Exam scoring
- [ ] Overall grade calculation
- [ ] Payment submission
- [ ] Payment verification workflow

#### Phase 5: Supporting Features (Week 9-10)
- [ ] Applications and inquiries
- [ ] Notifications system
- [ ] Reports and analytics
- [ ] Dashboard statistics
- [ ] Email notifications

#### Phase 6: Testing & Documentation (Week 11-12)
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] API documentation (Swagger)
- [ ] Performance testing
- [ ] Security audit
- [ ] Deployment preparation

### Security Considerations:

1. **Authentication**
   - JWT tokens with refresh mechanism
   - Password hashing (BCrypt)
   - Token expiration and rotation

2. **Authorization**
   - Role-based access control (Admin, Instructor, Student)
   - Resource-level permissions
   - API endpoint protection

3. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

4. **File Security**
   - File type validation
   - Virus scanning
   - Secure file storage
   - Access control on files

### Performance Optimization:

1. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Pagination for large datasets

2. **Caching**
   - Redis for session management
   - Cache frequently accessed data
   - Cache invalidation strategies

3. **API**
   - Response compression
   - Rate limiting
   - Load balancing
   - CDN for static files

### Monitoring & Logging:

```properties
# Logging levels
logging.level.com.sips.lms=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Metrics
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

### Next Steps:

1. **Setup Development Environment**
   - Install Java 17+, Maven, PostgreSQL
   - Configure IDE (IntelliJ IDEA/Eclipse)
   - Setup version control (Git)

2. **Initialize Project**
   - Generate Spring Boot project
   - Configure application properties
   - Setup database connection

3. **Implement Core Features**
   - Follow implementation phases
   - Write tests alongside features
   - Document APIs as you build

4. **Integrate with Frontend**
   - Configure CORS
   - Test with React frontend
   - Handle file uploads/downloads

5. **Deploy**
   - Setup CI/CD pipeline
   - Configure production database
   - Deploy to cloud (AWS/Azure/GCP)
   - Monitor and maintain

### Support & Resources:

- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Spring Security**: https://spring.io/projects/spring-security
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Swagger/OpenAPI**: https://swagger.io/specification/

### Contact:
For questions, clarifications, or support during development, refer to specific sections of this document or consult with the development team.

---

**Document Version**: 2.0  
**Last Updated**: December 19, 2025  
**Author**: SIPS Development Team
