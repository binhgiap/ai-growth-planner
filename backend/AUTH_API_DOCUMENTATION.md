# Authentication API Documentation

This document provides comprehensive documentation for the Authentication API endpoints that the frontend can use for user authentication and authorization.

## Base Information

- **Base URL**: `http://localhost:3000/api` (development) or your production URL
- **API Prefix**: `/api`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token (for protected endpoints)

## Authentication Flow

1. User registers or logs in → Receives JWT `accessToken`
2. Store the `accessToken` securely (e.g., localStorage, secure cookie)
3. Include token in Authorization header for protected endpoints: `Authorization: Bearer <accessToken>`
4. Token expires after 24 hours (configurable via `JWT_EXPIRES_IN` env variable)
5. Use `/auth/refresh` to get a new token if needed

---

## Endpoints

### 1. Register New User

Register a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "currentRole": "Software Engineer",      // Optional
  "targetRole": "Senior Engineer"          // Optional
}
```

**Request Schema**:
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `firstName` (string, required)
- `lastName` (string, required)
- `currentRole` (string, optional): Current job role
- `targetRole` (string, optional): Target job role

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Email already registered or validation error
  ```json
  {
    "statusCode": 400,
    "message": "Email already registered",
    "error": "Bad Request"
  }
  ```

**Example Frontend Code**:
```typescript
const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currentRole?: string;
  targetRole?: string;
}) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const result = await response.json();
  
  // Store token and user data
  localStorage.setItem('accessToken', result.data.accessToken);
  localStorage.setItem('user', JSON.stringify(result.data.user));
  
  return result.data;
};
```

---

### 2. Login User

Authenticate an existing user and receive a JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Request Schema**:
- `email` (string, required): Valid email address
- `password` (string, required): User password

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid email or password
  ```json
  {
    "statusCode": 401,
    "message": "Invalid email or password",
    "error": "Unauthorized"
  }
  ```
- `401 Unauthorized`: User account is inactive
  ```json
  {
    "statusCode": 401,
    "message": "User account is inactive",
    "error": "Unauthorized"
  }
  ```

**Example Frontend Code**:
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const result = await response.json();
  
  // Store token and user data
  localStorage.setItem('accessToken', result.data.accessToken);
  localStorage.setItem('user', JSON.stringify(result.data.user));
  
  return result.data;
};
```

---

### 3. Get Current User Profile

Get the authenticated user's profile information.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```

**Example Frontend Code**:
```typescript
const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user profile');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Change Password

Change the user's password.

**Endpoint**: `POST /api/auth/change-password`

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Request Body**:
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Request Schema**:
- `oldPassword` (string, required): Current password
- `newPassword` (string, required): New password (minimum 8 characters)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Current password is incorrect
  ```json
  {
    "statusCode": 401,
    "message": "Current password is incorrect",
    "error": "Unauthorized"
  }
  ```
- `404 Not Found`: User not found
  ```json
  {
    "statusCode": 404,
    "message": "User not found",
    "error": "Not Found"
  }
  ```

**Example Frontend Code**:
```typescript
const changePassword = async (oldPassword: string, newPassword: string) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Refresh Token

Get a new access token using the current token.

**Endpoint**: `POST /api/auth/refresh`

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```

**Example Frontend Code**:
```typescript
const refreshToken = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to refresh token');
  }

  const result = await response.json();
  
  // Update stored token
  localStorage.setItem('accessToken', result.data.accessToken);
  
  return result.data;
};
```

---

## User Roles

The system supports the following user roles:

- `user`: Regular user (default)
- `admin`: Administrator with full access
- `manager`: Manager role (for future use)

---

## Frontend Integration Guide

### 1. Setup API Client

Create a centralized API client with authentication helpers:

```typescript
// api/auth.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Get stored token
const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
```

### 2. Auth Service

```typescript
// services/authService.ts
export const authService = {
  async register(userData: RegisterData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const result = await handleResponse<{ success: boolean; data: AuthResponse }>(response);
    
    // Store token and user
    if (result.data.accessToken) {
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result.data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await handleResponse<{ success: boolean; data: AuthResponse }>(response);
    
    // Store token and user
    if (result.data.accessToken) {
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result.data;
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse<{ success: boolean; data: User }>(response);
    return result.data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    
    const result = await handleResponse<{ success: boolean; data: { message: string } }>(response);
    return result.data;
  },

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse<{ success: boolean; data: { accessToken: string } }>(response);
    
    // Update stored token
    if (result.data.accessToken) {
      localStorage.setItem('accessToken', result.data.accessToken);
    }
    
    return result.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};
```

### 3. TypeScript Types

```typescript
// types/auth.ts
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currentRole?: string;
  targetRole?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin' | 'manager';
    createdAt: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
}
```

### 4. Protected Route Example

```typescript
// components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        // Redirect to login
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
};
```

### 5. Interceptor for Auto Token Refresh (Optional)

```typescript
// utils/apiInterceptor.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('accessToken', refreshData.data.accessToken);

        // Retry original request with new token
        return fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshData.data.accessToken}`,
            ...options.headers,
          },
        }).then((res) => res.json());
      }
    } catch (error) {
      // Refresh failed, redirect to login
      authService.logout();
      window.location.href = '/login';
      throw error;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Error message description",
  "error": "Error Type"
}
```

Common HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or bad request
- `401 Unauthorized`: Authentication required or invalid credentials
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Security Best Practices

1. **Token Storage**: Store JWT tokens securely (consider using httpOnly cookies for production)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Tokens expire after 24 hours - implement token refresh logic
4. **Password Requirements**: Enforce minimum 8 characters for passwords
5. **Rate Limiting**: Consider implementing rate limiting on login/register endpoints
6. **CORS**: Configure CORS properly for your frontend domain

---

## Testing with Swagger UI

The API includes Swagger documentation available at:
- **URL**: `http://localhost:3000/api/docs`

You can test all endpoints directly from the Swagger UI interface.

---

## Support

For issues or questions about the Authentication API, please refer to:
- Backend repository documentation
- Swagger documentation at `/api/docs`
- Contact the development team

