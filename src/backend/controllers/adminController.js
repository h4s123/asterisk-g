const adminModel = require('../models/userModel');

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

module.exports = { updateUserBalance, allocateTrunks, freezeUser };
