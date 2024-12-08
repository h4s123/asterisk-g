const userModel = require('../models/userModel');

// const getUserProfile = async (req, res) => {
//   const { userId } = req.user; // Assuming user is added to request by middleware
//   const user = await userModel.getUserByEmail(userId);
//   res.json(user);
// };

// const getUserProfile = (req, res) => {
//   try {
//     const { userId, role } = req.user; // Access userId and role from req.user
//     console.log('User ID:', userId);
//     console.log('User Role:', role);

//     // Add logic to fetch the user profile or data from the database
//     res.json({ message: 'User data retrieved successfully', user: req.user });
//   } catch (error) {
//     console.error('Error in getUserProfile:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };


const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user; // Extract userId from token
    const user = await userModel.getUserById(userId); // Ensure this function exists in your model

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User data retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { getUserProfile };
