const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const signUp = async (req, res) => {
  const { name, email, password, key, ip_address } = req.body;

  // Check if user already exists
  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Determine role based on key
  const role = key === process.env.ADMIN_KEY ? 'admin' : 'user';

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await userModel.createUser(name, email, hashedPassword, role, ip_address);

  res.status(201).json({ message: 'User created successfully', user: newUser });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const jwt = require('jsonwebtoken');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  

  res.json({ message: 'Login successful', token, user });
};

module.exports = { signUp, signIn };
