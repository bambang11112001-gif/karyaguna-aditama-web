const express = require('express');
const { getBusinessFields } = require('../controllers/businessFieldController');

const router = express.Router();

router.get('/', getBusinessFields);

module.exports = router;