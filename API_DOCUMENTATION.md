# Raghhav Roadways API Documentation

**Base URL**: `https://raghhav-roadways.onrender.com/api/v1`  
**Version**: 1.0.0  
**Last Updated**: April 2026

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
3. [Ride Endpoints](#ride-endpoints)
4. [Wallet Endpoints](#wallet-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

### JWT Authentication
All endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Login Endpoint
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210"
  }
}
```

### Register Endpoint
**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "phone": "9876543210"
}
```

Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Endpoints

### Get User Profile
**GET** `/users/profile`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "profile": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "New Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "verified": true,
    "totalRides": 25,
    "averageRating": 4.8,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

### Update User Profile
**PUT** `/users/profile`

Request:
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "address": "123 New Street",
  "city": "New Delhi",
  "state": "Delhi",
  "zipCode": "110001"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

### Change Password
**POST** `/users/change-password`

Request:
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Ride Endpoints

### Book a Ride
**POST** `/rides/book`

Request:
```json
{
  "pickupLocation": "123 Main St, Delhi",
  "pickupCoordinates": [28.6139, 77.2090],
  "dropLocation": "Airport, Delhi",
  "dropCoordinates": [28.5562, 77.1000],
  "rideType": "economy",
  "paymentMethod": "wallet"
}
```

Response (201):
```json
{
  "success": true,
  "ride": {
    "id": "ride_123",
    "userId": "user_123",
    "pickupLocation": "123 Main St, Delhi",
    "dropLocation": "Airport, Delhi",
    "rideType": "economy",
    "estimatedFare": 450,
    "estimatedDuration": 25,
    "estimatedDistance": 15.5,
    "status": "waiting_for_driver",
    "createdAt": "2026-04-26T14:30:00Z"
  }
}
```

### Get Ride Details
**GET** `/rides/{rideId}`

Response (200):
```json
{
  "success": true,
  "ride": {
    "id": "ride_123",
    "status": "ongoing",
    "driver": {
      "id": "driver_456",
      "name": "Ahmed Khan",
      "phone": "9876543210",
      "rating": 4.9,
      "vehicle": {
        "type": "Swift",
        "number": "DL01AB1234",
        "color": "Silver"
      }
    },
    "fare": 450,
    "distance": 15.5,
    "duration": 25,
    "startTime": "2026-04-26T14:30:00Z",
    "endTime": null
  }
}
```

### Get Ride History
**GET** `/rides/history?page=1&limit=10`

Response (200):
```json
{
  "success": true,
  "rides": [
    {
      "id": "ride_123",
      "pickupLocation": "Home",
      "dropLocation": "Airport",
      "rideType": "economy",
      "fare": 450,
      "status": "completed",
      "createdAt": "2026-04-26T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Cancel Ride
**POST** `/rides/{rideId}/cancel`

Request:
```json
{
  "reason": "Found another ride"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Ride cancelled successfully",
  "ride": { ... }
}
```

### Rate Ride
**POST** `/rides/{rideId}/rating`

Request:
```json
{
  "rating": 5,
  "review": "Great driver, very professional",
  "tags": ["cleanliness", "safety", "friendliness"]
}
```

Response (200):
```json
{
  "success": true,
  "message": "Rating submitted successfully"
}
```

---

## Wallet Endpoints

### Get Wallet Balance
**GET** `/wallet`

Response (200):
```json
{
  "success": true,
  "wallet": {
    "id": "wallet_123",
    "userId": "user_123",
    "balance": 5000,
    "currency": "INR",
    "lastUpdated": "2026-04-26T14:30:00Z",
    "isActive": true
  }
}
```

### Add Funds to Wallet
**POST** `/wallet/add-funds`

Request:
```json
{
  "amount": 1000,
  "paymentMethod": "card"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Payment initiated",
  "paymentUrl": "https://payment-gateway.com/pay/...",
  "orderId": "order_123"
}
```

### Get Transaction History
**GET** `/wallet/transactions?page=1&limit=20`

Response (200):
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn_123",
      "type": "debit",
      "amount": 450,
      "description": "Ride #ride_123",
      "status": "completed",
      "timestamp": "2026-04-26T14:30:00Z",
      "rideId": "ride_123"
    }
  ],
  "pagination": { ... }
}
```

### Get Payment Methods
**GET** `/wallet/payment-methods`

Response (200):
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": "pm_123",
      "type": "card",
      "name": "Visa",
      "lastFourDigits": "4242",
      "isDefault": true,
      "expiryDate": "12/26"
    }
  ]
}
```

---

## Admin Endpoints

### Admin Login
**POST** `/admin/auth/login`

Request:
```json
{
  "adminId": "admin_001",
  "password": "AdminPassword123"
}
```

Response (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin_001",
    "name": "Admin User",
    "email": "admin@raghhav.com",
    "role": "super_admin"
  }
}
```

### Get Dashboard Metrics
**GET** `/admin/dashboard/metrics`

Response (200):
```json
{
  "success": true,
  "metrics": {
    "totalRides": 1250,
    "completedRides": 1200,
    "cancelledRides": 50,
    "totalRevenue": 562500,
    "averageFare": 450,
    "activeUsers": 325,
    "activeDrivers": 85,
    "newUsersThisMonth": 42,
    "systemUptime": 99.98
  }
}
```

### Get All Rides (Admin)
**GET** `/admin/rides?page=1&limit=50&status=completed`

Response (200):
```json
{
  "success": true,
  "rides": [
    {
      "id": "ride_123",
      "userId": "user_123",
      "driverId": "driver_456",
      "fare": 450,
      "status": "completed",
      "createdAt": "2026-04-26T14:30:00Z",
      "user": { ... },
      "driver": { ... }
    }
  ],
  "pagination": { ... }
}
```

### Get All Users (Admin)
**GET** `/admin/users?page=1&limit=50&status=active`

Response (200):
```json
{
  "success": true,
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "user@example.com",
      "status": "active",
      "totalRides": 25,
      "totalSpent": 11250,
      "averageRating": 4.8,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Ban User
**POST** `/admin/users/{userId}/ban`

Request:
```json
{
  "reason": "Abusive behavior",
  "duration": "permanent"
}
```

Response (200):
```json
{
  "success": true,
  "message": "User banned successfully"
}
```

### Export Data
**GET** `/admin/rides/export?format=csv&dateFrom=2026-04-01&dateTo=2026-04-30`

Response:
- File download (CSV/Excel format)

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email already exists",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_INPUT` | 400 | Invalid request parameters |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

### Limits
- **Anonymous**: 100 requests/hour
- **Authenticated User**: 1000 requests/hour
- **Admin**: 5000 requests/hour

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1619520000
```

---

## Webhooks (Optional)

### Ride Completed Event
```
POST https://your-webhook-url.com/rides/completed

{
  "event": "ride.completed",
  "timestamp": "2026-04-26T14:30:00Z",
  "data": {
    "rideId": "ride_123",
    "userId": "user_123",
    "driverId": "driver_456",
    "fare": 450
  }
}
```

---

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://raghhav-roadways.onrender.com/api/v1',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Book a ride
const ride = await client.post('/rides/book', {
  pickupLocation: '123 Main St',
  dropLocation: 'Airport',
  rideType: 'economy'
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}'
}

response = requests.post(
    'https://raghhav-roadways.onrender.com/api/v1/rides/book',
    json={
        'pickupLocation': '123 Main St',
        'dropLocation': 'Airport',
        'rideType': 'economy'
    },
    headers=headers
)
```

### cURL
```bash
curl -X POST https://raghhav-roadways.onrender.com/api/v1/rides/book \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": "123 Main St",
    "dropLocation": "Airport",
    "rideType": "economy"
  }'
```

---

## Support

For API support:
- Email: api-support@raghhav-roadways.com
- Docs: https://docs.raghhav-roadways.com
- Issues: https://github.com/raghhav/roadways/issues
