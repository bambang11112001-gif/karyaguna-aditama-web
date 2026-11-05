const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { createDefaultAdmin } = require('../controllers/setupController');

router.post('/login', login);
router.get('/setup-admin', createDefaultAdmin); // Route pemicu otomatis

module.exports = router;