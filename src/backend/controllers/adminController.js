const adminModel = require('../models/userModel');
const db = require('../config/db'); // Adjust based on your database connection setup


// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, ip_address, balance, trunks FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const updateUserBalance = async (req, res) => {
  const { userId, balance } = req.body;
  const updatedUser = await adminModel.updateUserBalance(userId, balance);
  res.json(updatedUser);
};

const allocateTrunks = async (req, res) => {
  const { userId, trunks } = req.body;
  const updatedUser = await adminModel.allocateTrunks(userId, trunks);
  res.json(updatedUser);
};

const freezeUser = async (req, res) => {
  const { userId } = req.body;
  const frozenUser = await adminModel.freezeUser(userId);
  res.json(frozenUser);
};

module.exports = { updateUserBalance, allocateTrunks, freezeUser , getAllUsers };
