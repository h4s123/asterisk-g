const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract token

  if (!token) {
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification failed:', err); // Debug log
      return res.status(403).json({ message: 'Invalid token' });
    }

    console.log('JWT verified, user:', user); // Debug log
    req.user = user; // Attach user to request
    next();
  });
};

module.exports = authenticateJWT;
