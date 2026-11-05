const express = require('express');
const {
    getCompanyProfile,
    updateCompanyProfile
} = require('../controllers/companyProfileController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getCompanyProfile);
router.put('/', verifyToken, updateCompanyProfile);

module.exports = router;
