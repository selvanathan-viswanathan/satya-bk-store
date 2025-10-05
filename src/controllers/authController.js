const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SalesPerson = require('../models/SalesPerson');
const logger = require('../logger');

const SALT_ROUNDS = 10;

exports.signup = async (req, res, next) => {
  try {
    const { username, password, firstName, lastName, phoneNumber, address, storeId } = req.body;
    if (!username || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await SalesPerson.findOne({ username });
    if (existing) return res.status(409).json({ message: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const sp = new SalesPerson({
      username, passwordHash, firstName, lastName, phoneNumber, address,
      store: storeId // optional link
    });

    await sp.save();
    logger.info('SalesPerson created', { username: sp.username, id: sp._id });
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing username or password' });

    const user = await SalesPerson.findOne({ username });
    if (!user || user.isDeleted) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    logger.info('SalesPerson logged in', { username: user.username, id: user._id });
    res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  } catch (err) {
    next(err);
  }
};
