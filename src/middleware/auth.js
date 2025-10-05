const jwt = require('jsonwebtoken');
const SalesPerson = require('../models/SalesPerson');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid Authorization header' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user to request
    const user = await SalesPerson.findById(payload.id);
    if (!user || user.isDeleted) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
