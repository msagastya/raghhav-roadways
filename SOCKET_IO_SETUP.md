# Socket.io Real-time Infrastructure Setup

## Overview
Socket.io enables real-time ride tracking, driver location updates, and push notifications for Raghhav Roadways.

## Features
- ✅ Live ride tracking
- ✅ Driver location broadcasting
- ✅ Real-time notifications
- ✅ Automatic reconnection handling
- ✅ Namespace-based separation (users, drivers, admins)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd /Users/msagastya/Desktop/raghhav-roadways/backend
npm install socket.io socket.io-redis redis dotenv express-cors
```

### 2. Create Socket.io Server (`src/socket/index.ts`)

```typescript
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createRedisAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://your-frontend.vercel.app',
      ],
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = verifyToken(token);
      (socket as any).userId = decoded.id;
      (socket as any).role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Namespaces
  setupUserNamespace(io);
  setupDriverNamespace(io);
  setupAdminNamespace(io);

  return io;
}

// User Namespace
function setupUserNamespace(io: SocketIOServer) {
  const users = io.of('/users');

  users.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User ${userId} connected`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Request ride event
    socket.on('ride:request', async (data) => {
      // Handle ride request
      const ride = await createRide(data, userId);

      // Broadcast to available drivers
      io.of('/drivers').emit('ride:available', {
        rideId: ride.id,
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        fare: ride.estimatedFare,
      });

      // Notify user
      socket.emit('ride:created', { rideId: ride.id });
    });

    // Cancel ride
    socket.on('ride:cancel', async (rideId) => {
      await cancelRide(rideId);
      socket.emit('ride:cancelled', { rideId });
      io.of('/drivers').emit('ride:cancelled', { rideId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      socket.leave(`user:${userId}`);
    });
  });
}

// Driver Namespace
function setupDriverNamespace(io: SocketIOServer) {
  const drivers = io.of('/drivers');

  drivers.on('connection', (socket: Socket) => {
    const driverId = (socket as any).userId;
    console.log(`Driver ${driverId} connected`);

    // Join driver-specific room
    socket.join(`driver:${driverId}`);
    
    // Update driver location
    socket.on('location:update', (location) => {
      // Broadcast to riders with active rides
      io.of('/users').emit('driver:location', {
        driverId,
        location,
        timestamp: new Date(),
      });

      // Store in Redis for persistence
      storeDriverLocation(driverId, location);
    });

    // Accept ride
    socket.on('ride:accept', async (rideId) => {
      const ride = await acceptRide(rideId, driverId);
      
      // Notify user
      io.to(`user:${ride.userId}`).emit('driver:assigned', {
        driverId,
        driverName: ride.driver.name,
        driverRating: ride.driver.rating,
        vehicleNumber: ride.driver.vehicle.number,
      });

      // Start tracking
      socket.emit('ride:started', { rideId });
    });

    // Ride completed
    socket.on('ride:complete', async (rideId) => {
      await completeRide(rideId);
      
      // Notify user
      io.to(`ride:${rideId}`).emit('ride:completed', { rideId });
    });

    socket.on('disconnect', () => {
      console.log(`Driver ${driverId} disconnected`);
      socket.leave(`driver:${driverId}`);
      removeDriverLocation(driverId);
    });
  });
}

// Admin Namespace
function setupAdminNamespace(io: SocketIOServer) {
  const admins = io.of('/admin');

  admins.on('connection', (socket: Socket) => {
    console.log('Admin connected');

    // Real-time dashboard updates
    socket.on('dashboard:subscribe', () => {
      // Send live metrics
      setInterval(() => {
        const metrics = getLiveMetrics();
        socket.emit('dashboard:update', metrics);
      }, 5000);
    });

    socket.on('disconnect', () => {
      console.log('Admin disconnected');
    });
  });
}

// Helper functions
function verifyToken(token: string) {
  // Verify JWT token
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function createRide(data: any, userId: string) {
  // Create ride in database
  return await Ride.create({ ...data, userId });
}

async function acceptRide(rideId: string, driverId: string) {
  return await Ride.update(
    { id: rideId },
    { driverId, status: 'ongoing' }
  );
}

async function completeRide(rideId: string) {
  return await Ride.update(
    { id: rideId },
    { status: 'completed', completedAt: new Date() }
  );
}

async function cancelRide(rideId: string) {
  return await Ride.update(
    { id: rideId },
    { status: 'cancelled' }
  );
}

function storeDriverLocation(driverId: string, location: any) {
  // Store in Redis for quick access
  const key = `driver:location:${driverId}`;
  pubClient.setex(key, 3600, JSON.stringify(location));
}

function removeDriverLocation(driverId: string) {
  pubClient.del(`driver:location:${driverId}`);
}

function getLiveMetrics() {
  return {
    activeRides: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    activeUsers: 0,
    timestamp: new Date(),
  };
}
```

### 3. Integrate with Express Server

Update `src/server.ts`:

```typescript
import { setupSocketIO } from './socket';

const app = express();
const httpServer = createServer(app);
const io = setupSocketIO(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Attach io to express for use in routes
app.locals.io = io;
```

---

## Frontend Integration

### 1. Install Socket.io Client

```bash
cd /Users/msagastya/Desktop/raghhav-roadways/frontend
npm install socket.io-client
```

### 2. Create Socket Client Hook

**File: `src/lib/socket-client.ts`**

```typescript
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocketInstance(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      auth: {
        token: localStorage.getItem('authToken'),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

### 3. Use in Components

```typescript
import { useEffect, useState } from 'react';
import { getSocketInstance } from '@/lib/socket-client';

export default function RideTracking({ rideId }: { rideId: string }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const socket = getSocketInstance();

  useEffect(() => {
    // Join ride room
    socket.emit('ride:track', { rideId });

    // Listen for driver location updates
    socket.on('driver:location', (data) => {
      setDriverLocation(data.location);
    });

    return () => {
      socket.off('driver:location');
    };
  }, [rideId, socket]);

  return (
    <div>
      {driverLocation && (
        <Map
          latitude={driverLocation.latitude}
          longitude={driverLocation.longitude}
        />
      )}
    </div>
  );
}
```

---

## React Native Integration

### 1. Install Dependencies

```bash
cd /Users/msagastya/Desktop/raghhav-roadways/mobile
npm install socket.io-client
```

### 2. Socket Service

**File: `src/services/socket.ts`**

```typescript
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

let socket: Socket | null = null;

export async function initializeSocket(apiUrl: string) {
  const token = await SecureStore.getItemAsync('authToken');

  socket = io(apiUrl, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

### 3. Use in Screens

```typescript
import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socket';

export default function RideTrackingScreen() {
  const [driverLocation, setDriverLocation] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('driver:location', (data) => {
      setDriverLocation(data.location);
    });

    return () => {
      socket.off('driver:location');
    };
  }, [socket]);

  return (
    // Render map with driver location
  );
}
```

---

## Testing Socket Events

### Using Socket.io Testing Tools

```bash
# Install socket.io test client
npm install -g socket.io-tester

# Test connection
socket-tester --url http://localhost:3001 --namespace /users --event "ride:request"
```

---

## Environment Variables

Add to `.env`:

```
REDIS_URL=redis://localhost:6379
SOCKET_CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
```

---

## Production Deployment

### 1. Vercel (Backend)
Socket.io works automatically with Vercel serverless via WebSockets

### 2. Redis Cloud Setup
```bash
# Create account at https://redis.com/try-free
# Get connection URL
REDIS_URL=redis://default:password@host:port
```

### 3. Horizontal Scaling
For multiple instances, use Redis adapter:
- All server instances connect to same Redis
- Messages broadcast across all instances
- Clients can connect to any instance

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Check CORS settings and firewall |
| Messages not sending | Verify authentication token |
| Duplicate events | Check event listener registration |
| Memory leak | Properly unsubscribe from events |
| Reconnection issues | Verify Redis connection |

---

## Next Steps

1. ✅ Set up Socket.io server
2. ✅ Integrate with frontend
3. ✅ Test with mobile app
4. ✅ Deploy to production
5. ✅ Monitor performance with Datadog/New Relic
