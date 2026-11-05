const express = require('express');
const { getWebsiteSettings } = require('../controllers/websiteSettingsController');

const router = express.Router();

router.get('/', getWebsiteSettings);

module.exports = router;