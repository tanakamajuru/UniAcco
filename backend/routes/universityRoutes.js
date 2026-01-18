const express = require('express');
const router = express.Router();

const { getUniversities } = require('../controllers/universityController');

router.get('/', getUniversities);

module.exports = router;
