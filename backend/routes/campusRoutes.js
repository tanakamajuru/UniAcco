const express = require('express');
const router = express.Router();

const { getCampuses } = require('../controllers/campusController');

router.get('/', getCampuses);

module.exports = router;
