const express = require('express');
const {
    getAdminHeroSlides,
    createHeroSlide,
    deleteHeroSlide
} = require('../controllers/heroController');
const verifyToken = require('../middlewares/authMiddleware');
const createImageUpload = require('../middlewares/productImageUpload');

const router = express.Router();
const uploadHeroImage = createImageUpload('hero');

router.get('/', verifyToken, getAdminHeroSlides);
router.post('/', verifyToken, uploadHeroImage, createHeroSlide);
router.delete('/:id', verifyToken, deleteHeroSlide);

module.exports = router;
