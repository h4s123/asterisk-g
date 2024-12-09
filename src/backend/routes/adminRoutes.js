const express = require('express');
const { updateUserBalance, allocateTrunks, freezeUser, getAllUsers } = require('../controllers/adminController');
const router = express.Router();

router.get('/users', getAllUsers);
router.put('/update-balance', updateUserBalance);
router.put('/allocate-trunks', allocateTrunks);
router.put('/freeze-user', freezeUser);

module.exports = router;
