const express = require('express');
const { getAvailableTrunks } = require('../controllers/trunkController');
const router = express.Router();

router.get('/', getAvailableTrunks);

module.exports = router;
