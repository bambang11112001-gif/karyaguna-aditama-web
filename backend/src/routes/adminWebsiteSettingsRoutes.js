const express = require('express');
const { getWebsiteSettings, updateWebsiteSettings } = require('../controllers/websiteSettingsController');
const verifyToken = require('../middlewares/authMiddleware');
const createImageUpload = require('../middlewares/productImageUpload');

const router = express.Router();
const uploadWebsiteLogo = createImageUpload('settings');

router.get('/', verifyToken, getWebsiteSettings);
router.put('/', verifyToken, uploadWebsiteLogo, updateWebsiteSettings);

module.exports = router;