const express = require('express');
const router = express.Router();
const { createMessage } = require('../controllers/contactController');

// Endpoint POST untuk formulir kontak publik
router.post('/', createMessage);

module.exports = router;