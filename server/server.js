const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./src/routes/users");
const authRoutes = require("./src/routes/auth");
const shopRoutes = require("./src/routes/shop");
const adminRoutes = require("./src/routes/admin");
const astrologersRouter = require('./src/routes/astrologers');
const superAdminRoutes = require("./src/routes/superadmin");
const setupSocket = require("./socket/socket");
const chatRoutes = require('./src/routes/chatRoutes');
const consultationRoutes = require('./src/routes/consultations');
const ordersRoutes = require('./src/routes/orders');
const setupCallWebSocket = require('./src/routes/CallRoutes');
dotenv.config();

const app = express();
const server = require('http').createServer(app);

// Validating environment variables
const requiredEnvVars = ['MONGODB_URI', 'CORS_ORIGIN', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Check for optional environment variables
const optionalEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
for (const envVar of optionalEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Optional environment variable ${envVar} is not set. Payment features will be limited.`);
  }
}

// Define allowed origins
const allowedOrigins = [
  'https://astroalert-one.vercel.app',
  'https://astroalert.vercel.app',
  'https://astroalert-local.vercel.app',
  'https://astroalert-backend-m1hn.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Update CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === origin.replace(/\/$/, ''))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.sendStatus(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // Logging can be enabled if needed
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB", process.env.MONGODB_URI))
.catch((err) => console.error("Failed to connect to MongoDB", err));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize Socket.IO for chat FIRST
const io = setupSocket(server);
console.log('🟢 Socket.IO server initialized for chat');

// Initialize WebSocket for video calls
const wss = setupCallWebSocket(server);
console.log('🟢 WebSocket server initialized for video calls');

// Add WebSocket upgrade handler with logging
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  console.log('WebSocket upgrade request:', {
    pathname,
    origin: request.headers.origin,
    host: request.headers.host
  });

  // If the path is /socket.io, let Socket.IO handle it
  if (pathname.startsWith('/socket.io')) {
    // Socket.IO will handle its own upgrade
    return;
  }
  
  // Handle video call WebSocket
  if (pathname === '/calls') {
    // Add CORS check for WebSocket connections
    const origin = request.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('WebSocket connection established for /calls');
        wss.emit('connection', ws, request);
      });
    } else {
      console.log('WebSocket connection rejected - origin not allowed:', origin);
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
    }
  } else {
    console.log('Invalid WebSocket path:', pathname);
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
  }
});

app.use('/api/users', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/astrologers', astrologersRouter);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/orders', ordersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Something broke!' 
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(`🟢 Socket.IO server running on /socket.io`);
  console.log(`🟢 WebSocket server running on /calls`);
});

// Heartbeat check for WebSocket connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.isAlive === false) return client.terminate();
    client.isAlive = false;
    client.ping();
  });
}, 30000);

// Cleanup on server shutdown
server.on('close', () => {
  clearInterval(heartbeatInterval);
});