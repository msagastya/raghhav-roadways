# Public API Endpoints Documentation

## Base URL
```
Development: http://localhost:3001/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication
Public user authentication uses JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <ACCESS_TOKEN>
```

Tokens are also stored in HTTP-only cookies automatically.

---

## Public User Authentication Endpoints

### Register Public User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "fullName": "John Doe"
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

### Login Public User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

### Refresh Access Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response:
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Get Current User Profile
```http
GET /auth/me
Authorization: Bearer <ACCESS_TOKEN>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "mobile": "+91-9876543210",
    "profilePhotoUrl": "https://...",
    "verifiedEmail": true,
    "verifiedPhone": false,
    "createdAt": "2026-04-26T10:00:00Z"
  }
}
```

### Update User Profile
```http
PATCH /auth/update-profile
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "mobile": "+91-9876543210",
  "profilePhotoUrl": "https://..."
}

Response:
{
  "success": true,
  "message": "Profile updated",
  "data": { /* updated user object */ }
}
```

### Change Password
```http
PATCH /auth/change-password
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <ACCESS_TOKEN>

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Ride Endpoints

### Create Ride Request
```http
POST /rides
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "pickupLocation": "Mumbai Central Station",
  "dropoffLocation": "Bandra Worli Sea Link",
  "pickupLat": 18.9676,
  "pickupLng": 72.8194,
  "dropoffLat": 19.0176,
  "dropoffLng": 72.8263,
  "rideType": "economy",
  "scheduledAt": null,
  "notes": "Driver call on arrival"
}

Response:
{
  "success": true,
  "message": "Ride requested",
  "data": {
    "id": 1,
    "userId": 1,
    "status": "requested",
    "estimatedFare": 245.50,
    "pickupLocation": "Mumbai Central Station",
    "dropoffLocation": "Bandra Worli Sea Link",
    "rideType": "economy",
    "createdAt": "2026-04-26T10:00:00Z"
  }
}
```

### Get Ride Details
```http
GET /rides/:rideId
Authorization: Bearer <ACCESS_TOKEN>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "status": "started",
    "actualFare": null,
    "pickupLocation": "Mumbai Central Station",
    "dropoffLocation": "Bandra Worli Sea Link",
    "distanceKm": 15.5,
    "durationMinutes": 28,
    "startedAt": "2026-04-26T10:05:00Z",
    "completedAt": null
  }
}
```

### Get Active Rides
```http
GET /rides/active
Authorization: Bearer <ACCESS_TOKEN>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "started",
      "pickupLocation": "...",
      "dropoffLocation": "...",
      "createdAt": "2026-04-26T10:00:00Z"
    }
  ]
}
```

### Get Ride History
```http
GET /rides/history?page=1&limit=10&status=completed
Authorization: Bearer <ACCESS_TOKEN>

Response:
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": 5,
        "status": "completed",
        "pickupLocation": "...",
        "dropoffLocation": "...",
        "actualFare": 245.50,
        "rating": 5,
        "completedAt": "2026-04-25T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25
    }
  }
}
```

### Update Ride Status (Start/Complete)
```http
PATCH /rides/:rideId/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "status": "started",
  "notes": "Driver arrived"
}

Response:
{
  "success": true,
  "message": "Ride status updated",
  "data": { /* updated ride object */ }
}
```

### Cancel Ride
```http
PATCH /rides/:rideId/cancel
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "reason": "Driver delayed"
}

Response:
{
  "success": true,
  "message": "Ride cancelled"
}
```

---

## Rating Endpoints

### Submit Ride Rating
```http
POST /rides/:rideId/ratings
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "rating": 5,
  "reviewText": "Great experience, professional driver",
  "cleanliness": 5,
  "driverBehavior": 5,
  "safetyRating": 5
}

Response:
{
  "success": true,
  "message": "Rating submitted",
  "data": {
    "id": 1,
    "rideId": 1,
    "rating": 5,
    "reviewText": "Great experience, professional driver",
    "createdAt": "2026-04-26T10:30:00Z"
  }
}
```

### Get Ride Rating
```http
GET /rides/:rideId/ratings
Authorization: Bearer <ACCESS_TOKEN>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "rideId": 1,
    "rating": 5,
    "reviewText": "Great experience, professional driver",
    "cleanliness": 5,
    "driverBehavior": 5,
    "safetyRating": 5,
    "createdAt": "2026-04-26T10:30:00Z"
  }
}
```

---

## Payment Endpoints

### Initialize Razorpay Payment
```http
POST /payments/create-order
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "rideId": 1,
  "amount": 245.50
}

Response:
{
  "success": true,
  "data": {
    "orderId": "order_8YQCrH1zB6HHqD",
    "amount": 24550,
    "currency": "INR",
    "key_id": "rzp_test_1Aa00000000001"
  }
}
```

### Verify Payment
```http
POST /payments/verify
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "rideId": 1,
  "orderId": "order_8YQCrH1zB6HHqD",
  "paymentId": "pay_8YQCrH1zB6HHqD",
  "signature": "aef1a2..."
}

Response:
{
  "success": true,
  "message": "Payment verified",
  "data": {
    "paymentStatus": "completed",
    "amount": 245.50
  }
}
```

---

## Socket.io Events (Real-time)

### User Namespace: `/user/:userId`

**Emitted from Server:**
- `location_update` - Driver location update
  ```json
  {
    "driverId": 1,
    "lat": 19.0176,
    "lng": 72.8263,
    "accuracy": 5,
    "timestamp": 1682049600000
  }
  ```

- `eta_update` - Estimated time of arrival
  ```json
  {
    "rideId": 1,
    "eta": 5,
    "distance": 2.5
  }
  ```

- `status_change` - Ride status changed
  ```json
  {
    "rideId": 1,
    "status": "started",
    "message": "Driver has started the ride"
  }
  ```

- `notification` - Push notification
  ```json
  {
    "type": "ride_accepted",
    "message": "Your ride has been accepted",
    "data": { /* ride data */ }
  }
  ```

**Listened from Client:**
- Connect to namespace: `const socket = io('http://api/user/123')`
- Handle events: `socket.on('location_update', (data) => {})`

---

## Admin Authentication Endpoints

See `ADMIN_AUTHENTICATION_SETUP.md` for admin-specific endpoints.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code",
  "statusCode": 400
}
```

### Common Error Codes
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

All endpoints are rate-limited:
- **General API:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 5 requests per 15 minutes per IP
- **Admin Endpoints:** 50 requests per 15 minutes per admin

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1682049900
```

---

## Request/Response Headers

**Required Headers:**
```
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN> (for protected endpoints)
```

**CORS:**
```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Credentials: true
```

---

## Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123","confirmPassword":"Pass123","fullName":"John"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'

# Get Profile
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Using Postman

1. Create environment variables:
   - `BASE_URL`: http://localhost:3001/api/v1
   - `ACCESS_TOKEN`: (set after login)
   - `REFRESH_TOKEN`: (set after login)

2. Use `{{BASE_URL}}` and `{{ACCESS_TOKEN}}` in requests

3. Add pre-request script for auto token refresh

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-26  
**Status:** Ready for Frontend Implementation
