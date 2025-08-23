# Mantra Tracker Backend API Documentation

## Authentication

All API endpoints (except auth endpoints) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt_token"
}
```

### POST /api/auth/login
Login with existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt_token"
}
```

## Mantra Endpoints

### GET /api/mantras
Get all mantras for the authenticated user.

**Response:**
```json
[
  {
    "id": "mantra_id",
    "userId": "user_id",
    "title": "Mantra Title",
    "text": "Mantra text content",
    "goal": 108,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/mantras
Create a new mantra.

**Request Body:**
```json
{
  "title": "New Mantra",
  "text": "Mantra text content",
  "goal": 108
}
```

### PUT /api/mantras/[id]
Update an existing mantra.

**Request Body:**
```json
{
  "title": "Updated Title",
  "text": "Updated text",
  "goal": 54
}
```

### DELETE /api/mantras/[id]
Delete a mantra.

**Response:**
```json
{
  "message": "Mantra deleted successfully"
}
```

## Session Endpoints

### GET /api/sessions
Get all sessions (repetition records) for the authenticated user.

**Response:**
```json
[
  {
    "id": "session_id",
    "userId": "user_id",
    "mantraId": "mantra_id",
    "count": 54,
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/sessions
Record a new mantra session (repetitions).

**Request Body:**
```json
{
  "mantraId": "mantra_id",
  "count": 54,
  "date": "2024-01-01T12:00:00.000Z" // optional, defaults to current time
}
```

## Statistics Endpoints

### GET /api/stats
Get user statistics and analytics.

**Response:**
```json
{
  "totalRepetitions": 1234,
  "totalMantras": 5,
  "activeDays": 30,
  "currentStreak": 7,
  "dailyActivity": [
    {
      "date": "2024-01-01",
      "count": 54
    }
  ]
}
```

## Error Responses

All endpoints may return these error responses:

- **401 Unauthorized**: Missing or invalid JWT token
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Example error response:
```json
{
  "error": "Unauthorized",
  "details": "Invalid token"
}
```

## Environment Variables

Required environment variables:
```
JWT_SECRET=your_super_secure_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```