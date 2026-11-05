const express = require('express');
const { getCompanyProfile } = require('../controllers/companyProfileController');

const router = express.Router();

router.get('/', getCompanyProfile);

module.exports = router;
