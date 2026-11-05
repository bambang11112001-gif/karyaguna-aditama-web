const express = require('express');
const {
    getGallery,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
} = require('../controllers/galleryController');
const verifyToken = require('../middlewares/authMiddleware');
const createImageUpload = require('../middlewares/productImageUpload');

const router = express.Router();
const uploadGalleryImages = createImageUpload('gallery', {
    multiple: true,
    fieldName: 'images',
    maxFiles: 10
});

router.get('/', verifyToken, getGallery);
router.post('/', verifyToken, uploadGalleryImages, createGalleryItem);
router.put('/:id', verifyToken, uploadGalleryImages, updateGalleryItem);
router.delete('/:id', verifyToken, deleteGalleryItem);

module.exports = router;
