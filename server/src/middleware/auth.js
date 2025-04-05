const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  console.log("🛑 Checking Admin Role:", req.user);  // 🔍 Debug log

  if (!req.user) {
    console.log("❌ req.user is undefined in isAdmin");
    return res.status(401).json({ error: 'Unauthorized. User not found.' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    console.log("❌ Access Denied. User is not an admin.");
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  console.log("✅ User is Admin");
  next();
};

const isSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. User not found.' });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. SuperAdmin only.' });
  }

  next();
};

function hasRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Add WebSocket authentication middleware
const authenticateWsConnection = (request, socket, head) => {
  try {
    const token = request.headers['sec-websocket-protocol'];
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    // Verify token and allow connection
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return false;
  }
};

module.exports = { authenticateToken, isAdmin, isSuperAdmin, hasRole, authenticateWsConnection };