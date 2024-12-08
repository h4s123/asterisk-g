const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const router = express.Router();

const authenticateJWT = require('../middlewares/authMiddleware');
router.get('/profile', authenticateJWT, getUserProfile);


module.exports = router;
